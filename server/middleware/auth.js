const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Try Prisma (SQL) first
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (user) {
        req.user = user;
        return next();
      }
    } catch (dbError) {
      console.warn('SQL Auth Error, falling back to offline:', dbError.message);
    }

    // Fallback to offline users.json
    try {
      const fs = require('fs');
      const path = require('path');
      const p = path.join(__dirname, '../data/users.json');
      if (fs.existsSync(p)) {
        const users = JSON.parse(fs.readFileSync(p, 'utf8'));
        const user = users.find(u => u._id === decoded.userId || u.id === decoded.userId);
        if (user) {
          req.user = user;
          return next();
        }
      }
    } catch (e) {
      console.error('Offline auth error:', e);
    }

    return res.status(401).json({ message: 'User not found' });

  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { authenticate, JWT_SECRET };

