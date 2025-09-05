// middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticateUser = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in cookies first, then authorization header
    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please login to access this resource' 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      req.user = user.toObject();
      req.user.userId = user._id;
      next();
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.type)) {
      return res.status(403).json({ 
        success: false,
        message: 'You are not authorized to access this resource' 
      });
    }
    next();
  };
};

module.exports = {
  auth: authenticateUser,
  authRole: authorizeRoles
};