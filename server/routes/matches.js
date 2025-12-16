const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

function objectIdEquals(a, b) {
  return String(a) === String(b);
}

// Send follow request
router.post('/like/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Already matched?
    const alreadyMatched = (currentUser.matches || []).some(
      (m) => objectIdEquals(m.user, userId) && m.status === 'matched'
    );
    if (alreadyMatched) {
      return res.status(400).json({ message: 'You are already connected.' });
    }

    // Already sent?
    const alreadySent = (currentUser.followRequestsSent || []).some((id) => objectIdEquals(id, userId));
    if (alreadySent) {
      return res.status(400).json({ message: 'Follow request already sent' });
    }

    // Record sent + received request
    currentUser.followRequestsSent = currentUser.followRequestsSent || [];
    currentUser.followRequestsSent.push(targetUser._id);

    targetUser.followRequestsReceived = targetUser.followRequestsReceived || [];
    const alreadyReceived = targetUser.followRequestsReceived.some((r) => objectIdEquals(r.user, currentUser._id));
    if (!alreadyReceived) {
      targetUser.followRequestsReceived.push({ user: currentUser._id, sentAt: new Date() });
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: 'Follow request sent',
    });
  } catch (error) {
    console.error('Follow request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get follow requests received
router.get('/requests', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'followRequestsReceived.user',
        select: '-password',
        populate: { path: 'college', select: 'name' },
      })
      .select('-password');

    const requests = (user.followRequestsReceived || []).map((r) => ({
      id: r.user?._id,
      firstName: r.user?.firstName,
      lastName: r.user?.lastName,
      college: r.user?.college?.name,
      profile: r.user?.profile,
      sentAt: r.sentAt,
    })).filter((r) => r.id);

    res.json(requests);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept follow request -> becomes a match (appears in Inbox/Chat)
router.post('/accept/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user._id);
    const sender = await User.findById(userId);

    if (!sender) return res.status(404).json({ message: 'User not found' });

    // Ensure there is a pending request
    const hadRequest = (currentUser.followRequestsReceived || []).some((r) => objectIdEquals(r.user, userId));
    if (!hadRequest) {
      return res.status(400).json({ message: 'No pending request from this user.' });
    }

    // Remove from received + sent
    currentUser.followRequestsReceived = (currentUser.followRequestsReceived || []).filter((r) => !objectIdEquals(r.user, userId));
    sender.followRequestsSent = (sender.followRequestsSent || []).filter((id) => !objectIdEquals(id, currentUser._id));

    // Add match for both (dedupe)
    currentUser.matches = currentUser.matches || [];
    sender.matches = sender.matches || [];

    const alreadyMatchedCurrent = currentUser.matches.some((m) => objectIdEquals(m.user, userId) && m.status === 'matched');
    const alreadyMatchedSender = sender.matches.some((m) => objectIdEquals(m.user, currentUser._id) && m.status === 'matched');

    if (!alreadyMatchedCurrent) currentUser.matches.push({ user: sender._id, status: 'matched', matchedAt: new Date() });
    if (!alreadyMatchedSender) sender.matches.push({ user: currentUser._id, status: 'matched', matchedAt: new Date() });

    await currentUser.save();
    await sender.save();

    res.json({ message: 'Request accepted', userId: sender._id });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject follow request
router.post('/reject/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user._id);
    const sender = await User.findById(userId);

    if (!sender) return res.status(404).json({ message: 'User not found' });

    currentUser.followRequestsReceived = (currentUser.followRequestsReceived || []).filter((r) => !objectIdEquals(r.user, userId));
    sender.followRequestsSent = (sender.followRequestsSent || []).filter((id) => !objectIdEquals(id, currentUser._id));

    await currentUser.save();
    await sender.save();

    res.json({ message: 'Request rejected' });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Pass on a user
router.post('/pass/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user._id);

    if (currentUser.passed.includes(userId)) {
      return res.status(400).json({ message: 'Already passed on this user' });
    }

    currentUser.passed.push(userId);
    await currentUser.save();

    res.json({ message: 'Passed on user' });
  } catch (error) {
    console.error('Pass error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all matches
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'matches.user',
        select: '-password',
        populate: {
          path: 'college',
          select: 'name',
        },
      });

    const matches = user.matches
      .filter(m => m.status === 'matched')
      .map(m => ({
        id: m.user._id,
        firstName: m.user.firstName,
        lastName: m.user.lastName,
        email: m.user.email,
        college: m.user.college?.name,
        profile: m.user.profile,
        matchedAt: m.matchedAt,
      }));

    res.json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

