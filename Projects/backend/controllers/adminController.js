const User = require('../models/user');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');

const getDashboardStats = async (req, res) => {
  try {
    const [owners, renters, properties, bookings, contacts] = await Promise.all([
      User.countDocuments({ type: 'owner' }),
      User.countDocuments({ type: 'renter' }),
      Property.countDocuments(),
      Booking.countDocuments(),
      Contact.countDocuments(),
    ]);

    res.json({ 
      success: true,
      data: {
        owners, 
        renters, 
        properties, 
        bookings, 
        contacts 
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Property.deleteMany({ userId: req.params.id });
    await Booking.deleteMany({ 
      $or: [
        { userId: req.params.id },
        { ownerId: req.params.id }
      ] 
    });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate('userId', 'name email');
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    await Booking.deleteMany({ propertyId: req.params.id });
    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('ownerId', 'name email')
      .populate('propertyId', 'title location prop_amt');
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

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }
    
    // Update property status back to available
    await Property.findByIdAndUpdate(
      booking.propertyId,
      { status: 'available' },
      { new: true }
    );
    
    res.json({ 
      success: true,
      message: 'Booking cancelled successfully' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Add contact-related functions
const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ 
      success: true,
      data: contacts 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!contact) {
      return res.status(404).json({ 
        success: false,
        message: 'Contact not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Contact status updated successfully',
      data: contact 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ 
        success: false,
        message: 'Contact not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Contact deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllProperties,
  deleteProperty,
  getAllBookings,
  cancelBooking,
  getAllContacts,
  updateContactStatus,
  deleteContact
};