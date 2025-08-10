const express = require('express');
const router = express.Router();
const { auth, authRole } = require('../middlewares/auth');
const adminController = require('../controllers/adminController');

router.get('/stats', auth, authRole('admin'), adminController.getDashboardStats);
router.get('/users', auth, authRole('admin'), adminController.getAllUsers);
router.delete('/users/:id', auth, authRole('admin'), adminController.deleteUser);
router.get('/properties', auth, authRole('admin'), adminController.getAllProperties);
router.delete('/properties/:id', auth, authRole('admin'), adminController.deleteProperty);
router.get('/bookings', auth, authRole('admin'), adminController.getAllBookings);
router.delete('/bookings/:id', auth, authRole('admin'), adminController.cancelBooking);
router.get('/admin/stats', auth, authRole('admin'), adminController.getDashboardStats);
router.get('/admin/users', auth, authRole('admin'), adminController.getAllUsers);
router.delete('/admin/users/:id', auth, authRole('admin'), adminController.deleteUser);

module.exports = router;