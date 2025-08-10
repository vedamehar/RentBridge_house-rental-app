// App.jsx - Updated with proper routing and protected routes
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Page components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';
import RenterDashboard from './pages/dashboard/RenterDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import DetailedProperty from './pages/DetailedProperty';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Chat from './components/Chat';
import Unauthorized from './pages/Unauthorized';

// Layout components
import FancyNavbar from './components/FancyNavbar';
import FancyFooter from './components/FancyFooter';

import './App.css';
import './assets/app.css';

const AppContent = () => {
  const { currentUser, loading } = useAuth();
  const [appInitialized, setAppInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 800 });
    setAppInitialized(true);
  }, []);

  useEffect(() => {
    if (currentUser && window.location.pathname.includes('dashboard')) {
      const currentPath = window.location.pathname;
      const correctPath = `/${currentUser.type}-dashboard`;
      if (!currentPath.includes(currentUser.type)) {
        navigate(correctPath);
      }
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (currentUser && currentUser.type === 'renter') {
      navigate('/renter-dashboard');
    }
  }, [currentUser, navigate]);

  if (!appInitialized || loading) {
    return (
      <div className="loading-screen d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <FancyNavbar />
      <div className="main-content">
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={
                !currentUser ? <Login /> : <Navigate to={`/${currentUser.type}-dashboard`} replace />
              } 
            />
            <Route 
              path="/register" 
              element={
                !currentUser ? <Register /> : <Navigate to={`/${currentUser.type}-dashboard`} replace />
              } 
            />
            <Route path="/contact" element={<Contact />} />

            {/* Protected Renter Routes */}
            <Route
              path="/renter-dashboard"
              element={
                currentUser && currentUser.type === 'renter'
                  ? <RenterDashboard />
                  : currentUser === null
                    ? <Navigate to="/login" replace />
                    : null
              }
            />
            <Route
              path="/property/:id"
              element={
                <ProtectedRoute allowedRoles={['renter', 'owner']}>
                  <DetailedProperty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:ownerId"
              element={
                <ProtectedRoute allowedRoles={['renter', 'owner']}>
                  <Chat />
                </ProtectedRoute>
              }
            />

            {/* Protected Owner Routes */}
            <Route
              path="/owner-dashboard"
              element={
                currentUser && currentUser.type === 'owner'
                  ? <OwnerDashboard />
                  : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['owner', 'renter']}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Unauthorized and Not Found Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <FancyFooter />
      </div>
  );
};

const App = () => <AppContent />;

export default App;