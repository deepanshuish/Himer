const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const fs = require('fs');
const path = require('path');

// Helper to get offline data
function getOfflineColleges() {
  try {
    const p = path.join(__dirname, '../data/colleges.json');
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) { console.error('Error reading offline colleges:', e); }
  return [];
}

function getOfflineClusters() {
  try {
    const p = path.join(__dirname, '../data/clusters.json');
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) { console.error('Error reading offline clusters:', e); }
  return [];
}

// Get all colleges
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim();

    // Check if we have a connection to SQL
    try {
      const colleges = await prisma.college.findMany({
        where: q ? {
          name: {
            contains: q
          }
        } : {},
        select: {
          id: true,
          name: true,
          category: true,
          genderType: true,
          city: true,
          state: true,
          clusterId: true
        },
        orderBy: {
          name: 'asc'
        },
        take: 1000
      });

      // Map to maintain compatibility with frontend (id -> _id)
      const formattedColleges = colleges.map(c => ({
        ...c,
        _id: c.id,
        location: { city: c.city, state: c.state }
      }));

      return res.json(formattedColleges);
    } catch (dbError) {
      console.warn('Prisma Error, falling back to offline data:', dbError.message);
      let colleges = getOfflineColleges();
      const lowerQ = q.toLowerCase();
      if (lowerQ) {
        colleges = colleges.filter(c => c.name.toLowerCase().includes(lowerQ));
      }
      return res.json(colleges);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all clusters
router.get('/clusters', async (req, res) => {
  try {
    try {
      const clusters = await prisma.cluster.findMany({
        where: { isActive: true },
        include: {
          colleges: true
        }
      });
      // Map to maintain compatibility
      const formattedClusters = clusters.map(c => ({
        ...c,
        _id: c.id,
        colleges: c.colleges.map(col => ({ ...col, _id: col.id }))
      }));
      return res.json(formattedClusters);
    } catch (dbError) {
      return res.json(getOfflineClusters());
    }
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

