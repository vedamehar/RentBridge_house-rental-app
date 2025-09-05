import axios from 'axios';
const BASE_URL = `${import.meta.env.VITE_API_URL}/api/admin`;

const adminService = {
   getDashboardStats: async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data; // Extract the data field from the response
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  getAllUsers: async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  deleteUser: async (userId, token) => {
    try {
      const response = await axios.delete(`${BASE_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  getAllProperties: async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/properties`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  deleteProperty: async (propertyId, token) => {
    try {
      const response = await axios.delete(`${BASE_URL}/properties/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  },

  getAllBookings: async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  cancelBooking: async (bookingId, token) => {
    try {
      const response = await axios.delete(`${BASE_URL}/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
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

export default adminService;