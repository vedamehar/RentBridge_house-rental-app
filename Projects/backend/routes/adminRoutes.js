const express = require('express');
const router = express.Router();
const { auth, authRole } = require('../middlewares/auth');
const adminController = require('../controllers/adminController');

// Dashboard stats
router.get('/stats', auth, authRole('admin'), adminController.getDashboardStats);

// User management
router.get('/users', auth, authRole('admin'), adminController.getAllUsers);
router.delete('/users/:id', auth, authRole('admin'), adminController.deleteUser);

// Property management
router.get('/properties', auth, authRole('admin'), adminController.getAllProperties);
router.delete('/properties/:id', auth, authRole('admin'), adminController.deleteProperty);

// Booking management
router.get('/bookings', auth, authRole('admin'), adminController.getAllBookings);
router.delete('/bookings/:id', auth, authRole('admin'), adminController.cancelBooking);

// Contact management
router.get('/contacts', auth, authRole('admin'), adminController.getAllContacts);
router.patch('/contacts/:id/status', auth, authRole('admin'), adminController.updateContactStatus);
router.delete('/contacts/:id', auth, authRole('admin'), adminController.deleteContact);

module.exports = router;