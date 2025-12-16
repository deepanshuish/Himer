const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

async function ensureMatched(currentUserId, otherUserId) {
  const user = await User.findById(currentUserId).select('matches');
  return (user?.matches || []).some((m) => String(m.user) === String(otherUserId) && m.status === 'matched');
}

// Get all messages between current user and another user
router.get('/:userId', authenticate, async (req, res) => {
	try {
	  const { userId } = req.params;

	  const ok = await ensureMatched(req.user._id, userId);
	  if (!ok) {
	    return res.status(403).json({ message: 'You can only chat with people in your inbox (accepted requests).' });
	  }

	  const messages = await Message.find({
	    $or: [
	      { from: req.user._id, to: userId },
	      { from: userId, to: req.user._id },
	    ],
	  }).sort({ createdAt: 1 });

	  res.json(messages);
	} catch (error) {
	  console.error('Get chat messages error:', error);
	  res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Send a new message
router.post('/:userId', authenticate, async (req, res) => {
	try {
	  const { userId } = req.params;
	  const { text } = req.body;

	  const ok = await ensureMatched(req.user._id, userId);
	  if (!ok) {
	    return res.status(403).json({ message: 'You can only message people in your inbox (accepted requests).' });
	  }

	  if (!text || !text.trim()) {
	    return res.status(400).json({ message: 'Message text is required' });
	  }

	  const message = new Message({
	    from: req.user._id,
	    to: userId,
	    text: text.trim(),
	  });
	  await message.save();

	  res.status(201).json(message);
	} catch (error) {
	  console.error('Send chat message error:', error);
	  res.status(500).json({ message: 'Server error', error: error.message });
	}
});

module.exports = router;

