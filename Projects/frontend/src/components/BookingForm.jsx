import React, { useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import axios from 'axios';

const BookingForm = ({ propertyId, show, onHide }) => {
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/properties/${propertyId}/book`, bookingData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      onHide();
      alert('Booking requested successfully!');
    } catch (err) {
      console.error('Booking error:', err);
      alert('Failed to request booking');
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Request Booking</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control 
              type="date" 
              value={bookingData.startDate}
              onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>End Date</Form.Label>
            <Form.Control 
              type="date" 
              value={bookingData.endDate}
              onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Message to Owner</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3}
              value={bookingData.message}
              onChange={(e) => setBookingData({...bookingData, message: e.target.value})}
            />
          </Form.Group>
          
          <Button variant="primary" type="submit">
            Request Booking
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default BookingForm;