import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Tab, Tabs, Card, Badge, Spinner, Carousel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from 'axios';
import "./dashboard.css";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("properties");
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (currentUser === undefined || currentUser === null) return; // Wait for currentUser to load
    if ((currentUser.role || currentUser.type) !== 'owner') {
      navigate('/login', { replace: true });
      return;
    }
  }, [currentUser, navigate]);

  const [newProperty, setNewProperty] = useState({
    title: "",
    prop_type: "",
    prop_address: "",
    location: {
      city: "",
      state: ""
    },
    owner_contact: "",
    prop_amt: "",
    prop_images: [],
    ad_info: "",
    prop_ad_type: "rent",
    status: "available",
    images: [] // Adding this for backward compatibility
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('location.')) {
      const locationField = name.split('.')[1];
      setNewProperty(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setNewProperty(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Configure axios defaults
  axios.defaults.withCredentials = true;

  // Configure axios interceptor to add token to all requests
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const handleEdit = (property) => {
    setNewProperty({
      ...property,
      location: property.location || { city: "", state: "" }
    });
    setShowModal(true);
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }
    try {
      await axios.delete(`${BASE_URL}/api/properties/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      await fetchProperties(); // Refresh the list
    } catch (err) {
      console.error('Error deleting property:', err);
      setError('Failed to delete property');
    }
  };
  
  // Add response interceptor for handling auth errors
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        navigate('/login');
      }
      return Promise.reject(error);
    }
  );

  // Ensure properties are always set as an array and not filtered
const fetchProperties = async () => {
  try {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('token');

    // Get all properties
    const response = await axios.get(
      `${BASE_URL}/api/properties`,
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Properties response:', response.data); // Debug log
    console.log('Current user:', currentUser); // Debug log
    
    // Handle backend response format for properties
    let allProperties = [];
    if (Array.isArray(response.data)) {
      allProperties = response.data;
    } else if (response.data && Array.isArray(response.data.properties)) {
      allProperties = response.data.properties;
    } else if (response.data && Array.isArray(response.data.data)) {
      allProperties = response.data.data;
    } else {
      console.warn('Unexpected properties response format:', response.data);
      allProperties = [];
    }
    
    // Ensure allProperties is always an array
    if (!Array.isArray(allProperties)) {
      console.error('allProperties is not an array:', allProperties);
      allProperties = [];
    }
    
    // Filter properties for current user
    const propertiesArray = allProperties.filter(prop => 
      prop && (
        prop.owner === currentUser._id || 
        prop.userId === currentUser._id ||
        prop.owner === currentUser.id ||
        prop.userId === currentUser.id
      )
    );
    
    console.log('Filtered properties for user:', propertiesArray);
    
    // Process images and handle property data
    const processedProperties = propertiesArray.map(property => {
      console.log('Processing property:', property); // Debug individual property
      
      // Ensure we have an array of images and include both prop_images and images fields
      const imagesArray = [
        ...(Array.isArray(property.prop_images) ? property.prop_images : []),
        ...(Array.isArray(property.images) ? property.images : [])
      ];
      
      const processedImages = imagesArray.map(img => {
        if (!img) return null;
        // Handle base64 images properly
        if (img.startsWith('data:image')) {
          // Check if it's a valid base64 image with proper format and content
          const isValidBase64 = /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/]+=*$/.test(img);
          return isValidBase64 ? img : null;
        }
        // Handle URLs
        if (img.startsWith('http') || img.startsWith('https')) {
          try {
            new URL(img);
            return img;
          } catch {
            return null;
          }
        }
        // Handle local uploads
        return `${BASE_URL}/uploads/${img}`;
      }).filter(img => img); // Remove null values
      
      console.log('Processed images for property:', processedImages); // Debug images
      
      return {
        ...property,
        prop_images: processedImages.length > 0 ? processedImages : []
      };
    });
    
    console.log('Final processed properties:', processedProperties);
    setProperties(processedProperties);
  } catch (err) {
    console.error('Error fetching properties:', err);
    setError(err.response?.data?.message || err.message || 'Error loading properties');
    if (err.response?.status === 401) {
      navigate('/login');
    }
  } finally {
    setIsLoading(false);
  }
}

  useEffect(() => {
    const loadProperties = async () => {
      if (currentUser) {
        console.log('Fetching properties for user:', currentUser._id);
        await fetchProperties();
      }
    };
    loadProperties();
  }, [currentUser]); // Only depend on currentUser changes

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/api/bookings/owner`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Bookings response:', response.data); // Debug log
        
        // Handle response format
        let bookingsData = [];
        if (Array.isArray(response.data)) {
          bookingsData = response.data;
        } else if (response.data && Array.isArray(response.data.bookings)) {
          bookingsData = response.data.bookings;
        } else if (response.data && Array.isArray(response.data.data)) {
          bookingsData = response.data.data;
        } else {
          console.warn('Unexpected bookings response format:', response.data);
          bookingsData = [];
        }
        
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setBookings([]);
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === 'bookings') {
      fetchBookings();
    } else if (activeTab === 'messages') {
      fetchConversations();
    }
  }, [activeTab]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${BASE_URL}/api/messages/conversations`, {
        withCredentials: true
      });
      setConversations(response.data.conversations || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/messages/conversation/${userId}`, {
        withCredentials: true
      });
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setMessages([]);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await axios.post(`${BASE_URL}/api/messages`, {
        receiverId: selectedConversation.otherUser._id,
        content: newMessage.trim()
      }, { withCredentials: true });

      setNewMessage('');
      fetchMessages(selectedConversation.otherUser._id);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.otherUser._id);
  };

  const handleShow = () => {
    console.log('handleShow called');
    setShowModal(true);
  };
  const handleClose = () => {
    setShowModal(false);
    setNewProperty({
      title: "",
      prop_type: "",
      prop_address: "",
      location: { city: "", state: "" },
      owner_contact: "",
      prop_amt: "",
      prop_images: [],
      ad_info: "",
      status: "available"
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'city' || name === 'state') {
      setNewProperty(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value
        }
      }));
    } else if (name.includes('location.')) {
      const locationField = name.split('.')[1];
      setNewProperty(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setNewProperty(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const cleanImages = (images) => {
    if (!Array.isArray(images)) return [];
    return images.filter(img => {
      if (!img) return false;
      if (img.startsWith("data:image")) return true;
      if (img.startsWith("http")) return true;
      return false;
    });
  };

  const handleAddProperty = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      console.log('newProperty state:', newProperty);
      if (!currentUser) {
        alert('Session expired. Please login again.');
        navigate('/login');
        return;
      }

      // Validate required fields
      const requiredFields = ['title', 'prop_type', 'prop_address', 'owner_contact', 'prop_amt'];
      const missingFields = requiredFields.filter(field => !newProperty[field]);
      
      if (missingFields.length > 0) {
        alert(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }
      
     // Validate location fields
      if (!newProperty.location.city || !newProperty.location.state) {
        alert('Please enter both city and state');
        return;
      }

      const propertyData = {
        ...newProperty,
        prop_images: cleanImages(newProperty.prop_images)
      };

      let response;
  const baseUrl = import.meta.env.VITE_API_URL;
      
      // Create payload matching backend expectations
      // AFTER
// const propertyData = {
//   title: newProperty.title,
//   prop_type: newProperty.prop_type,
//   prop_address: newProperty.prop_address,
//   owner_contact: newProperty.owner_contact,
//   prop_amt: newProperty.prop_amt,
//   prop_images: newProperty.prop_images, // Changed to 'prop_images'
//   ad_info: newProperty.ad_info,
//   status: newProperty.status,
//   prop_ad_type: 'rent'
// };

      console.log('Sending property data:', propertyData); // Debug log
      
      
      if (newProperty._id) {
        // Update existing property
        response = await axios.put(`${baseUrl}/api/properties/${newProperty._id}`, propertyData, {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });
        alert('Property updated successfully!');
      } else {
        // Add new property
        response = await axios.post(`${baseUrl}/api/properties`, propertyData, {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });
        alert('Property added successfully!');
      }
      
      // Reset form data
      setNewProperty({
        title: '',
        prop_type: '',
        prop_address: '',
        location: {
          city: '',
          state: ''
        },
        owner_contact: '',
        prop_amt: '',
        prop_images: [],
        ad_info: '',
        status: 'available'
      });
      
      // Refresh properties list
      await fetchProperties();
      handleClose();
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config 
      });
      alert(err.response?.data?.message  || 'Failed to save property');
    }
  };

  // These functions are already defined above

  const toggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const property = properties.find(p => p._id === id);
      const newStatus = property.status === "available" ? "booked" : "available";
      
      await axios.patch(`${BASE_URL}/api/properties/${id}/status`, { status: newStatus }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setProperties(properties.map(p => 
        p._id === id ? { ...p, status: newStatus } : p
      ));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${BASE_URL}/api/bookings/${bookingId}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh bookings
      const response = await axios.get(`${BASE_URL}/api/bookings/owner`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBookings(response.data.bookings || []);
    } catch (err) {
      console.error('Error approving booking:', err);
    }
  };

  

   // Add this compression function
const compressImage = async (file, maxWidth = 800, quality = 0.6, maxSizeKB = 500) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
         let result = canvas.toDataURL('image/jpeg', quality);
        
        // Check if we need to reduce quality further
        while (result.length > maxSizeKB * 1024 && quality > 0.1) {
          quality -= 0.1;
          result = canvas.toDataURL('image/jpeg', quality);
        }
        
        resolve(result);
      };
    };
    reader.readAsDataURL(file);
  });
};

  const handleRejectBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${BASE_URL}/api/bookings/${bookingId}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh bookings
      const response = await axios.get(`${BASE_URL}/api/bookings/owner`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBookings(response.data.bookings || []);
    } catch (err) {
      console.error('Error rejecting booking:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('token');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if the server request fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "available": return "Available";
      case "pending": return "Pending";
      case "booked": return "Booked";
      default: return status;
    }
  };

  // Update image handling
const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    try {
      const compressedImages = await Promise.all(
        files.map(async file => {
          return await compressImage(file, 800, 0.6, 500);
        })
      );
      setNewProperty(prev => ({
        ...prev,
        prop_images: [...(prev.prop_images || []), ...compressedImages]
      }));
    } catch (err) {
      console.error('Error processing images:', err);
      alert('Error processing images. Please try again with different images.');
    }
  };

  const isValidImage = (imgData) => {
  if (!imgData) return false;
  if (imgData.startsWith('data:image')) {
    // Basic validation for base64 images
    return imgData.length > 100; // Minimum length for a valid image
  }
  return true;
};

  const getStatusBadge = (status) => {
    switch (status) {
      case "available": return "success";
      case "pending": return "warning";
      case "booked": return "danger";
      default: return "secondary";
    }
  };

  const fallbackImage = "/no-image.png";

const getValidImage = (img) => {
  if (!img) return fallbackImage;
  if (img.startsWith("data:image")) return img;
  if (img.startsWith("http")) return img;
  if (img.startsWith("https")) return img;
  if (img.includes('://')) return img; // Handle any other URL scheme
  return `${BASE_URL}/uploads/${img}`;
};

  const PropertyCard = ({ property, onViewDetails }) => {
  // Combine both prop_images and images arrays, and handle cases where they might be strings
  const allImages = [
    ...(Array.isArray(property.prop_images) ? property.prop_images : []),
    ...(Array.isArray(property.images) ? property.images : []),
    ...(typeof property.prop_images === 'string' ? [property.prop_images] : []),
    ...(typeof property.images === 'string' ? [property.images] : [])
  ];
  
  const images = allImages.length > 0 ? allImages : [fallbackImage];
  
  console.log('Property images:', {
    property_id: property._id,
    original_images: property.prop_images,
    processed_images: images
  });

  return (
    <Card className="h-100 shadow-sm">
      <div style={{ width: '100%', height: '200px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
        <Carousel interval={null} indicators={images.length > 1}>
          {images.map((img, idx) => (
            <Carousel.Item key={idx}>
              <img
                src={getValidImage(img)}
                alt={`${property.title} - ${idx + 1}`}
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                onError={(e) => {
                  console.error('Image load error for property:', property._id, 'image:', img);
                  e.target.src = fallbackImage;
                }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      </div>
      <Card.Body>
        <Card.Title>{property.title}</Card.Title>
        <Card.Text>
          <strong>Location:</strong> {property.location?.city || ''}, {property.location?.state || ''}<br />
          <strong>Rent:</strong> ₹{property.prop_amt}/month<br />
          <strong>Type:</strong> {property.prop_type}<br />
          <strong>Status:</strong> {property.status}
        </Card.Text>
        <Button 
          variant="primary" 
          onClick={() => onViewDetails(property._id)}
          className="w-100"
        >
          View Details
        </Button>
      </Card.Body>
    </Card>
  );
};

  const handleImageError = (e) => {
  // Check if the error is from a base64 image
  if (e.target.src.startsWith('data:image')) {
    console.error('Invalid base64 image data');
  }
  
  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
  e.target.onerror = null; // Prevent infinite loop
};
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🏠 Owner Dashboard</h2>
        <Button variant="danger" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
          <Button variant="link" onClick={() => setError(null)}>Dismiss</Button>
        </div>
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="properties" title="Properties">
          <div className="text-end mb-3">
            <Button variant="success" onClick={handleShow}>
              + Add Property
            </Button>
          </div>

          <div className="property-list">
            {isLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading properties...</span>
                </Spinner>
              </div>
            ) : Array.isArray(properties) && properties.length > 0 ? (
              <div className="row g-4">
                {properties.map((property) => (
                  <div className="col-lg-4 col-md-6 mb-4" key={property._id}>
                    <Card className="property-card shadow p-3 h-100 d-flex flex-column">
                      <div className="property-image-container mb-3" style={{ height: '200px', overflow: 'hidden' }}>
                        {property.prop_images?.length > 0 ? (
                          <Card.Img
                            variant="top"
                            src={property.prop_images[0]}
                            alt={property.prop_address}
                            className="h-100"
                            style={{ objectFit: 'cover' }}
                            onError={handleImageError}
                          />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center bg-light w-100 h-100">
                            <span className="text-muted">No Image</span>
                          </div>
                        )}
                      </div>
                      
                    
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="d-flex justify-content-between">
                          <span>
                            {property.title || 'Property'} 
                            <Badge bg={getStatusBadge(property.status)} className="ms-2">
                              {getStatusDisplay(property.status)}
                            </Badge>
                          </span>
                        </Card.Title>
                        
                        <Card.Subtitle className="mb-2 text-muted">
                          {property.prop_type || 'Property Type'}
                        </Card.Subtitle>
                        
                        <Card.Text>
                          <strong>Address:</strong> {property.prop_address || 'Not specified'}<br/>
                          <strong>Location:</strong> {(property.location?.city || '') + (property.location?.city && property.location?.state ? ', ' : '') + (property.location?.state || '')}<br/>
                          <strong>Price:</strong> ₹{property.prop_amt?.toLocaleString() || '0'}<br/>
                          <strong>Description:</strong> {property.ad_info || 'No description'}
                        </Card.Text>
                        
                        <div className="mt-auto d-flex flex-wrap gap-2">
                          <Button variant="outline-warning" size="sm" onClick={() => handleEdit(property)}>
                            Edit
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(property._id)}>
                            Delete
                          </Button>
                          <Button 
                            variant={property.status === "available" ? "outline-info" : "outline-success"} 
                            size="sm"
                            onClick={() => toggleStatus(property._id)}
                            disabled={property.status === "pending"}
                          >
                            {property.status === "available" ? "Mark as Booked" : "Mark as Available"}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p>No properties found. All properties from the backend will be shown here once available.</p>
                <Button variant="primary" onClick={handleShow}>
                  Add Your First Property
                </Button>
              </div>
            )}
          </div>
        </Tab>

        <Tab eventKey="bookings" title="Bookings">
          <div className="booking-list">
            {isLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading bookings...</span>
                </Spinner>
              </div>
            ) : Array.isArray(bookings) && bookings.length > 0 ? 
            bookings.map((booking) => (
  <Card key={booking._id} className="mb-3 shadow">
    <Card.Body>
      <Card.Title>
        {booking.propertyId?.title || booking.propertyName || booking.propertyId?.prop_address || 'Property'} in 
        {booking.propertyId?.location?.city || 'Unknown'}
      </Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              Renter: {booking.userId?.name || 'Unknown'}
            </Card.Subtitle>
            <Card.Text>
              <strong>Dates:</strong>{' '}
              {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'} to{' '}
              {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}
            </Card.Text>
            <Badge
              bg={
                booking.status === "approved"
                  ? "success"
                  : booking.status === "rejected"
                  ? "danger"
                  : "warning"
              }
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
            <div className="mt-3">
              {booking.status === "pending" && (
                <>
                  <Button
                    variant="success"
                    size="sm"
                    className="me-2"
                    onClick={() => handleApproveBooking(booking._id)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRejectBooking(booking._id)}
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
          </Card.Body>
        </Card>
      )) : (
        <div className="text-center py-4">
          <p>No bookings found</p>
        </div>
      )}
     </div>
    </Tab>

    <Tab eventKey="messages" title="💬 Messages">
      <div className="mt-4">
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading messages...</span>
            </Spinner>
          </div>
        ) : (
          <div className="row">
            {/* Conversations List */}
            <div className="col-md-4">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Conversations</h5>
                </Card.Header>
                <Card.Body style={{ maxHeight: '400px', overflowY: 'auto', padding: '0' }}>
                  {conversations.length > 0 ? conversations.map((conversation) => (
                    <div
                      key={conversation._id}
                      className={`p-3 border-bottom cursor-pointer ${selectedConversation?._id === conversation._id ? 'bg-light' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => selectConversation(conversation)}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{conversation.otherUser.name}</strong>
                          {conversation.unreadCount > 0 && (
                            <Badge bg="primary" className="ms-2">{conversation.unreadCount}</Badge>
                          )}
                          <div className="text-muted small">
                            {conversation.lastMessage.content.length > 50 
                              ? conversation.lastMessage.content.substring(0, 50) + '...'
                              : conversation.lastMessage.content
                            }
                          </div>
                        </div>
                        <small className="text-muted">
                          {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4 text-muted">
                      No conversations yet
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>

            {/* Message Thread */}
            <div className="col-md-8">
              {selectedConversation ? (
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Chat with {selectedConversation.otherUser.name}</h5>
                  </Card.Header>
                  <Card.Body>
                    <div style={{ height: '300px', overflowY: 'auto', marginBottom: '10px' }} className="border rounded p-2">
                      {messages.length > 0 ? messages.map((message) => {
                        const isFromCurrentUser = message.senderId._id === currentUser?._id || message.senderId === currentUser?._id;
                        return (
                          <div key={message._id} className={`mb-2 ${isFromCurrentUser ? 'text-end' : ''}`}>
                            <div className={`d-inline-block p-2 rounded ${
                              isFromCurrentUser 
                                ? 'bg-primary text-white' 
                                : 'bg-light'
                            }`} style={{ maxWidth: '70%' }}>
                              <div>{message.content}</div>
                              <small className={`d-block mt-1 ${isFromCurrentUser ? 'text-light' : 'text-muted'}`}>
                                {message.senderName} • {new Date(message.createdAt).toLocaleTimeString()}
                              </small>
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="text-center text-muted py-3">
                          No messages yet
                        </div>
                      )}
                    </div>
                    <Form onSubmit={sendMessage} className="d-flex gap-2">
                      <Form.Control
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        style={{ flex: 1 }}
                      />
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={newMessage.trim() === ''}
                      >
                        Send
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              ) : (
                <Card>
                  <Card.Body className="text-center py-5 text-muted">
                    Select a conversation to start chatting
                  </Card.Body>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </Tab>
  </Tabs>

      {/* Modal for Add/Edit Property */}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{newProperty._id ? "Edit Property" : "Add Property"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleAddProperty();
          }}>
            <div className="row">
              <div className="col-md-6">
                <Form.Group controlId="formTitle" className="mb-3">
                  <Form.Label>Title*</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={newProperty.title}
                    onChange={handleChange}
                    placeholder="Property title"
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group controlId="formType" className="mb-3">
                  <Form.Label>Type*</Form.Label>
                  <Form.Control
                    as="select"
                    name="prop_type"
                    value={newProperty.prop_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Cottage">Cottage</option>
                  </Form.Control>
                </Form.Group>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <Form.Group controlId="formCity" className="mb-3">
                  <Form.Label>City*</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    value={newProperty.location.city}
                    onChange={handleChange}
                    placeholder="City"
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group controlId="formState" className="mb-3">
                  <Form.Label>State*</Form.Label>
                  <Form.Control
                    type="text"
                    name="state"
                    value={newProperty.location.state}
                    onChange={handleChange}
                    placeholder="State"
                    required
                  />
                </Form.Group>
              </div>
            </div>
            <Form.Group controlId="formAddress" className="mb-3">
              <Form.Label>Full Address*</Form.Label>
              <Form.Control
                type="text"
                name="prop_address"
                value={newProperty.prop_address}
                onChange={handleChange}
                placeholder="Full address including city, state"
                required
              />
            </Form.Group>
            <div className="row">
              <div className="col-md-6">
                <Form.Group controlId="formContact" className="mb-3">
                  <Form.Label>Contact Number*</Form.Label>
                  <Form.Control
                    type="text"
                    name="owner_contact"
                    value={newProperty.owner_contact}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group controlId="formAmount" className="mb-3">
                  <Form.Label>Price*</Form.Label>
                  <Form.Control
                    type="number"
                    name="prop_amt"
                    value={newProperty.prop_amt}
                    onChange={handleChange}
                    placeholder="₹"
                    required
                  />
                </Form.Group>
              </div>
            </div>
            <Form.Group controlId="formImages" className="mb-3">
              <Form.Label>Upload Images</Form.Label>
              {newProperty.prop_images.map((img, index) => (
                <div key={index} className="mb-2">
                  {img.startsWith('data:image') ? (
                    <img 
                      src={img} 
                      alt={`Property ${index}`} 
                      style={{ maxWidth: '100%', maxHeight: '150px' }}
                    />
                  ) : (
                    <span>{img}</span>
                  )}
                </div>
              ))}
              <Form.Control
                type="file"
                multiple
                onChange={handleImageUpload}
              />
              <Form.Text className="text-muted">
                Upload images of your property
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="formDescription" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="ad_info"
                rows={3}
                value={newProperty.ad_info}
                onChange={handleChange}
                placeholder="Describe your property..."
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleClose} type="button">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {newProperty._id ? "Update Property" : "Add Property"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
        {/* Modal.Footer removed: buttons are now only inside the Form for correct UX */}
      </Modal>
    </div>
  );
};

const BookingsTab = ({ bookings, handleStatusUpdate }) => {
  return (
    <div className="container mt-4">
      <div className="row">
        {bookings.map((booking) => (
          <div key={booking._id} className="col-md-6 col-lg-4 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">Booking Request</h5>
                <p className="card-text">
                  <strong>Property:</strong> {booking.property?.title}<br />
                  <strong>Renter:</strong> {booking.renter?.name}<br />
                  <strong>Check-in:</strong> {new Date(booking.checkIn).toLocaleDateString()}<br />
                  <strong>Check-out:</strong> {new Date(booking.checkOut).toLocaleDateString()}<br />
                  <strong>Status:</strong> <span className={`badge bg-${getStatusColor(booking.status)}`}>{booking.status}</span>
                </p>
                {booking.status === 'pending' && (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleStatusUpdate(booking._id, 'approved')}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'approved': return 'success';
    case 'rejected': return 'danger';
    case 'pending': return 'warning';
    default: return 'secondary';
  }
};

export default OwnerDashboard;