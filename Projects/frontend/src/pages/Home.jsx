import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { Link } from 'react-router-dom';

const Home = () => { 
  return (

    <div style={{ marginTop: '30px' }}>
      {/* Hero Section Carousel */}
      <Carousel interval={3000} false>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
            alt=""
            style={{ maxHeight: '90vh', objectFit: 'cover' }}
          />
          <Carousel.Caption>
            <h1 className="fw-bold">Welcome to Rent Bridge</h1>
            <p>Your trusted platform for renting and leasing properties</p>
            <Link to="/login" className="btn btn-primary me-3">Get Started</Link>
            <Link to="/register" className="btn btn-outline-light">Sign Up</Link>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://png.pngtree.com/background/20230616/original/pngtree-daylight-view-of-contemporary-house-with-terrace-in-3d-rendering-picture-image_3653767.jpg"
            alt=""
            style={{ maxHeight: '90vh', objectFit: 'cover' }}
          />
          <Carousel.Caption>
            <h1 className="fw-bold">Find. Rent. Relax.</h1>
            <p>We bridge the gap between Owners and Tenants with ease</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>

      {/* Info Section */}
      <Container className="text-center my-5">
        <h2 className="fw-bold mb-4">Why Choose Rent Bridge?</h2>
        <Row>
          <Col md={4} className="mb-4" data-aos="fade-up">
            <i className="bi bi-building fs-1 text-primary"></i>
            <h5 className="mt-3">Verified Listings</h5>
            <p>All properties are verified for genuine and secure renting.</p>
          </Col>
          <Col md={4} className="mb-4">
            <i className="bi bi-shield-lock fs-1 text-success"></i>
            <h5 className="mt-3">Secure Transactions</h5>
            <p>We ensure encrypted and safe transactions.</p>
          </Col>
          <Col md={4} className="mb-4">
            <i className="bi bi-clock-history fs-1 text-danger"></i>
            <h5 className="mt-3">24/7 Support</h5>
            <p>We are here to assist you anytime you need.</p>
          </Col>
        </Row>

        <div className="mt-5">
          <Button href="/login" variant="primary" size="lg" className="me-3">
            <i className="bi bi-box-arrow-in-right"></i> Login
          </Button>
          <Button href="/register" variant="outline-secondary" size="lg">
            <i className="bi bi-pencil-square"></i> Register
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default Home;
