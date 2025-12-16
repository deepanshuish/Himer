const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const College = require('../models/College');
const Cluster = require('../models/Cluster');
const { authenticate, JWT_SECRET } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
	  try {
	    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database not connected. Please check MongoDB connection.',
        error: 'MongoDB connection is not ready. Make sure MongoDB is running.'
      });
    }

	    const { email, password, firstName, lastName, name, gender, collegeStatus, collegeId } = req.body;

    // Derive first/last name from single "name" field if provided
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

    // Ensure lastName is present to satisfy schema validation
    finalLastName = finalLastName || finalFirstName || 'User';

    // Check if user exists
	    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // College is chosen by dropdown (no email verification)
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(400).json({ message: 'Invalid college selection' });
    }

    // Get or assign cluster
    let cluster = null;
    
    if (college.clusterId) {
      cluster = await Cluster.findById(college.clusterId).populate('colleges');
    }
    
    if (!cluster) {
      return res.status(400).json({
        message: 'This college is not assigned to a cluster yet. Please run the seed script to generate clusters.',
      });
    }

    // Create user
	    const user = new User({
      email,
      password,
      firstName: finalFirstName,
      lastName: finalLastName,
	      gender,
	      collegeStatus,
	      college: college._id,
	      cluster: cluster._id,
	      isVerified: true, // No email verification in this version
	    });

    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

	    res.status(201).json({
	      message: 'User created successfully',
	      token,
	      user: {
	        id: user._id,
	        email: user.email,
	        firstName: user.firstName,
	        lastName: user.lastName,
	        gender: user.gender,
	        collegeStatus: user.collegeStatus,
	        college: college.name,
	        cluster: cluster.name,
	        hasCompletedOnboarding: user.hasCompletedOnboarding,
	        homepageUnlockAt: user.homepageUnlockAt,
	      },
	    });
  } catch (error) {
    console.error('Registration error:', error);
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        error: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

	    const user = await User.findOne({ email }).populate('college cluster');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

	    res.json({
	      message: 'Login successful',
	      token,
	      user: {
	        id: user._id,
	        email: user.email,
	        firstName: user.firstName,
	        lastName: user.lastName,
	        gender: user.gender,
	        collegeStatus: user.collegeStatus,
	        college: user.college?.name,
	        cluster: user.cluster?.name,
	        hasCompletedOnboarding: user.hasCompletedOnboarding,
	        homepageUnlockAt: user.homepageUnlockAt,
	      },
	    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('college cluster');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

