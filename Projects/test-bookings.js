// Test script to check booking data directly from the API
const axios = require('axios');

async function testBookings() {
  try {
    // Test with a known user ID (from the logs we saw: 68baa11b7ccbb1c824f9d798)
    const userId = '68baa11b7ccbb1c824f9d798';
    const API_URL = 'https://rentbridge-backend.onrender.com/api/bookings';
    
    console.log('Testing bookings API for user:', userId);
    console.log('API URL:', `${API_URL}/user/${userId}`);
    
    // First test without auth to see the error
    try {
      const response = await axios.get(`${API_URL}/user/${userId}`);
      console.log('Response without auth:', response.data);
    } catch (error) {
      console.log('Expected auth error:', error.response?.status, error.response?.data?.message);
    }
    
    // Test getting all bookings to see the structure
    try {
      const allBookingsResponse = await axios.get(`${API_URL}`);
      console.log('All bookings response:', allBookingsResponse.data);
    } catch (error) {
      console.log('Error getting all bookings:', error.response?.status, error.response?.data?.message);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testBookings();
