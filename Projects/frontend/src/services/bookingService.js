import axios from 'axios';

const API_URL = 'http://localhost:5000/api/bookings';

const createBooking = async (bookingData) => {
  try {
    const response = await axios.post(API_URL, bookingData, { 
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
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
      const response = await axios.get(`${API_URL}/user/${userId}`, { 
        withCredentials: true 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings for user:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  };

export default {
  createBooking,
  getBookingsForUser,
};
