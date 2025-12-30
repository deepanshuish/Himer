const express = require('express');
const cors = require('cors');
const prisma = require('./utils/prisma');
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
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (e) {
    dbStatus = 'error: ' + e.message;
  }
  res.json({
    status: 'ok',
    message: 'Server is running',
    database: dbStatus,
    mode: 'SQL Server (Azure)'
  });
});

const PORT = process.env.PORT || 5001;

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);

  // Try to connect to SQL Database
  try {
    await prisma.$connect();
    console.log('✅ Connected to SQL Database (Azure)');
  } catch (error) {
    console.error('❌ SQL Database connection error:', error.message);
    console.error('⚠️  Server is running but database operations will fail if no offline fallback is available.');
    console.error('\n💡 Solutions:');
    console.error('   1. Make sure AZURE SQL is accessible (firewall rules)');
    console.error('   2. Check DATABASE_URL in .env file');
  }
});

module.exports = app;

