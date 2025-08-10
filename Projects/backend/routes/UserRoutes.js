const express = require('express');
const router = express.Router();
const { auth, authRole } = require('../middlewares/auth');
const userController = require('../controllers/userController');

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/logout', userController.logout);

// Protected routes
router.get('/me', auth, userController.getMe);
router.put('/me', auth, userController.updateUser);
router.post('/favorites/:propertyId', auth, userController.addFavorite);
router.delete('/favorites/:propertyId', auth, userController.removeFavorite);
router.get('/:userId/favorites', auth, userController.getUserFavorites);

// Admin-only routes
router.get('/', auth, authRole('admin'), userController.getAllUsers);

module.exports = router;