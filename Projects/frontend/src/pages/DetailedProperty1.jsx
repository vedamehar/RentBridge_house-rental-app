import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import propertyService from '../services/propertyService';
import ChatModal from "../components/ChatModal";
import { 
  Card, 
  Button, 
  Container, 
  Row, 
  Col, 
  Badge,
  Alert,
  Modal,
  Form,
  Carousel,
  Spinner,
  Tab,
  Tabs
} from 'react-bootstrap';

// Constants
const FALLBACK_IMAGE = 'https://via.placeholder.com/400x300?text=No+Image+Available';

const DetailedProperty = () => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleImageError = () => {
    setImgError(true);
  };

  const fetchProperty = async () => {
    if (!id) {
      setError('Property ID is missing');
      setLoading(false);
      return;
    }

    try {
      const response = await propertyService.getPropertyById(id);
      if (!response.success || !response.data) {
        throw new Error('Invalid property data received');
      }
      setProperty(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching property:', err);
      setError(err.message || 'Failed to fetch property details');
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const handleBook = () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/property/${id}` } });
      return;
    }
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      moveInDate: e.target.elements.moveInDate.value,
      notes: e.target.elements.notes.value
    };

    try {
      await propertyService.requestBooking(id, formData);
      setShowBookingModal(false);
      setBookingSuccess(true);
      setTimeout(() => {
        navigate('/renter-dashboard', {
          state: { bookingSuccess: true, propertyTitle: property.title }
        });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book property');
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {error}
          <Button
            variant="outline-danger"
            className="ms-3"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          Property not found
          <Button
            variant="outline-warning"
            className="ms-3"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="border-0 shadow">
        <Row className="g-0">
          <Col md={6}>
            <Carousel className="property-carousel">
              {(property.prop_images?.length ? property.prop_images : [FALLBACK_IMAGE]).map((img, idx) => (
                <Carousel.Item key={idx}>
                  <img
                    src={imgError ? FALLBACK_IMAGE : img}
                    onError={handleImageError}
                    alt={`${property.title || 'Property'} - Image ${idx + 1}`}
                    className="d-block w-100"
                    style={{ height: '400px', objectFit: 'cover' }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          </Col>
          <Col md={6}>
            <Card.Body className="p-4">
              <Card.Title className="h2 mb-3">{property.title}</Card.Title>
              <Card.Text>
                <Badge bg="info" className="me-2">
                  {property.prop_type}
                </Badge>
                <Badge bg="success">₹{property.prop_amt}/month</Badge>
              </Card.Text>
              <hr/>

              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
              >
                <Tab eventKey="info" title="Info">
                  <div className="p-3">
                    <h5>Property Details</h5>
                    <Row className="mb-3">
                      <Col sm={4}><strong>Type:</strong></Col>
                      <Col>{property.prop_type}</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col sm={4}><strong>Address:</strong></Col>
                      <Col>{property.prop_address}</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col sm={4}><strong>Location:</strong></Col>
                      <Col>{property.location?.city}, {property.location?.state}</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col sm={4}><strong>Rent:</strong></Col>
                      <Col>₹{property.prop_amt}/month</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col sm={4}><strong>Ad Type:</strong></Col>
                      <Col>{property.prop_ad_type}</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col sm={4}><strong>Status:</strong></Col>
                      <Col>
                        <Badge bg={property.status === 'available' ? 'success' : 'warning'}>
                          {property.status}
                        </Badge>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col sm={4}><strong>Owner:</strong></Col>
                      <Col>{property.userId?.name || 'Contact for details'}</Col>
                    </Row>
                    {property.ad_info && (
                      <Row className="mb-3">
                        <Col sm={4}><strong>Additional Info:</strong></Col>
                        <Col>{property.ad_info}</Col>
                      </Row>
                    )}
                  </div>
                </Tab>
                <Tab eventKey="contact" title="Contact & Booking">
                  <div className="p-3">
                    {bookingSuccess && (
                      <Alert variant="success" className="mb-3">
                        Booking successful! Redirecting to dashboard...
                      </Alert>
                    )}
                    
                    {error && (
                      <Alert variant="danger" className="mb-3" onClose={() => setError(null)} dismissible>
                        {error}
                      </Alert>
                    )}
                    
                    {currentUser && property.status === 'available' && (
                      <div className="d-flex gap-2">
                        <Button 
                          variant="primary" 
                          size="lg"
                          onClick={handleBook}
                          disabled={bookingSuccess}
                          className="flex-grow-1"
                        >
                          Book Now
                        </Button>
                        <Button 
                          variant="outline-primary"
                          size="lg"
                          onClick={() => setShowChatModal(true)}
                          className="flex-grow-1"
                        >
                          Chat with Owner
                        </Button>
                      </div>
                    )}

                    {!currentUser && (
                      <Alert variant="info">
                        Please <Alert.Link onClick={() => navigate('/login')}>login</Alert.Link> to book this property or chat with the owner.
                      </Alert>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Col>
        </Row>
      </Card>

      {/* Chat Modal */}
      {showChatModal && property && (
        <ChatModal
          owner={property.userId || { name: 'Property Owner' }}
          onClose={() => setShowChatModal(false)}
        />
      )}

      {/* Booking Modal */}
      {showBookingModal && property && (
        <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Book {property.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleBookingSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Move-in Date</Form.Label>
                <Form.Control
                  type="date"
                  name="moveInDate"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Additional Notes</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  name="notes"
                />
              </Form.Group>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowBookingModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Submit Booking
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </Container>
  );
};

export default DetailedProperty;
