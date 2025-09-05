const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { auth, authRole } = require('../middlewares/auth');

// Public route - Submit contact form
router.post('/', contactController.submitContact);

// Admin only routes
router.get('/', auth, authRole('admin'), contactController.getAllContacts);
router.patch('/:id/status', auth, authRole('admin'), contactController.updateContactStatus);
router.delete('/:id', auth, authRole('admin'), contactController.deleteContact);

module.exports = router;
