import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
      
      const response = await axios.get('http://localhost:5000/api/users/me', {
        withCredentials: true
      });
      
      if (response.data.user) {
        setCurrentUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (err) {
      localStorage.removeItem('user');
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    setError(null);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/users/login',
        { email, password, role },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success && response.data.user) {
        // Verify user role matches the role they're trying to log in as
        if (response.data.user.type !== role) {
          throw new Error(`Invalid role. You are registered as a ${response.data.user.type}`);
        }
        setCurrentUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/users/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and state, even if the server request fails
      setCurrentUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      // Clear any axios default headers
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}