import React from 'react';
import { Card, Button } from 'react-bootstrap';

const PropertyCard = ({ property }) => {
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Img variant="top" src={property.image || 'https://via.placeholder.com/300'} />
      <Card.Body>
        <Card.Title>{property.title}</Card.Title>
        <Card.Text>
          📍 <strong>Location:</strong> {property.location} <br />
          💰 <strong>Price:</strong> ₹{property.price} / month<br />
          🛏️ <strong>BHK:</strong> {property.bhk}
        </Card.Text>
        <Button variant="primary">Book Now</Button>
      </Card.Body>
    </Card>
  );
};

export default PropertyCard;

