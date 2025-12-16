const express = require('express');
const router = express.Router();
const College = require('../models/College');
const Cluster = require('../models/Cluster');

// Get all colleges
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim();
    const filter = q
      ? { name: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
      : {};

    const colleges = await College.find(filter)
      .select('name category genderType location clusterId')
      .sort({ name: 1 })
      .limit(1000);

    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all clusters
router.get('/clusters', async (req, res) => {
  try {
    const clusters = await Cluster.find({ isActive: true })
      .populate('colleges');
    res.json(clusters);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create college (admin only - for seeding)
router.post('/', async (req, res) => {
  try {
    const { name, emailDomain, location, category, genderType } = req.body;
    
    const college = new College({
      name,
      emailDomain,
      location,
      category,
      genderType,
    });
    
    await college.save();
    res.status(201).json(college);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

