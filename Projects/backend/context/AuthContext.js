import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

// Set up Axios interceptor to add token to headers
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(config => {
       // Only attach token to requests to our API
        if (config.url.startsWith('/api')) {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      return config;
    },error => {
    return Promise.reject(error);
    });

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  const login = async (email, password, role) => {
    try {
      const res = await axios.post('/api/users/login', { 
        email, 
        password,
        role
      });
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setCurrentUser(res.data.user);
      }
      return res.data.user;
    } catch (error) {
      console.error('Login error:', error.response?.data);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/users/logout');
      clearAuthData();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Updated checkAuth - no API call
  const checkAuth = () => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        clearAuthData();
      }
    } else {
      clearAuthData();
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    loading
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