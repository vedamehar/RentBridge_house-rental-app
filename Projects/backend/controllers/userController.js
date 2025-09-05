// controllers/userController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Property = require('../models/Property');
const Booking = require('../models/Booking');

// Password salt rounds
const SALT_ROUNDS = 10;

/**
 * Register a new user
 */
const registerUser = async (req, res) => {
  const { name, email, password, role, phone } = req.body; // Changed 'type' to 'role'

  try {
    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide all required fields" 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "User already exists with this email" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = new User({
      userId: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      type: role, // Map role to type field
      phone: phone || null
    });

    await user.save();

    // Create token
    const token = jwt.sign({ 
      id: user._id,
      role: user.type
    }, process.env.JWT_SECRET, { 
      expiresIn: process.env.JWT_EXPIRE || '7d' 
    });

    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ 
      success: true,
      token,
      user: userResponse 
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error during registration",
      error: err.message 
    });
  }
};

/**
 * Login user
 */
const loginUser = async (req, res) => {
    const { email, password, role } = req.body; // Use 'role' instead of 'role
    console.log(email, password, role);
  try {
    // Validate input
    if (!email || !password || !role) {
      // Detailed error message
      const missingFields = [];
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      if (!role) missingFields.push('role');
      return res.status(400).json({ 
        success: false,
        message: `Please provide the following fields: ${missingFields.join(', ')}`
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    console.log(user.password, password)
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: `Invalid credentials for ${role} role` 
      });
    }

    // Create token with role information
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.type 
      }, 
      process.env.JWT_SECRET, 
      { 
        expiresIn: process.env.JWT_EXPIRE || '7d' 
      }
    );

    // Set token in HTTP-only cookie for cross-domain
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ 
      success: true,
      token,
      user: userResponse 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error during login",
      error: err.message 
    });
  }
};

/**
 * Get current user profile
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('favorites', 'title prop_address prop_images prop_amt');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.json({ 
      success: true,
      user 
    });

  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error fetching profile",
      error: err.message 
    });
  }
};

/**
 * Get all users (Admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ 
      success: true,
      count: users.length,
      users 
    });

  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error fetching users",
      error: err.message 
    });
  }
};

/**
 * Update user profile
 */
const updateUser = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (phone) updates.phone = phone;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ 
      success: true,
      user 
    });

  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error updating profile",
      error: err.message 
    });
  }
};

/**
 * Add property to favorites
 */
const addFavorite = async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) {
      return res.status(404).json({ 
        success: false,
        message: "Property not found" 
      });
    }

    const user = await User.findById(req.user._id);
    if (user.favorites.includes(req.params.propertyId)) {
      return res.status(400).json({ 
        success: false,
        message: "Property already in favorites" 
      });
    }

    user.favorites.push(req.params.propertyId);
    await user.save();

    res.json({ 
      success: true,
      message: "Property added to favorites" 
    });

  } catch (err) {
    console.error('Add favorite error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error adding favorite",
      error: err.message 
    });
  }
};

/**
 * Remove property from favorites
 */
const removeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.favorites = user.favorites.filter(
      fav => fav.toString() !== req.params.propertyId
    );
    await user.save();

    res.json({ 
      success: true,
      message: "Property removed from favorites" 
    });

  } catch (err) {
    console.error('Remove favorite error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error removing favorite",
      error: err.message 
    });
  }
};

const getUserFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('favorites', 'title prop_address prop_images prop_amt');
    
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
      message: "Server error fetching favorites",
      error: err.message 
    });
  }
};

// Get user wishlist
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('favorites', 'title location images rent');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.json({ 
      success: true,
      wishlist: user.favorites 
    });
  } catch (err) {
    console.error('Get wishlist error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error fetching wishlist",
      error: err.message 
    });
  }
};

// Updated logout function
const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now()),
    httpOnly: true
  });
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  updateUser,
  addFavorite,
  removeFavorite,
  getUserFavorites,
  logout
};