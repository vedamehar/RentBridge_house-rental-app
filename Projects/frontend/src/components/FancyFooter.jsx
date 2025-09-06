import React from "react";
import { Link } from "react-router-dom";
import "./FancyFooter.css";

const FancyFooter = () => {
  return (
    <footer className="footer bg-dark text-white pt-5 pb-4">
      <div className="container text-center text-md-left">
        <div className="row">
          <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-warning">RentBridge</h5>
            <p>
              Your smart gateway to finding, renting, and managing properties
              all in one place.
            </p>
          </div>

          <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-warning">Quick Links</h5>
            <p><Link to="/" className="text-white">Home</Link></p>
            <p><Link to="/login" className="text-white">Login</Link></p>
            <p><Link to="/register" className="text-white">Register</Link></p>
            <p><Link to="/contact" className="text-white">Contact</Link></p>
          </div>

          <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-warning">Contact</h5>
            <p><i className="bi bi-house-door me-2"></i> Pune, Maharashtra, India</p>
            <p><i className="bi bi-envelope me-2"></i> support@rentbridge.com</p>
            <p><i className="bi bi-phone me-2"></i> +91 1234567890</p>
          </div>
        </div>

        <hr className="mb-4" />
        <div className="row align-items-center">
          <div className="col-md-7 col-lg-8">
            <p>© {new Date().getFullYear()} RentBridge. All rights reserved.</p>
          </div>
          <div className="col-md-5 col-lg-4">
            <div className="text-center text-md-right">
              <a href="https://www.facebook.com/share/1ahp8Z1DZK/" className="text-white me-4"><i className="bi bi-facebook"></i></a>
              <a href="https://www.instagram.com/vedamehar215/" className="text-white me-4"><i className="bi bi-instagram"></i></a>
              <a href="https://www.linkedin.com/in/vedant-mehar-a49036330/" className="text-white me-4"><i className="bi bi-linkedin"></i></a>
              <a href="https://github.com/vedamehar" className="text-white me-4"><i className="bi bi-github"></i></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FancyFooter;
