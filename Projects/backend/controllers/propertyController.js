// controllers/bookingController.js
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/user');
const mongoose = require('mongoose');

const  getUserBookings = async (req, res) => {
  try {
    let query = {};
    if (req.user.type === 'renter') {
      query.userId = req.user._id;
    } else if (req.user.type === 'owner') {
      query.ownerId = req.user._id;
    }

    const bookings = await Booking.find(query)
      .populate('propertyId', 'title prop_address prop_images')
      .populate('userId', 'name email phone')
      .populate('ownerId', 'name email phone');

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Add this function to get all properties
const getAllProperties = async (req, res) => {
  try {
    // Extract location query parameter
    const location = req.query.location;
    
    // Build query object
    const query = {};
    if (location) {
      // Case-insensitive location search
      query.prop_address = { $regex: new RegExp(location, 'i') };
    }

    // Add status filter to only show available properties
    query.status = 'available';

    const properties = await Property.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (err) {
    console.error('Error fetching properties:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

const addProperty = async (req, res) => {
  try {
    const {
      title,
      prop_type,
      prop_address,
      location = {},
      owner_contact = '',
      prop_amt = 0,
      prop_images = [],
      status = 'available',
      prop_ad_type = '',
      ad_info = ''
    } = req.body;

    // Validate required fields
    if (!title || !prop_type || !prop_address) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Validate prop_images array
    const validImages = Array.isArray(prop_images)
      ? prop_images.filter(img => typeof img === 'string' && (img.startsWith('data:image') || img.startsWith('http')))
      : [];

    const property = new Property({
      propertyId: new mongoose.Types.ObjectId().toString(), // Generate unique propertyId
      title,
      prop_type,
      prop_address,
      location,
      owner_contact,
      prop_amt,
      prop_images: validImages,
      status,
      prop_ad_type,
      ad_info,
      userId: req.user?._id // <-- use userId instead of owner
    });

    await property.save();
    res.status(201).json({ success: true, property });
  } catch (error) {
    console.error('Add property error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single property by ID
const getPropertyById = async (req, res) => {
  try {
    // Try lookup by MongoDB _id first
    let property = await Property.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('reviews.userId', 'name');

    // If not found, try lookup by custom propertyId
    if (!property) {
      property = await Property.findOne({ propertyId: req.params.id })
        .populate('userId', 'name email phone')
        .populate('reviews.userId', 'name');
    }

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    // Check if current user has favorited this property
    let isFavorite = false;
    if (req.user) {
      try {
        const user = await User.findById(req.user._id);
        if (user && Array.isArray(user.favorites)) {
          isFavorite = user.favorites.includes(property._id);
        }
      } catch (userErr) {
        // Log but don't fail the property details if user lookup fails
        console.error('User lookup error:', userErr);
      }
    }

    // Calculate average rating
    let avgRating = 0;
    if (property.reviews.length > 0) {
      const total = property.reviews.reduce((sum, review) => sum + review.rating, 0);
      avgRating = total / property.reviews.length;
    }

    // Prepare response
    const propertyResponse = {
      ...property.toObject(),
      avgRating: avgRating.toFixed(1),
      isFavorite
    };

    res.json({
      success: true,
      property: propertyResponse
    });
  } catch (err) {
    console.error('Get property error:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID format"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error fetching property",
      error: err.message
    });
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

// Complete booking implementation
const requestBooking = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const { userId, userName, startDate, endDate } = req.body;

    // Find property
    const property = await Property.findById(propertyId);
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

    // Create new booking
    const booking = new Booking({
      propertyId: property._id,
      userId,
      ownerId: property.userId,
      userName,
      ownerName: property.ownerName || 'Property Owner',
      propertyName: property.title || property.prop_address,
      status: "pending",
      startDate,
      endDate
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

const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Prevent changing protected fields
    delete updates.userId;
    delete updates.ownerName;
    delete updates.status;
    delete updates.createdAt;

    // Validate property exists
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    // Check ownership
    if (property.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this property"
      });
    }

    // Apply updates
    Object.keys(updates).forEach(key => {
      property[key] = updates[key];
    });

    await property.save();

    res.json({
      success: true,
      message: "Property updated successfully",
      property
    });
  } catch (err) {
    console.error('Update property error:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID format"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error updating property",
      error: err.message
    });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    // Check ownership
    if (property.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this property"
      });
    }

    await Property.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: "Property deleted successfully"
    });
  } catch (err) {
    console.error('Delete property error:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID format"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error deleting property",
      error: err.message
    });
  }
};

// Update booking status (owner-only action)
const updateBookingStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    // Validate required input
    if (!status || !['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'confirmed' or 'cancelled'"
      });
    }

    // Find booking
    const booking = await Booking.findById(requestId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Verify current user is the property owner
    if (booking.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this booking"
      });
    }

    // Update booking status
    booking.status = status;
    await booking.save();

    // Update property status accordingly
    const property = await Property.findById(booking.propertyId);
    if (property) {
      property.status = status === 'confirmed' ? 'booked' : 'available';
      await property.save();
    }

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking
    });

  } catch (err) {
    console.error('Update booking error:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error updating booking status",
      error: err.message
    });
  }
};

const getMyProperties = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not authenticated' });
    }
    const properties = await Property.find({ owner: req.user._id });
    res.status(200).json({ success: true, properties });
  } catch (error) {
    console.error('getMyProperties error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Toggle favorite status for a property
const toggleFavorite = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user._id;
    
    // Validate property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if property is already favorited
    const isFavorite = user.favorites.includes(propertyId);
    
    if (isFavorite) {
      // Remove favorite
      user.favorites = user.favorites.filter(
        fav => fav.toString() !== propertyId
      );
      await user.save();
      
      return res.json({
        success: true,
        message: "Property removed from favorites",
        isFavorite: false
      });
    } else {
      // Add favorite
      user.favorites.push(propertyId);
      await user.save();
      
      return res.json({
        success: true,
        message: "Property added to favorites",
        isFavorite: true
      });
    }
  } catch (err) {
    console.error('Toggle favorite error:', err);
    res.status(500).json({
      success: false,
      message: "Server error toggling favorite",
      error: err.message
    });
  }
};

// Get user's favorite properties
const getUserFavorites = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate('favorites');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      favorites: user.favorites
    });
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json({
      success: false,
      message: "Server error getting favorites",
      error: err.message
    });
  }
};

// Add to exports
module.exports = {
  getAllProperties,
  addProperty,
  getPropertyById,
  updateProperty,  // Added
  deleteProperty,   // Added
  getMyProperties, // Added
  getUserBookings,
  addMessage,
  requestBooking ,
  updateBookingStatus,
  toggleFavorite,
  getUserFavorites  // ... other exports ...
};

