const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// Helper for offline data
function getOfflineUsers() {
  try {
    const p = path.join(__dirname, '../data/users.json');
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) { }
  return [];
}

// Get user profile by ID
router.get('/profile/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id || req.user._id;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          college: { select: { name: true } },
          tweets: {
            orderBy: { createdAt: 'desc' },
            include: {
              user: { select: { firstName: true, lastName: true, profile: true } },
              likes: { select: { userId: true } },
              replies: {
                include: {
                  user: { select: { firstName: true, lastName: true, profile: true } }
                }
              }
            }
          },
          matches: {
            where: { matchedId: currentUserId }
          }
        }
      });

      if (!user) return res.status(404).json({ message: 'User not found' });

      // Check authorization
      const isOwnProfile = userId === currentUserId;
      const isMatched = user.matches.length > 0;

      if (!isOwnProfile && !isMatched) {
        return res.status(403).json({ message: 'Not authorized to view this profile' });
      }

      // Format for frontend
      const formattedUser = {
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        college: user.college,
        profile: user.profile ? JSON.parse(user.profile) : {},
        tweets: user.tweets.map(t => ({
          ...t,
          _id: t.id,
          likes: t.likes.map(l => l.userId), // Convert to array of user IDs
          user: {
            _id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            photo: (user.profile ? JSON.parse(user.profile).photos?.[0] : null)
          },
          replies: t.replies.map(r => ({
            ...r,
            _id: r.id,
            user: {
              ...r.user,
              _id: r.userId,
              profile: r.user.profile ? JSON.parse(r.user.profile) : {}
            }
          }))
        }))
      };

      return res.json(formattedUser);
    } catch (dbError) {
      console.warn('Prisma get profile error:', dbError.message);
    }

    // Offline Fallback
    const users = getOfflineUsers();
    const user = users.find(u => u.id === userId || u._id === userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      ...user,
      _id: user.id || user._id,
      profile: typeof user.profile === 'string' ? JSON.parse(user.profile) : (user.profile || {})
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Post a tweet
router.post('/tweet', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id || req.user._id;

    if (!text || text.trim().length === 0) return res.status(400).json({ message: 'Tweet text is required' });

    try {
      const tweet = await prisma.tweet.create({
        data: {
          text: text.trim(),
          userId: userId
        }
      });
      return res.json({ message: 'Tweet posted successfully', tweet: { ...tweet, _id: tweet.id } });
    } catch (dbError) {
      console.warn('Prisma post tweet error:', dbError.message);
    }

    res.status(503).json({ message: 'Database error or offline mode' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile (own profile)
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { college: true, cluster: true }
      });
      if (user) {
        const formatted = {
          ...user,
          _id: user.id,
          profile: user.profile ? JSON.parse(user.profile) : {}
        };
        delete formatted.password;
        return res.json(formatted);
      }
    } catch (e) { }

    const users = getOfflineUsers();
    const user = users.find(u => u.id === userId || u._id === userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const updates = req.body;

    try {
      // Need to handle profile specifically if it's nested in updates
      if (updates.profile) {
        updates.profile = JSON.stringify(updates.profile);
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: updates,
        include: { college: true, cluster: true }
      });

      const formatted = {
        ...user,
        _id: user.id,
        profile: user.profile ? JSON.parse(user.profile) : {}
      };
      delete formatted.password;
      return res.json(formatted);
    } catch (dbError) {
      console.warn('Prisma update profile error:', dbError.message);
    }

    res.status(503).json({ message: 'Database error' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Complete onboarding
router.post('/onboarding', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { typeDescription, bio, age, datingIntentions, photos } = req.body;

    if (!age) return res.status(400).json({ message: 'Age is required' });
    if (!datingIntentions) return res.status(400).json({ message: 'Dating intentions are required' });
    if (!photos || photos.length < 1) return res.status(400).json({ message: 'At least 1 photo required' });

    const profile = {
      age: Number(age),
      bio: bio || '',
      photos: photos,
      typeDescription,
      datingIntentions
    };

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          hasCompletedOnboarding: true,
          profile: JSON.stringify(profile)
        },
        include: { college: true, cluster: true }
      });

      const formatted = {
        ...user,
        _id: user.id,
        profile: JSON.parse(user.profile)
      };
      delete formatted.password;

      return res.json({ message: 'Onboarding completed', user: formatted });
    } catch (dbError) {
      console.warn('Prisma onboarding error:', dbError.message);
    }

    res.status(503).json({ message: 'Database error' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get potential matches
router.get('/potential-matches', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    try {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { clusterId: true }
      });

      if (!currentUser?.clusterId) return res.json([]);

      // Get users in same cluster who are NOT the current user
      // Simple logic for now: all others in cluster
      const others = await prisma.user.findMany({
        where: {
          clusterId: currentUser.clusterId,
          id: { not: userId },
          isActive: true,
          hasCompletedOnboarding: true
        },
        include: { college: true },
        take: 25
      });

      return res.json(others.map(u => ({
        ...u,
        _id: u.id,
        profile: u.profile ? JSON.parse(u.profile) : {}
      })));
    } catch (e) {
      return res.json([]);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Leaderboard
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    try {
      const currentUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!currentUser?.clusterId) return res.status(400).json({ message: 'No cluster assigned' });

      const users = await prisma.user.findMany({
        where: { clusterId: currentUser.clusterId, isActive: true },
        include: { college: true, _count: { select: { likesReceived: true } } },
        orderBy: { likesReceived: { _count: 'desc' } },
        take: 10
      });

      return res.json(users.map(u => ({
        id: u.id,
        _id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        college: u.college?.name,
        profilePhoto: u.profile ? JSON.parse(u.profile).photos?.[0] : null,
        requestCount: u._count.likesReceived
      })));
    } catch (e) {
      return res.json([]);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike a tweet
router.post('/tweet/:tweetId/like', authenticate, async (req, res) => {
  try {
    const { tweetId } = req.params;
    const userId = req.user.id || req.user._id;

    try {
      // Check if already liked
      const existingLike = await prisma.tweetLike.findUnique({
        where: {
          tweetId_userId: { tweetId, userId }
        }
      });

      if (existingLike) {
        // Unlike - delete the like
        await prisma.tweetLike.delete({
          where: { id: existingLike.id }
        });
        return res.json({ message: 'Tweet unliked', liked: false });
      } else {
        // Like - create new like
        await prisma.tweetLike.create({
          data: { tweetId, userId }
        });
        return res.json({ message: 'Tweet liked', liked: true });
      }
    } catch (dbError) {
      console.warn('Prisma like tweet error:', dbError.message);
    }

    res.status(503).json({ message: 'Database error' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a tweet
router.delete('/tweet/:tweetId', authenticate, async (req, res) => {
  try {
    const { tweetId } = req.params;
    const userId = req.user.id || req.user._id;

    try {
      // Verify ownership
      const tweet = await prisma.tweet.findUnique({ where: { id: tweetId } });
      if (!tweet) return res.status(404).json({ message: 'Tweet not found' });
      if (tweet.userId !== userId) return res.status(403).json({ message: 'Not authorized' });

      // Delete replies and likes first (due to foreign keys)
      await prisma.reply.deleteMany({ where: { tweetId } });
      await prisma.tweetLike.deleteMany({ where: { tweetId } });
      await prisma.tweet.delete({ where: { id: tweetId } });

      return res.json({ message: 'Tweet deleted successfully' });
    } catch (dbError) {
      console.warn('Prisma delete tweet error:', dbError.message);
    }

    res.status(503).json({ message: 'Database error' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reply to a tweet
router.post('/tweet/:tweetId/reply', authenticate, async (req, res) => {
  try {
    const { tweetId } = req.params;
    const { text } = req.body;
    const userId = req.user.id || req.user._id;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    try {
      const reply = await prisma.reply.create({
        data: {
          text: text.trim(),
          tweetId,
          userId
        },
        include: {
          user: { select: { firstName: true, lastName: true, profile: true } }
        }
      });

      return res.json({
        message: 'Reply posted',
        reply: {
          ...reply,
          _id: reply.id,
          user: {
            _id: reply.userId,
            firstName: reply.user.firstName,
            lastName: reply.user.lastName,
            photo: reply.user.profile ? JSON.parse(reply.user.profile).photos?.[0] : null
          }
        }
      });
    } catch (dbError) {
      console.warn('Prisma reply error:', dbError.message);
    }

    res.status(503).json({ message: 'Database error' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

