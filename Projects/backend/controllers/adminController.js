const User = require('../models/user');
const Property = require('../models/Property');
const Booking = require('../models/Booking');

const getDashboardStats = async (req, res) => {
  try {
    const [owners, renters, properties, bookings] = await Promise.all([
      User.countDocuments({ type: 'owner' }),
      User.countDocuments({ type: 'renter' }),
      Property.countDocuments(),
      Booking.countDocuments(),
    ]);

    res.json({ owners, renters, properties, bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
      .populate('propertyId', 'title location rent');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllProperties,
  deleteProperty,
  getAllBookings,
  cancelBooking
};