import React from 'react';
import { Form, Button, Container, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/contact.css';

const ContactPage = () => (
  <div className="contact-bg">
    <Container className="d-flex justify-content-center align-items-center h-100">
      <Card className="contact-card shadow-lg">
        <Card.Body>
          <h2 className="text-center mb-4">Get in Touch</h2>
          <Form>
            <Form.Group controlId="name" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" placeholder="Your full name" />
            </Form.Group>
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" placeholder="Your email" />
            </Form.Group>
            <Form.Group controlId="message" className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control as="textarea" rows={4} placeholder="How can we help?" />
            </Form.Group>
            <Button variant="success" type="submit" className="w-100">
              Send Message
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  </div>
);

export default ContactPage;
