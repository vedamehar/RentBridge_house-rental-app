import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Contact from '../pages/Contact';
import OwnerDashboard from '../pages/dashboard/OwnerDashboard';
import RenterDashboard from '../pages/dashboard/RenterDashboard';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/owner-dashboard" element={
        <ProtectedRoute role="owner">
          <OwnerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/renter-dashboard" element={
        <ProtectedRoute role="renter">
          <RenterDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin-dashboard" element={
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;