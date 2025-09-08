// controllers/bookingController.js
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/user');

const  getUserBookings = async (req, res) => {
  try {
      // Get bookings with any status (including cancelled for history)
      const bookings = await Booking.find({
        userId: req.params.userId,
        status: { $in: ['approved', 'pending', 'confirmed', 'cancelled'] }
    })
    .populate('propertyId', 'title prop_address location prop_amt prop_images')
    .populate('ownerId', 'name email')
    .sort({ createdAt: -1 }); // Sort by newest first
    
    console.log(`Found ${bookings.length} bookings for user ${req.params.userId}`);
    res.json({ success: true, bookings });
  } catch (err) {
    console.error('Error in getUserBookings:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const addMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.messages.push({
      senderId: req.user._id,
      senderName: req.user.name,
      content
    });
    await booking.save();

    res.json({ message: 'Message added successfully', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// In bookingController.js
const requestBooking = async (req, res) => {
  try {
    const property = await Property.findById(req.body.propertyId).populate('userId');
    if (!property) {
      return res.status(404).json({ 
        success: false,
        message: 'Property not found' 
      });
    }

    if (property.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Property is not available for booking'
      });
    }

    // Check if user already has a booking for this property
    const existingBooking = await Booking.findOne({
      propertyId: req.body.propertyId,
      userId: req.user._id,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have a booking for this property'
      });
    }

    // Create booking with auto-populated fields
    const booking = new Booking({
      ...req.body,
      bookingId: `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      userId: req.user._id,
      userName: req.user.name || req.body.userName,
      ownerId: property.userId._id,
      ownerName: property.userId.name || req.body.ownerName,
      propertyName: property.title || property.prop_address,
      status: "pending"
    });

    await booking.save();
    
    // Update property status
    property.status = 'pending';
    await property.save();
    
    res.status(201).json({
      success: true,
      booking
    });

  } catch (err) {
    console.error('Booking creation error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create booking',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Direct booking creation (for confirmed bookings without approval process)
const createBooking = async (req, res) => {
  try {
    const property = await Property.findById(req.body.propertyId).populate('userId');
    if (!property) {
      return res.status(404).json({ 
        success: false,
        message: 'Property not found' 
      });
    }

    if (property.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Property is not available for booking'
      });
    }

    // Check if user already has an active booking for this property
    const existingBooking = await Booking.findOne({
      propertyId: req.body.propertyId,
      userId: req.user._id,
      status: { $in: ['pending', 'approved'] } // Only check for active bookings
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active booking for this property'
      });
    }

    // Create confirmed booking
    const booking = new Booking({
      ...req.body,
      bookingId: `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      userId: req.user._id,
      userName: req.user.name || req.body.userName,
      ownerId: property.userId._id,
      ownerName: property.userId.name || req.body.ownerName,
      propertyName: property.title || property.prop_address || `Property ${property._id}`,
      status: "approved"  // Direct approval instead of confirmed
    });

    await booking.save();
    
    // Update property status to booked using findByIdAndUpdate to avoid validation issues
    await Property.findByIdAndUpdate(
      req.body.propertyId, 
      { status: 'booked' },
      { runValidators: false } // Skip validation for this update
    );
    
    res.status(201).json({
      success: true,
      booking
    });

  } catch (err) {
    console.error('Direct booking creation error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create booking',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ ownerId: req.user._id })
      .populate('propertyId')
      .populate('userId');
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add these functions
const approveBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify owner
    if (booking.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update booking status
    booking.status = 'approved';
    await booking.save();

    // Update property status
    await Property.findByIdAndUpdate(
      booking.propertyId,
      { status: 'booked' },
      { new: true }
    );

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const rejectBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify owner
    if (booking.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update booking status
    booking.status = 'rejected';
    await booking.save();

    // Update property status
    await Property.findByIdAndUpdate(
      booking.propertyId,
      { status: 'available' },
      { new: true }
    );

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all bookings (Admin only)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email phone')
      .populate('propertyId', 'title prop_address prop_amt')
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      data: bookings 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Cancel booking (for renters)
const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify the booking belongs to the user requesting cancellation
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    // Check if booking can be cancelled (only pending or approved bookings)
    if (!['pending', 'approved'].includes(booking.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot cancel booking with current status' 
      });
    }

    // Update booking status to cancelled
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || 'Cancelled by renter';
    await booking.save();

    // Make property available again
    await Property.findByIdAndUpdate(
      booking.propertyId,
      { status: 'available' },
      { new: true }
    );

    res.json({ 
      success: true, 
      message: 'Booking cancelled successfully',
      booking 
    });
  } catch (err) {
    console.error('Booking cancellation error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel booking',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Helper function to fix bookings with missing property names
const fixBookingPropertyNames = async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      $or: [
        { propertyName: { $exists: false } },
        { propertyName: '' },
        { propertyName: null }
      ]
    }).populate('propertyId');

    let updated = 0;
    for (const booking of bookings) {
      if (booking.propertyId) {
        booking.propertyName = booking.propertyId.title || booking.propertyId.prop_address || `Property ${booking.propertyId._id}`;
        await booking.save();
        updated++;
      }
    }

    res.json({ 
      success: true, 
      message: `Fixed ${updated} bookings with missing property names` 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};


module.exports = {
  getUserBookings,
  createBooking,      // Added
  requestBooking,
  addMessage,
  getOwnerBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,      // Added for renter cancellation
  getAllBookings,
  fixBookingPropertyNames  // Added for fixing existing data
};