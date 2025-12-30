const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authenticate, JWT_SECRET } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Helper to get offline data
function getOfflineData(file) {
  try {
    const p = path.join(__dirname, `../data/${file}`);
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) { }
  return [];
}

function saveOfflineData(file, data) {
  try {
    const dir = path.join(__dirname, '../data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, file), JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(`Error saving ${file}:`, e);
  }
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, name, gender, collegeStatus, collegeId } = req.body;

    let finalFirstName = firstName;
    let finalLastName = lastName;
    if (!finalFirstName && !finalLastName && name) {
      const parts = name.trim().split(/\s+/);
      finalFirstName = parts.shift();
      finalLastName = parts.join(' ') || '';
    }

    if (!email || !password || !finalFirstName || !collegeId) {
      return res.status(400).json({ message: 'Name, email, password, and college are required' });
    }
    finalLastName = finalLastName || finalFirstName || 'User';

    // Try Prisma (SQL) first
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      const college = await prisma.college.findUnique({ where: { id: collegeId } });
      if (!college) return res.status(400).json({ message: 'Invalid college selection' });

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: finalFirstName,
          lastName: finalLastName,
          gender,
          collegeStatus,
          collegeId: college.id,
          clusterId: college.clusterId,
          isVerified: true
        },
        include: {
          college: true,
          cluster: true
        }
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          collegeStatus: user.collegeStatus,
          college: user.college.name,
          cluster: user.cluster?.name || 'No Cluster',
          hasCompletedOnboarding: user.hasCompletedOnboarding,
          homepageUnlockAt: user.homepageUnlockAt
        }
      });
    } catch (dbError) {
      console.warn('Prisma Registration Error, falling back to offline:', dbError.message);
    }

    // --- OFFLINE FALLBACK ---
    const users = getOfflineData('users.json');
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const colleges = getOfflineData('colleges.json');
    const clustersData = getOfflineData('clusters.json');

    const college = colleges.find(c => c._id === collegeId || c.id === collegeId);
    if (!college) return res.status(400).json({ message: 'Invalid college selection' });

    const cluster = clustersData.find(c => c._id === college.clusterId || c.id === college.clusterId);

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: 'user_' + Date.now(),
      id: 'user_' + Date.now(),
      email,
      password: hashedPassword,
      firstName: finalFirstName,
      lastName: finalLastName,
      gender,
      collegeStatus,
      collegeId: college._id || college.id,
      clusterId: cluster ? (cluster._id || cluster.id) : null,
      isVerified: true,
      hasCompletedOnboarding: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.push(newUser);
    saveOfflineData('users.json', users);

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User created successfully (Offline Mode)',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        gender: newUser.gender,
        collegeStatus: newUser.collegeStatus,
        college: college.name,
        cluster: cluster ? cluster.name : 'Unknown Cluster',
        hasCompletedOnboarding: false
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Prisma Mode
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { college: true, cluster: true }
      });

      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
          return res.json({
            message: 'Login successful',
            token,
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              gender: user.gender,
              collegeStatus: user.collegeStatus,
              college: user.college?.name,
              cluster: user.cluster?.name,
              hasCompletedOnboarding: user.hasCompletedOnboarding,
              homepageUnlockAt: user.homepageUnlockAt
            }
          });
        }
      }
    } catch (dbError) {
      console.warn('Prisma Login Error, falling back to offline:', dbError.message);
    }

    // Offline Mode
    const users = getOfflineData('users.json');
    const user = users.find(u => u.email === email);

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const colleges = getOfflineData('colleges.json');
    const clusters = getOfflineData('clusters.json');
    const userCollege = colleges.find(c => c._id === user.collegeId || c.id === user.collegeId);
    const userCluster = clusters.find(c => c._id === user.clusterId || c.id === user.clusterId);

    const token = jwt.sign({ userId: user.id || user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful (Offline)',
      token,
      user: {
        id: user.id || user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        collegeStatus: user.collegeStatus,
        college: userCollege ? userCollege.name : 'Unknown',
        cluster: userCluster ? userCluster.name : 'Unknown',
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        homepageUnlockAt: user.homepageUnlockAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = req.user;

    // If it's a SQL user (checking for id property and prisma availability)
    try {
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { college: true, cluster: true }
      });
      if (fullUser) {
        delete fullUser.password;
        return res.json(fullUser);
      }
    } catch (e) { }

    // If it's a plain object (offline)
    const colleges = getOfflineData('colleges.json');
    const clusters = getOfflineData('clusters.json');
    const userCollege = colleges.find(c => c._id === user.collegeId || c.id === user.collegeId);
    const userCluster = clusters.find(c => c._id === user.clusterId || c.id === user.clusterId);

    const responseUser = { ...user };
    responseUser.college = userCollege || null;
    responseUser.cluster = userCluster || null;
    delete responseUser.password;

    res.json(responseUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;

