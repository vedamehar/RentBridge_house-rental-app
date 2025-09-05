// controllers/bookingController.js
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/user');

const  getUserBookings = async (req, res) => {
  try {
      const bookings = await Booking.find({
        userId: req.params.userId,
        status: 'approved'
    })
    .populate('propertyId', 'title location images rent');
    
    res.json({ success: true, bookings });
  } catch (err) {
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

    // Check if user already has a booking for this property
    const existingBooking = await Booking.findOne({
      propertyId: req.body.propertyId,
      userId: req.user._id,
      status: { $in: ['pending', 'approved', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have a booking for this property'
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
      propertyName: property.title || property.prop_address,
      status: "approved"  // Direct approval instead of confirmed
    });

    await booking.save();
    
    // Update property status to booked
    property.status = 'booked';
    await property.save();
    
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



module.exports = {
  getUserBookings,
  createBooking,      // Added
  requestBooking,
  addMessage,
  getOwnerBookings,
  approveBooking,
  rejectBooking,
  getAllBookings
};