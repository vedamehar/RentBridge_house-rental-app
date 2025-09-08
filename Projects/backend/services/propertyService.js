// services/propertyService.js
const axios = require('axios');
const BASE_URL = 'http://localhost:5000/api';

const propertyService = {
  getAllProperties: async (filters = {}) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/properties`, { params: filters });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  getBookedProperties: async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/bookings/user/${userId}`);
      return response.data.bookings || [];
    } catch (error) {
      console.error('Error fetching booked properties:', error);
      return [];
    }
  },

  getPropertyById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching property:', error);
      throw error;
    }
  },

  createBooking: async (propertyId, bookingData) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/properties/${propertyId}/book`,
        bookingData
      );
      return response.data;
    } catch (error) {
      console.error('Booking Error Details:', {
        endpoint: `${BASE_URL}/api/properties/${propertyId}/book`,
        error: error.response?.data || error.message,
        status: error.response?.status
      });
      throw error;
    }
  },

  toggleFavorite: async (propertyId, userId) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/properties/${propertyId}/favorite`, { userId });
      return response.data;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  },

  // propertyService.js
getWishlist: async (userId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/users/${userId}/favorites`, 
      { withCredentials: true }
    );
    return response.data.favorites || [];
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
  },

};

module.exports = propertyService;