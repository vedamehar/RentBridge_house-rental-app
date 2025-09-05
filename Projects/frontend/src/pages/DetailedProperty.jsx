import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Card, 
  Button, 
  Container, 
  Row, 
  Col, 
  Badge,
  Image,
  Alert
} from 'react-bootstrap';

const DetailedProperty = () => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await axios.get(
  `${import.meta.env.VITE_API_URL}/api/properties/${id}`,
        { withCredentials: true }
      );
      setProperty(response.data.property);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch property details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    try {
      const response = await axios.post(
  `${import.meta.env.VITE_API_URL}/api/properties/${id}/book`,
        {},
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setBookingSuccess(true);
        // Show success message for 2 seconds before redirecting
        setTimeout(() => {
          navigate('/renter-dashboard', { 
            state: { 
              bookingSuccess: true,
              propertyTitle: property.title 
            }
          });
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book property');
    }
  };

  const handleImageError = () => {
    setImgError(true);
  };

  const fallbackImage = "https://placehold.co/600x400?text=No+Image";

  if (loading) return <div className="text-center p-5">Loading...</div>;
  if (error) return <Alert variant="danger" className="m-3">{error}</Alert>;
  if (!property) return <Alert variant="warning" className="m-3">Property not found</Alert>;

  return (
    <Container className="py-4">
      <Card>
        <Row>
          <Col md={6}>
            <Image 
              src={imgError ? fallbackImage : (property.images?.[0] || fallbackImage)}
              onError={handleImageError}
              alt={property.title}
              fluid 
              className="property-image"
            />
          </Col>
          <Col md={6}>
            <Card.Body>
              <Card.Title className="h3">{property.title}</Card.Title>
              <Card.Text>
                <Badge bg="info" className="me-2">
                  {property.type}
                </Badge>
                <Badge bg="success">${property.rent}/month</Badge>
              </Card.Text>
              <Card.Text>{property.description}</Card.Text>
              <Card.Text>
                <strong>Location:</strong> {property.location?.city}, {property.location?.state}
              </Card.Text>
              <Card.Text>
                <strong>Available:</strong> {property.status === 'available' ? 'Yes' : 'No'}
              </Card.Text>
              
              {bookingSuccess && (
                <Alert variant="success">
                  Booking successful! Redirecting to dashboard...
                </Alert>
              )}
              
              {currentUser?.type === 'renter' && property.status === 'available' && (
                <div className="d-flex gap-2">
                  <Button 
                    variant="primary" 
                    onClick={handleBooking}
                    disabled={bookingSuccess}
                  >
                    Book Now
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    onClick={() => navigate(`/chat/${property.owner}`)}
                  >
                    Chat with Owner
                  </Button>
                </div>
              )}
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default DetailedProperty;