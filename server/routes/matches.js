const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

// Send follow request (Like)
router.post('/like/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id || req.user._id;

    if (currentUserId === userId) return res.status(400).json({ message: "You can't like yourself" });

    try {
      // Check if already matched
      const existingMatch = await prisma.match.findUnique({
        where: { userId_matchedId: { userId: currentUserId, matchedId: userId } }
      });
      if (existingMatch) return res.status(400).json({ message: 'You are already connected.' });

      // Create like/request
      await prisma.like.upsert({
        where: { fromUserId_toUserId: { fromUserId: currentUserId, toUserId: userId } },
        update: {},
        create: { fromUserId: currentUserId, toUserId: userId }
      });

      // Optional: Auto-match if recipient already liked sender
      const backLike = await prisma.like.findUnique({
        where: { fromUserId_toUserId: { fromUserId: userId, toUserId: currentUserId } }
      });

      if (backLike) {
        // Create mutual matches
        await prisma.match.createMany({
          data: [
            { userId: currentUserId, matchedId: userId },
            { userId: userId, matchedId: currentUserId }
          ],
          skipDuplicates: true
        });
        // Delete likes as they are now matches
        await prisma.like.deleteMany({
          where: {
            OR: [
              { fromUserId: currentUserId, toUserId: userId },
              { fromUserId: userId, toUserId: currentUserId }
            ]
          }
        });
      }

      res.json({ message: backLike ? 'It is a match!' : 'Follow request sent' });
    } catch (dbError) {
      console.warn('Prisma like error:', dbError.message);
      res.status(503).json({ message: 'Database error' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get follow requests received
router.get('/requests', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    try {
      const requests = await prisma.like.findMany({
        where: { toUserId: userId },
        include: {
          fromUser: {
            include: { college: true }
          }
        }
      });

      const formatted = requests.map(r => ({
        id: r.fromUser.id,
        _id: r.fromUser.id,
        firstName: r.fromUser.firstName,
        lastName: r.fromUser.lastName,
        college: r.fromUser.college?.name,
        profile: r.fromUser.profile ? JSON.parse(r.fromUser.profile) : {},
        sentAt: r.createdAt
      }));

      res.json(formatted);
    } catch (e) {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept follow request
router.post('/accept/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id || req.user._id;

    try {
      // Check for pending request
      const like = await prisma.like.findUnique({
        where: { fromUserId_toUserId: { fromUserId: userId, toUserId: currentUserId } }
      });
      if (!like) return res.status(400).json({ message: 'No pending request' });

      // Create mutual match
      await prisma.match.createMany({
        data: [
          { userId: currentUserId, matchedId: userId },
          { userId: userId, matchedId: currentUserId }
        ],
        skipDuplicates: true
      });

      // Cleanup like
      await prisma.like.delete({
        where: { id: like.id }
      });

      res.json({ message: 'Request accepted', userId });
    } catch (e) {
      res.status(503).json({ message: 'Database error' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject follow request
router.post('/reject/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id || req.user._id;
    try {
      await prisma.like.deleteMany({
        where: { fromUserId: userId, toUserId: currentUserId }
      });
      res.json({ message: 'Request rejected' });
    } catch (e) {
      res.status(503).json({ message: 'Database error' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Pass on a user
router.post('/pass/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id || req.user._id;
    try {
      await prisma.passed.upsert({
        where: { userId_passedId: { userId: currentUserId, passedId: userId } },
        update: {},
        create: { userId: currentUserId, passedId: userId }
      });
      res.json({ message: 'Passed on user' });
    } catch (e) {
      res.status(503).json({ message: 'Database error' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all matches
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    try {
      const matchRecords = await prisma.match.findMany({
        where: { userId: userId },
        include: {
          matchedUser: {
            include: { college: true }
          }
        }
      });

      const formatted = matchRecords.map(m => {
        const u = m.matchedUser;
        return {
          id: u.id,
          _id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          college: u.college?.name,
          profile: u.profile ? JSON.parse(u.profile) : {},
          matchedAt: m.createdAt
        };
      });

      res.json(formatted);
    } catch (e) {
      console.warn('Get matches error:', e.message);
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

