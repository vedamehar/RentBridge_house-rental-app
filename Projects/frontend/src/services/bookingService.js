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
      console.log('Fetching bookings for userId:', userId, 'with token:', token ? 'present' : 'missing');
      
      const response = await axios.get(`${API_URL}/user/${userId}`, { 
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Raw booking response:', response.data);
      const bookings = response.data.bookings || response.data.data || response.data || [];
      console.log('Extracted bookings:', bookings);
      console.log('Number of bookings:', Array.isArray(bookings) ? bookings.length : 'Not an array');
      
      return bookings;
    } catch (error) {
      console.error('Error fetching bookings for user:', error.response?.data || error.message);
      console.error('Full error:', error);
      throw error.response?.data || error;
    }
  };

export default {
  createBooking,
  getBookingsForUser,
};
