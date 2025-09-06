import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';

const AddPropertyForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    prop_type: '',
    prop_ad_type: 'For Rent', // Added this line
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'city' || name === 'state') {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    
    setFormData({
      title: '',
      prop_type: '',
      prop_ad_type: 'For Rent', // Added this line
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
  };

  return (
    <Card className="mb-4 p-3 shadow-sm">
      <h5>Add New Property</h5>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-2">
          <Form.Label>Title</Form.Label>
          <Form.Control 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            required 
            placeholder="Enter property title"
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Property Type</Form.Label>
          <Form.Control 
            name="prop_type" 
            value={formData.prop_type} 
            onChange={handleChange} 
            required 
            placeholder="e.g., Apartment, Villa, House"
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Advertisement Type</Form.Label>
          <Form.Control 
            as="select"
            name="prop_ad_type" 
            value={formData.prop_ad_type} 
            onChange={handleChange} 
            required
          >
            <option value="For Rent">For Rent</option>
            <option value="For Sale">For Sale</option>
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Address</Form.Label>
          <Form.Control 
            name="prop_address" 
            value={formData.prop_address} 
            onChange={handleChange} 
            required 
            placeholder="Enter full address"
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>City</Form.Label>
          <Form.Control 
            name="city" 
            value={formData.location.city} 
            onChange={handleChange} 
            required 
            placeholder="Enter city name"
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>State</Form.Label>
          <Form.Control 
            name="state" 
            value={formData.location.state} 
            onChange={handleChange} 
            required 
            placeholder="Enter state name"
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Contact Number</Form.Label>
          <Form.Control 
            name="owner_contact" 
            value={formData.owner_contact} 
            onChange={handleChange} 
            required 
            placeholder="Enter contact number"
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Rent Amount (₹/month)</Form.Label>
          <Form.Control 
            name="prop_amt" 
            type="number" 
            value={formData.prop_amt} 
            onChange={handleChange} 
            required 
            placeholder="Enter monthly rent"
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Additional Information</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            name="ad_info" 
            value={formData.ad_info} 
            onChange={handleChange} 
            placeholder="Enter additional details about the property"
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Image URLs (One per line)</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3}
            name="prop_images" 
            value={Array.isArray(formData.prop_images) ? formData.prop_images.join('\n') : ''} 
            onChange={(e) => setFormData({
              ...formData,
              prop_images: e.target.value.split('\n').filter(url => url.trim())
            })}
            placeholder="Enter image URLs (one per line)"
          />
        </Form.Group>

        <Button type="submit" variant="success" className="mt-2">Add Property</Button>
      </Form>
    </Card>
  );
};

export default AddPropertyForm;
