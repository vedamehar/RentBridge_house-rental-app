// middlewares/roleMiddleware.js
const User = require('../Schemas/user');

/**
 * Middleware to authorize user roles
 * @param {...String} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Ensure user is authenticated first
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: "Unauthorized: Please authenticate first" 
        });
      }

      // Check if user has one of the allowed roles
      if (!allowedRoles.includes(req.user.type)) {
        return res.status(403).json({ 
          success: false,
          message: "Forbidden: You don't have permission to access this resource" 
        });
      }

      // For owner-specific actions, verify ownership if ID is in params
      if (req.params.userId && req.user.type === 'owner') {
        if (req.params.userId !== req.user._id.toString()) {
          return res.status(403).json({ 
            success: false,
            message: "Forbidden: You can only access your own resources" 
          });
        }
      }

      next();
    } catch (err) {
      console.error('Role middleware error:', err);
      res.status(500).json({ 
        success: false,
        message: "Internal server error during authorization" 
      });
    }
  };
};

module.exports = authorizeRoles;