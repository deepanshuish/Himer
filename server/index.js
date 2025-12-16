const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 photos
app.use(express.urlencoded({ limit: '50mb', extended: true }));

	// Routes
	app.use('/api/auth', require('./routes/auth'));
	app.use('/api/users', require('./routes/users'));
	app.use('/api/matches', require('./routes/matches'));
	app.use('/api/colleges', require('./routes/colleges'));
	app.use('/api/chat', require('./routes/chat'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect';

// MongoDB connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 10s
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
};

// Start server regardless of MongoDB connection
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  
  // Try to connect to MongoDB
  mongoose.connect(MONGODB_URI, mongooseOptions)
    .then(() => {
      console.log('✅ Connected to MongoDB');
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error.message);
      console.error('⚠️  Server is running but database operations will fail.');
      console.error('\n💡 Solutions:');
      console.error('   1. Make sure MongoDB is installed and running');
      console.error('   2. Start MongoDB: net start MongoDB (Windows) or brew services start mongodb-community (Mac)');
      console.error('   3. Or use MongoDB Atlas (free cloud): https://www.mongodb.com/cloud/atlas');
      console.error('   4. Update MONGODB_URI in .env file if using cloud MongoDB');
    });
});

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

module.exports = app;

