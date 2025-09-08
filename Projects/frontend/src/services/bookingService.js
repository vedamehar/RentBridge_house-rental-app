import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/bookings`;

const createBooking = async (bookingData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(API_URL, bookingData, { 
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

const getBookingsForUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/user/${userId}`, { 
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const bookings = response.data.bookings || response.data.data || response.data || [];
      
      return bookings;
    } catch (error) {
      console.error('Error fetching bookings for user:', error.response?.data || error.message);
      console.error('Full error:', error);
      throw error.response?.data || error;
    }
  };

const cancelBooking = async (bookingId, reason = '') => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${API_URL}/${bookingId}/cancel`, 
      { reason },
      { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error cancelling booking:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export default {
  createBooking,
  getBookingsForUser,
  cancelBooking,
};
