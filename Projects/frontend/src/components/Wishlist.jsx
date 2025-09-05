import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';

const Wishlist = ({ properties, wishlist, onToggle }) => {
  const filtered = properties.filter((p) => wishlist.includes(p._id));

  if (filtered.length === 0) {
    return (
      <div className="mt-4">
        <h4>❤️ Wishlist</h4>
        <p className="text-muted">Your wishlist is empty. Add properties you like!</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h4>❤️ Wishlist ({filtered.length})</h4>
      <div className="row g-4">
        {filtered.map((property) => (
          <div className="col-md-4" key={property._id}>
            <Card className="h-100 shadow-sm">
              <div style={{ height: '200px', overflow: 'hidden' }}>
                <Card.Img 
                  variant="top" 
                  src={property.prop_images?.[0] || '/no-image.png'} 
                  style={{ 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                  onError={(e) => {
                    e.target.src = '/no-image.png';
                  }}
                />
              </div>
              <Card.Body className="d-flex flex-column">
                <Card.Title className="d-flex justify-content-between align-items-start">
                  {property.title}
                  <Badge bg={property.status === 'available' ? 'success' : 'warning'}>
                    {property.status}
                  </Badge>
                </Card.Title>
                <Card.Text>
                  <strong>Location:</strong> {property.location?.city}, {property.location?.state}<br />
                  <strong>Rent:</strong> ₹{property.prop_amt.toLocaleString()}/month<br />
                  <strong>Type:</strong> {property.prop_type}
                </Card.Text>
                <div className="mt-auto">
                  <Button
                    variant="outline-danger"
                    onClick={() => onToggle(property._id)}
                    className="w-100"
                  >
                    Remove from Wishlist
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
