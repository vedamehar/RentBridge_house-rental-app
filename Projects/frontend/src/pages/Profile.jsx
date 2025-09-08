import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Form,
  Alert,
  ListGroup
} from 'react-bootstrap';

const Profile = () => {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || ''
  });
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [currentUser?.type]);

  const fetchUserData = async () => {
    try {
      if (currentUser?.type === 'owner') {
  const propertiesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/properties/owner`, {
          withCredentials: true
        });
        setProperties(propertiesRes.data.properties);
      } else if (currentUser?.type === 'renter') {
  const bookingsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/my-bookings`, {
          withCredentials: true
        });
        setBookings(bookingsRes.data.bookings);
      }
    } catch (err) {
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
  `${import.meta.env.VITE_API_URL}/api/users/update-profile`,
        profileData,
        { withCredentials: true }
      );
      setSuccess('Profile updated successfully');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Container className="py-4">
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">Profile Information</Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              {editing ? (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      disabled
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <div className="d-flex gap-2">
                    <Button type="submit" variant="success">Save</Button>
                    <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
                  </div>
                </Form>
              ) : (
                <>
                  <p><strong>Name:</strong> {profileData.name}</p>
                  <p><strong>Email:</strong> {profileData.email}</p>
                  <p><strong>Phone:</strong> {profileData.phone || 'Not provided'}</p>
                  <Button variant="primary" onClick={() => setEditing(true)}>
                    Edit Profile
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          {currentUser?.type === 'owner' && (
            <Card>
              <Card.Header className="bg-primary text-white">My Properties</Card.Header>
              <ListGroup variant="flush">
                {properties.map(property => (
                  <ListGroup.Item key={property._id}>
                    <h5>{property.title}</h5>
                    <p className="mb-1">{property.location?.city}, {property.location?.state}</p>
                    <small className="text-muted">Status: {property.status}</small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          )}

          {currentUser?.type === 'renter' && (
            <Card>
              <Card.Header className="bg-primary text-white">My Bookings</Card.Header>
              <ListGroup variant="flush">
                {bookings.map(booking => (
                  <ListGroup.Item key={booking._id}>
                    <h5>{booking.property?.title}</h5>
                    <p className="mb-1">
                      Check-in: {new Date(booking.checkIn).toLocaleDateString()} <br />
                      Check-out: {new Date(booking.checkOut).toLocaleDateString()}
                    </p>
                    <span className={`badge bg-${booking.status === 'approved' ? 'success' : 
                      booking.status === 'rejected' ? 'danger' : 'warning'}`}>
                      {booking.status}
                    </span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;