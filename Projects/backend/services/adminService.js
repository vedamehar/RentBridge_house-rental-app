const axios = require('axios');
const BASE_URL = 'http://localhost:5000/api/admin';

const adminService = {
   getDashboardStats: async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  getAllUsers: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  getAllProperties: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/properties`);
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  deleteProperty: async (propertyId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/properties/${propertyId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  },

  getAllBookings: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/bookings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  cancelBooking: async (bookingId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  },

  exportToCSV: async (data, filename) => {
    // This would be handled on the frontend with react-csv
    return { success: true };
  }
};

module.exports = adminService;