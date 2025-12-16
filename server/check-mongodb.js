// Quick script to check MongoDB connection
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect';

console.log('🔍 Checking MongoDB connection...');
console.log('📍 URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

mongoose.connect(MONGODB_URI, options)
  .then(() => {
    console.log('✅ SUCCESS: MongoDB is connected and accessible!');
    console.log('✅ Database:', mongoose.connection.db.databaseName);
    console.log('✅ You can now use the application.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ FAILED: Cannot connect to MongoDB');
    console.error('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 MongoDB is not running!');
      console.error('\nTo start MongoDB:');
      console.error('  Windows: net start MongoDB');
      console.error('  Mac:     brew services start mongodb-community');
      console.error('  Linux:   sudo systemctl start mongod');
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 MongoDB connection timed out!');
      console.error('  - Check if MongoDB is running');
      console.error('  - Check if the port is correct (default: 27017)');
      console.error('  - Check firewall settings');
    } else if (error.message.includes('authentication')) {
      console.error('\n💡 Authentication failed!');
      console.error('  - Check your MongoDB username and password');
      console.error('  - Update MONGODB_URI in .env file');
    }
    
    console.error('\n📚 Alternative: Use MongoDB Atlas (free cloud database)');
    console.error('  Visit: https://www.mongodb.com/cloud/atlas');
    console.error('  Get connection string and update MONGODB_URI in .env');
    
    process.exit(1);
  });

