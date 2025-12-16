// Helper script to check if server can start
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect';

console.log('Checking MongoDB connection...');
console.log('MongoDB URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    console.log('You can now start the server with: npm run dev:server');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed!');
    console.error('Error:', error.message);
    console.log('\n💡 Solutions:');
    console.log('1. Make sure MongoDB is installed and running');
    console.log('2. Or use MongoDB Atlas (cloud) and update MONGODB_URI in .env');
    console.log('3. The server will still start, but database operations will fail');
    process.exit(1);
  });

