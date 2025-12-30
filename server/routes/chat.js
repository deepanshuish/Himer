const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

async function ensureMatched(currentUserId, otherUserId) {
	try {
		const match = await prisma.match.findUnique({
			where: {
				userId_matchedId: {
					userId: currentUserId,
					matchedId: otherUserId
				}
			}
		});
		return !!match;
	} catch (e) {
		return false;
	}
}

// Get all messages between current user and another user
router.get('/:userId', authenticate, async (req, res) => {
	try {
		const { userId } = req.params;
		const currentUserId = req.user.id || req.user._id;

		const ok = await ensureMatched(currentUserId, userId);
		if (!ok) {
			return res.status(403).json({ message: 'You can only chat with people in your inbox (accepted requests).' });
		}

		const messages = await prisma.message.findMany({
			where: {
				OR: [
					{ fromId: currentUserId, toId: userId },
					{ fromId: userId, toId: currentUserId },
				],
			},
			orderBy: { createdAt: 'asc' }
		});

		// Map fields for frontend compatibility (fromId -> from, toId -> to)
		const formatted = messages.map(m => ({
			...m,
			_id: m.id,
			from: m.fromId,
			to: m.toId
		}));

		res.json(formatted);
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
		const currentUserId = req.user.id || req.user._id;

		const ok = await ensureMatched(currentUserId, userId);
		if (!ok) {
			return res.status(403).json({ message: 'You can only message people in your inbox (accepted requests).' });
		}

		if (!text || !text.trim()) {
			return res.status(400).json({ message: 'Message text is required' });
		}

		const message = await prisma.message.create({
			data: {
				fromId: currentUserId,
				toId: userId,
				text: text.trim(),
			}
		});

		res.status(201).json({
			...message,
			_id: message.id,
			from: message.fromId,
			to: message.toId
		});
	} catch (error) {
		console.error('Send chat message error:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

module.exports = router;

