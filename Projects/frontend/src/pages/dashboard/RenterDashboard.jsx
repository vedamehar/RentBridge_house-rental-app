import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Carousel, Button, Card, Form, InputGroup, Spinner, Badge, Container, Row, Col, Alert, Tabs, Tab } from "react-bootstrap";
import { useNavigate, useLocation } from 'react-router-dom';
import propertyService from '../../services/propertyService';
import ChatModal from "../../components/ChatModal";
import Wishlist from "../../components/Wishlist";
import ReviewStars from "../../components/ReviewStars";
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/bookingService'; // Import booking service
import "./RenterDashboard.css";

const fallbackImage = "/no-image.png";

// Add hover effect styles
const styles = {
  card: {
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    }
  },
  button: {
    transition: 'background-color 0.2s',
    '&:hover': {
      filter: 'brightness(110%)'
    }
  }
};

const getValidImage = (img) => {
  if (!img || img === "https://via.placeholder.com/800x400") return fallbackImage;
  // Check for valid base64 image
  if (img.startsWith("data:image") && img.length > 30) return img;
  // Check for valid URL
  try {
    if (img.startsWith("http") && !img.includes("via.placeholder.com")) {
      new URL(img); // Throws if not a valid URL
      return img;
    }
  } catch {
    return fallbackImage;
  }
  if (img.startsWith("/uploads/")) return `${import.meta.env.VITE_API_URL}${img}`;
  if (img && !img.includes("/") && img.includes(".")) return `${import.meta.env.VITE_API_URL}/uploads/${img}`;
  return fallbackImage;
};

const HeartIcon = ({ active, onClick }) => (
  <div 
    onClick={onClick}
    style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'white',
      borderRadius: '50%',
      padding: '8px',
      cursor: 'pointer',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      zIndex: 2
    }}
  >
    <svg 
      width="20" 
      height="20" 
      fill={active ? 'red' : 'none'} 
      stroke={active ? 'red' : 'currentColor'}
      strokeWidth="2" 
      viewBox="0 0 24 24"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  </div>
);

const PropertyCard = ({ property, onViewDetails, onWishlistToggle, isWishlisted }) => {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const handleImageError = () => setImgError(true);
  const imageSrc = imgError ? fallbackImage : getValidImage(property.prop_images?.[0]);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onViewDetails(property);
  };

  return (
    <div className="position-relative">
      <Card className="h-100 shadow-sm hover-shadow" style={{ cursor: 'pointer' }}>
        <div style={{ position: 'relative', height: '200px', overflow: 'hidden', background: '#f8f9fa' }}>
          <Card.Img 
            variant="top" 
            src={imageSrc}
            alt={property.title || property.prop_address}
            onError={handleImageError}
            style={{ height: '100%', width: '100%', objectFit: 'cover' }}
          />
          {onWishlistToggle && (
            <HeartIcon 
              active={isWishlisted} 
              onClick={(e) => {
                e.stopPropagation();
                onWishlistToggle(property._id);
              }}
            />
          )}
        </div>
        <Card.Body className="d-flex flex-column" onClick={handleClick}>
          <Card.Title>{property.title || property.prop_address}</Card.Title>
          <Card.Text>
            <strong>Location:</strong> {property.location?.city || property.prop_address}<br />
            <strong>Rent:</strong> ₹{property.prop_amt}<br />
            {property.ad_info && <><strong>Details:</strong> {property.ad_info}<br /></>}
            <ReviewStars rating={property.rating || 3.5} />
          </Card.Text>
          <Button 
            variant="primary" 
            onClick={(e) => {
              e.stopPropagation();
              handleClick(e);
            }}
            className="w-100 mt-auto"
          >
            View Details
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

const RenterDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [wishlist, setWishlist] = useState(() => {
    // Initialize wishlist from localStorage
    const savedWishlist = localStorage.getItem('wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [bookedProperties, setBookedProperties] = useState([]);
  const [error, setError] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const fetchBookedProperties = useCallback(async () => {
    if (!currentUser?._id) {
      console.log('No current user, skipping booking fetch');
      return;
    }
    try {
      console.log('Starting fetchBookedProperties for user:', currentUser._id);
      const bookingsData = await bookingService.getBookingsForUser(currentUser._id);
      console.log('fetchBookedProperties received data:', bookingsData);
      console.log('Is array?', Array.isArray(bookingsData));
      console.log('Length:', bookingsData?.length);
      
      const finalBookings = Array.isArray(bookingsData) ? bookingsData : [];
      console.log('Setting bookedProperties to:', finalBookings);
      setBookedProperties(finalBookings);
    } catch (error) {
      console.error('Error fetching booked properties:', error);
      setError('Failed to load your bookings.');
      setBookedProperties([]);
    }
  }, [currentUser]);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const data = await propertyService.getAllProperties({ status: 'available' });
      const propertiesArray = Array.isArray(data) ? data : (data?.data || []);
      const processedProperties = propertiesArray.map(property => ({
        ...property,
        prop_images: (property.prop_images || []).map(img =>
          img.startsWith('data:image') || img.startsWith('http')
            ? img
            : `${import.meta.env.VITE_API_URL}/uploads/${img}`
        )
      }));
      setProperties(processedProperties);
      setCities([...new Set(processedProperties.map(p => p.location?.city || p.prop_address).filter(Boolean))]);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to load properties.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debug useEffect to monitor bookedProperties changes
  useEffect(() => {
    console.log('bookedProperties state changed:', bookedProperties);
    console.log('bookedProperties length:', bookedProperties.length);
    console.log('bookedProperties type:', typeof bookedProperties);
  }, [bookedProperties]);

  useEffect(() => {
    if (currentUser) {
      fetchProperties();
      fetchBookedProperties();
    } else {
      setLoading(false);
    }
  }, [currentUser, fetchProperties, fetchBookedProperties]);

  useEffect(() => {
    const filtered = properties.filter((p) => {
      const searchTermLower = searchTerm.toLowerCase();
      const locationString = p.location?.city
        ? `${p.location.city}, ${p.location.state || ''}`
        : p.prop_address || '';
      
      return (
        locationString.toLowerCase().includes(searchTermLower) ||
        (p.title || '').toLowerCase().includes(searchTermLower) ||
        (p.prop_type || '').toLowerCase().includes(searchTermLower)
      );
    });
    setFilteredProperties(filtered);
  }, [searchTerm, properties]);

  const handleCardClick = useCallback((property) => {
    if (!property || !property._id) {
      console.error("Invalid property data");
      return;
    }
    setSelectedProperty(property);
    setShowModal(true);
  }, []);

  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelectedProperty(null);
  }, []);

  const handleWishlist = (propertyId) => {
    setWishlist(prevWishlist => {
      const isInWishlist = prevWishlist.includes(propertyId);
      if (isInWishlist) {
        return prevWishlist.filter(id => id !== propertyId);
      } else {
        return [...prevWishlist, propertyId];
      }
    });
  };

  const handleBook = async (propertyId) => {
    if (!currentUser?._id) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const bookingData = {
        propertyId: propertyId,
        userId: currentUser._id,
        userName: currentUser.name,
        ownerId: selectedProperty.userId._id,
        ownerName: selectedProperty.userId.name,
        propertyName: selectedProperty.title || selectedProperty.prop_address,
        startDate: new Date().toISOString(),
        // Example: booking for 1 month
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      };

      // Create the booking
      const newBooking = await bookingService.createBooking(bookingData);

      // Update the property status to 'booked' using propertyService
      try {
        await propertyService.updatePropertyStatus(propertyId, 'booked');
      } catch (statusError) {
        console.warn('Failed to update property status:', statusError);
        // Continue with booking even if status update fails
      }

      // Update local state immediately for better UX
      // Remove from available properties
      setProperties(prev => prev.filter(p => p._id !== propertyId));
      setFilteredProperties(prev => prev.filter(p => p._id !== propertyId));
      
      // Add to booked properties
      setBookedProperties(prev => [...prev, newBooking]);
      
      // Remove from wishlist if it's there
      setWishlist(prev => prev.filter(id => id !== propertyId));
      
      alert('Property booked successfully! Check your "My Bookings" tab.');
      setShowModal(false);
      
      // Automatically switch to "My Bookings" tab after successful booking
      setTimeout(() => {
        const bookingsTab = document.querySelector('[data-rr-ui-event-key="booked"]');
        if (bookingsTab) {
          bookingsTab.click();
        }
      }, 1000);
      
      // Refresh data to ensure consistency
      fetchProperties();
      fetchBookedProperties();
    } catch (err) {
      console.error('Booking failed:', err);
      setError(err.message || 'Failed to book property. It might already be booked.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;

    try {
      setLoading(true);
      
      // Call the cancellation service
      await bookingService.cancelBooking(bookingToCancel._id, cancellationReason);
      
      // Update local state
      setBookedProperties(prev => prev.filter(booking => booking._id !== bookingToCancel._id));
      
      // If the property exists, add it back to available properties
      if (bookingToCancel.propertyId) {
        const propertyToRestore = {
          ...bookingToCancel.propertyId,
          status: 'available'
        };
        setProperties(prev => [...prev, propertyToRestore]);
      }
      
      alert('Booking cancelled successfully!');
      setShowCancelModal(false);
      setBookingToCancel(null);
      setCancellationReason('');
      
      // Refresh data to ensure consistency
      fetchProperties();
      fetchBookedProperties();
    } catch (err) {
      console.error('Cancellation failed:', err);
      setError(err.message || 'Failed to cancel booking.');
    } finally {
      setLoading(false);
    }
  };

  const openCancelModal = (booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setBookingToCancel(null);
    setCancellationReason('');
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Welcome, {currentUser?.name || 'Renter'}</h2>
        <Button variant="danger" onClick={handleLogout}>Logout</Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Tabs defaultActiveKey="available" id="dashboard-tabs" className="mb-3">
        <Tab eventKey="available" title="🏠 Available Properties">
          <InputGroup className="my-3">
            <Form.Control
              placeholder="Search by location, title, or property type"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          {loading ? (
            <div className="text-center"><Spinner animation="border" /></div>
          ) : (
            filteredProperties.length > 0 ? (
              <Row xs={1} md={2} lg={3} className="g-4">
                {filteredProperties.map((property) => (
                  <Col key={property._id}>
                    <PropertyCard
                      property={property}
                      onViewDetails={handleCardClick}
                      onWishlistToggle={handleWishlist}
                      isWishlisted={wishlist.includes(property._id)}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <Alert variant="info">No properties found matching your search.</Alert>
            )
          )}
        </Tab>

        <Tab eventKey="wishlist" title="❤️ Favorites">
          <div className="mt-3">
            {loading ? (
              <div className="text-center"><Spinner animation="border" /></div>
            ) : (
              wishlist.length > 0 ? (
                <Row xs={1} md={2} lg={3} className="g-4">
                  {properties
                    .filter(p => wishlist.includes(p._id))
                    .map(property => (
                      <Col key={property._id}>
                        <PropertyCard
                          property={property}
                          onViewDetails={handleCardClick}
                          onWishlistToggle={handleWishlist}
                          isWishlisted={true}
                        />
                      </Col>
                    ))}
                </Row>
              ) : (
                <Alert variant="info">Your favorites list is empty.</Alert>
              )
            )}
          </div>
        </Tab>

        <Tab eventKey="booked" title="📅 My Bookings">
          <div className="mt-3">
            {loading ? (
              <div className="text-center"><Spinner animation="border" /></div>
            ) : (
              bookedProperties.length > 0 ? (
                <Row xs={1} md={2} lg={3} className="g-4">
                  {bookedProperties.map((booking) => (
                    <Col key={booking._id}>
                      <Card className="h-100 shadow-sm">
                        <Card.Img 
                          variant="top" 
                          src={getValidImage(booking.propertyId?.prop_images?.[0])} 
                          style={{ height: '200px', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = fallbackImage; }}
                        />
                        <Card.Body>
                          <Card.Title>
                            {booking.propertyId?.title || booking.propertyName || 'Property Booking'}
                          </Card.Title>
                          <Card.Text>
                            <Badge bg={
                              booking.status === 'cancelled' ? 'danger' :
                              booking.status === 'approved' ? 'success' :
                              booking.status === 'pending' ? 'warning' : 'primary'
                            }>
                              {booking.status === 'cancelled' ? 'Cancelled' :
                               booking.status === 'approved' ? 'Confirmed' :
                               booking.status === 'pending' ? 'Pending' : booking.status || 'Booked'}
                            </Badge><br/>
                            {booking.propertyId?.prop_address && (
                              <><strong>Address:</strong> {booking.propertyId.prop_address}<br/></>
                            )}
                            {booking.propertyId?.prop_amt && (
                              <><strong>Rent:</strong> ₹{booking.propertyId.prop_amt}<br/></>
                            )}
                            <small><strong>Booking ID:</strong> {booking.bookingId || booking._id}</small><br/>
                            <small><strong>From:</strong> {new Date(booking.startDate).toLocaleDateString()}</small><br/>
                            <small><strong>To:</strong> {new Date(booking.endDate).toLocaleDateString()}</small>
                            {booking.status === 'cancelled' && booking.cancelledAt && (
                              <><br/><small><strong>Cancelled on:</strong> {new Date(booking.cancelledAt).toLocaleDateString()}</small></>
                            )}
                          </Card.Text>
                          {/* Only show cancel button for active bookings */}
                          {['pending', 'approved'].includes(booking.status) && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => openCancelModal(booking)}
                              disabled={loading}
                            >
                              Cancel Booking
                            </Button>
                          )}
                          {booking.status === 'cancelled' && (
                            <Button variant="secondary" size="sm" disabled>
                              Cancelled
                            </Button>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Alert variant="info">You have no booked properties.</Alert>
              )
            )}
          </div>
        </Tab>
      </Tabs>

      <Modal show={showModal} onHide={handleClose} size="lg">
        {selectedProperty ? (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedProperty.title || selectedProperty.prop_address}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Carousel>
                {(selectedProperty.prop_images?.length > 0 ? selectedProperty.prop_images : [fallbackImage]).map((img, idx) => (
                  <Carousel.Item key={idx}>
                    <img
                      className="d-block w-100"
                      src={getValidImage(img)}
                      alt={`Property ${idx + 1}`}
                      style={{ height: '400px', objectFit: 'cover' }}
                      onError={e => { e.target.src = fallbackImage; }}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
              <div className="mt-4">
                <h5>{selectedProperty.location?.city}, {selectedProperty.location?.state}</h5>
                <h5>Rent: ₹{selectedProperty.prop_amt}</h5>
                <p>{selectedProperty.description || selectedProperty.ad_info}</p>
                <hr />
                <h6>Owner Details:</h6>
                <p><strong>Name:</strong> {selectedProperty.userId?.name || 'Unknown'}</p>
                <p><strong>Contact:</strong> {selectedProperty.userId?.phone || 'Contact via chat'}</p>
                <hr />
                <div className="d-flex justify-content-between">
                  <Button
                    variant="success"
                    onClick={() => handleBook(selectedProperty._id)}
                    disabled={loading || bookedProperties.some(b => b.propertyId?._id === selectedProperty._id)}
                  >
                    {loading ? 'Booking...' : 
                     bookedProperties.some(b => b.propertyId?._id === selectedProperty._id) ? "Already Booked" : "Book Now"}
                  </Button>
                  <Button variant="secondary" onClick={() => setChatOpen(true)}>Chat with Owner</Button>
                  <Button
                    variant={wishlist.includes(selectedProperty._id) ? "danger" : "outline-danger"}
                    onClick={() => handleWishlist(selectedProperty._id)}
                  >
                    {wishlist.includes(selectedProperty._id) ? "Remove from Favorites" : "Add to Favorites"}
                  </Button>
                </div>
              </div>
            </Modal.Body>
          </>
        ) : (
          <div className="text-center py-5"><Spinner animation="border" /></div>
        )}
      </Modal>

      {chatOpen && selectedProperty && (
        <ChatModal
          owner={selectedProperty.userId || { name: 'Property Owner' }}
          propertyId={selectedProperty._id}
          onClose={() => setChatOpen(false)}
        />
      )}

      {/* Booking Cancellation Modal */}
      <Modal show={showCancelModal} onHide={closeCancelModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel this booking?</p>
          {bookingToCancel && (
            <div className="mb-3">
              <strong>Property:</strong> {bookingToCancel.propertyId?.title || bookingToCancel.propertyName}<br/>
              <strong>Booking ID:</strong> {bookingToCancel.bookingId || bookingToCancel._id}<br/>
              <strong>Dates:</strong> {new Date(bookingToCancel.startDate).toLocaleDateString()} - {new Date(bookingToCancel.endDate).toLocaleDateString()}
            </div>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Reason for cancellation (optional):</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Please let us know why you're cancelling..."
            />
          </Form.Group>
          <Alert variant="warning">
            <small>⚠️ Once cancelled, this property will become available for other renters to book.</small>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeCancelModal} disabled={loading}>
            Keep Booking
          </Button>
          <Button variant="danger" onClick={handleCancelBooking} disabled={loading}>
            {loading ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RenterDashboard;