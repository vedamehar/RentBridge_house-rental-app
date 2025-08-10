import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/signup.css';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    type: 'renter'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { name, email, password, phone, type } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/users/register', {
        name,
        email,
        password,
        type,
        phone
      });

      // Redirect based on role
      if (response.data.user.type === 'owner') {
        navigate('/owner-dashboard');
      } else {
        navigate('/renter-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-bg">
      <Card className="signup-card shadow-lg">
        <Card.Body>
          <h2 className="text-center mb-4">Create Your Account</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="name" className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control 
                type="text" 
                name="name"
                required
                placeholder="Enter your full name" 
                value={name}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                name="email"
                required
                placeholder="Enter your email" 
                value={email}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group controlId="phone" className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control 
                type="tel" 
                name="phone"
                placeholder="Enter your phone number" 
                value={phone}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group controlId="type" className="mb-3">
              <Form.Label>Account Type</Form.Label>
              <Form.Select 
                name="type"
                value={type}
                onChange={handleChange}
              >
                <option value="renter">Renter</option>
                <option value="owner">Owner</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group controlId="password" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                name="password"
                required
                minLength="6"
                placeholder="Choose a password" 
                value={password}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Button 
              variant="primary" 
              type="submit" 
              className="w-100"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </Form>
          
          <div className="text-center mt-3">
            Already have an account? <a href="/login">Login here</a>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SignupPage;