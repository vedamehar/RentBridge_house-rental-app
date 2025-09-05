import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'renter'  // Changed from 'type' to 'role'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const { name, email, password, phone, role } = formData;

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
      // Register user with backend, send withCredentials for cookie
      const res = await axios.post('/api/users/register', {
        name,
        email,
        password,
        role,
        phone
      }, { withCredentials: true });

      // Automatically log the user in after registration
      const user = await login(email, password, role);

      // Redirect based on role from returned user object
      switch(user.role || user.type) {
        case 'owner':
          navigate('/owner-dashboard');
          break;
        case 'renter':
          navigate('/renter-dashboard');
          break;
        case 'admin':
          navigate('/admin-dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Registration error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '400px' }}>
      <h3 className="text-center mb-4">Register</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Full Name</Form.Label>
          <Form.Control 
            type="text" 
            name="name"
            required 
            value={name} 
            onChange={handleChange} 
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email address</Form.Label>
          <Form.Control 
            type="email" 
            name="email"
            required 
            value={email} 
            onChange={handleChange} 
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control 
            type="tel" 
            name="phone"
            value={phone} 
            onChange={handleChange} 
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Select 
            name="role"  // Changed from 'type' to 'role'
            value={role} 
            onChange={handleChange}
          >
            <option value="renter">Renter</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control 
            type="password" 
            name="password"
            required 
            value={password} 
            onChange={handleChange} 
            minLength="6"
          />
        </Form.Group>

        <Button 
          variant="success" 
          type="submit" 
          className="w-100"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </Form>
      
      <div className="text-center mt-3">
        Already have an account? <a href="/login">Login here</a>
      </div>
    </Container>
  );
};

export default Register;