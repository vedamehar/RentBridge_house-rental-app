const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { auth } = require('../middlewares/auth');

// Apply auth middleware to all routes except the following
router.get('/', propertyController.getAllProperties); // Public GET
router.get('/owner', auth, propertyController.getMyProperties); // Protected GET for owner
router.post('/', auth, propertyController.addProperty); // Protected POST for adding property

// Parameterized routes come AFTER specific routes
router.get('/:id', propertyController.getPropertyById);
router.put('/:id', auth, propertyController.updateProperty);
router.patch('/:id/status', auth, propertyController.updatePropertyStatus);
router.delete('/:id', auth, propertyController.deleteProperty);
router.post('/:id/book', auth, propertyController.requestBooking);
router.put('/:propertyId/bookings/:requestId', auth, propertyController.updateBookingStatus);


// Favorite routes
router.post('/:id/favorite', auth, propertyController.toggleFavorite);
router.get('/wishlist/:userId', auth, propertyController.getUserFavorites);


module.exports = router;