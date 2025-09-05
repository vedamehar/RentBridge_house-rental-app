import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// Helper function to get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const propertyService = {
  // Booking operations
  getBookings: async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.get(`${BASE_URL}/users/${userId}/bookings`, {
        headers: getAuthHeader(),
        withCredentials: true
      });
      return response.data.bookings || [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  },

  createBooking: async (propertyId) => {
    try {
      const userId = localStorage.getItem('userId');
      const bookingData = {
        propertyId,
        userId,
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        status: 'confirmed'
      };
      
      const response = await axios.post(`${BASE_URL}/bookings`, bookingData, {
        headers: getAuthHeader(),
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Wishlist operations
  getWishlist: async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/users/${userId}/wishlist`, {
        headers: getAuthHeader(),
        withCredentials: true
      });
      // Return just the wishlist array from the response
      return response.data.wishlist || [];
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    }
  },

  addToWishlist: async (propertyId) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.post(`${BASE_URL}/users/${userId}/wishlist`, 
        { propertyId }, 
        {
          headers: getAuthHeader(),
          withCredentials: true
        }
      );
      return response.data.success;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  removeFromWishlist: async (propertyId) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.delete(`${BASE_URL}/users/${userId}/wishlist/${propertyId}`, {
        headers: getAuthHeader(),
        withCredentials: true
      });
      return response.data.success;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },
  getAllProperties: async (filters = {}) => {
    try {
      const response = await axios.get(`${BASE_URL}/properties`, {
        params: filters,
        headers: getAuthHeader(),
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', {
        status: error.response?.status,
        data: error.response?.data,
        endpoint: error.config?.url
      });
      throw error;
    }
  },

  getPropertyById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/properties/${id}`, {
        headers: getAuthHeader(),
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching property:', {
        status: error.response?.status,
        data: error.response?.data,
        endpoint: error.config?.url
      });
      throw error;
    }
  },

  createBooking: async (propertyId, bookingData) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/properties/${propertyId}/book`, 
        bookingData,
        {
          headers: getAuthHeader(),
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      console.error('Booking Error Details:', {
        endpoint: `${BASE_URL}/properties/${propertyId}/book`,
        status: error.response?.status,
        data: error.response?.data,
        error: error.message
      });
      throw error;
    }
  },

  toggleFavorite: async (propertyId, userId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/properties/${propertyId}/favorite`, 
      { userId },  // Send as object
      {
        headers: getAuthHeader(),
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
      console.error('Error toggling favorite:', {
        status: error.response?.status,
        data: error.response?.data,
        endpoint: error.config?.url
      });
      throw error;
    }
  },

  getBookedProperties: async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/bookings/user/${userId}`,{
      headers: getAuthHeader(),
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching booked properties:', error);
  throw error;
  }
  },

  getWishlist: async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/users/${userId}/favorites`, {
        headers: getAuthHeader(),
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching wishlist:', {
        status: error.response?.status,
        data: error.response?.data,
        endpoint: error.config?.url
      });
      throw error;
    }
  }
};

export default propertyService;