import React, { useState } from 'react';
import {
  Container,
  Card,
  Form,
  Button,
  Alert
} from 'react-bootstrap';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/contact',
        formData,
        { withCredentials: true }
      );
      setStatus({
        type: 'success',
        message: 'Message sent successfully! We will get back to you soon.'
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setStatus({
        type: 'danger',
        message: error.response?.data?.message || 'Failed to send message'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Header as="h4" className="bg-primary text-white">
          Contact Us
        </Card.Header>
        <Card.Body>
          {status.message && (
            <Alert variant={status.type} dismissible 
              onClose={() => setStatus({ type: '', message: '' })}>
              {status.message}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="Enter subject"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Enter your message"
              />
            </Form.Group>

            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Contact;