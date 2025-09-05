const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();


// Correct CORS config for frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CORS_ORIGIN || 'https://your-app.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Cookie parser for reading cookies in auth middleware
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', {
    authorization: req.headers.authorization,
    cookie: req.headers.cookie
  });
  next();
});

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true })); // Add this for form data

// Route files
const users = require('./routes/UserRoutes');
const properties = require('./routes/PropertyRoutes');
const bookings = require('./routes/BookingRoute');
const admin = require('./routes/adminRoutes');
// const messages = require('./routes/messageRoutes');
const contact = require('./routes/contactRoutes');

// Mount routers
app.use('/api/users', users);
app.use('/api/properties', properties);
app.use('/api/bookings', bookings);
app.use('/api/admin', admin);
// app.use('/api/messages', messages);
app.use('/api/contact', contact);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'RentBridge Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Single error middleware (removed duplicate)
app.use((err, req, res, next) => {
  console.error('Server Error:', {
    message: err.message,
    stack: err.stack,
    type: err.name,
    ...(err.status && { status: err.status })
  });
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack
    })
  });
});

// JWT secret check
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined');
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});