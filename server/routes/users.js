const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// Get user profile by ID (for viewing other user's profiles)
router.get('/profile/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params
    const currentUserId = req.user._id.toString()

    console.log('Fetching profile for userId:', userId)
    console.log('Current user ID:', currentUserId)

    // Find the user
    const user = await User.findById(userId)
      .populate('college', 'name')
      .populate('tweets.replies.user', 'firstName lastName profile.photos')
      .select('-password')

    if (!user) {
      console.log('User not found:', userId)
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if this is the user's own profile
    const isOwnProfile = currentUserId === userId

    if (!isOwnProfile) {
      // Check if users are matched (have access to view profile)
      const currentUser = await User.findById(currentUserId)
      
      const isMatch = currentUser.matches.some(
        match => match.user.toString() === userId
      )

      // Only allow viewing if they are matched
      if (!isMatch) {
        return res.status(403).json({ message: 'Not authorized to view this profile' })
      }
    }

    // Return user profile with tweets (sort tweets by date, newest first)
    const tweets = user.tweets || []
    const sortedTweets = tweets.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      college: user.college,
      profile: user.profile || {},
      tweets: sortedTweets
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Post a tweet
router.post('/tweet', authenticate, async (req, res) => {
  try {
    const { text } = req.body
    const userId = req.user._id

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Tweet text is required' })
    }

    if (text.length > 280) {
      return res.status(400).json({ message: 'Tweet must be 280 characters or less' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Add tweet to user's tweets array
    if (!user.tweets) {
      user.tweets = []
    }

    user.tweets.unshift({
      text: text.trim(),
      likes: [],
      createdAt: new Date()
    })

    await user.save()

    res.json({ message: 'Tweet posted successfully', tweet: user.tweets[0] })
  } catch (error) {
    console.error('Post tweet error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Like/unlike a tweet
router.post('/tweet/:tweetId/like', authenticate, async (req, res) => {
  try {
    const { tweetId } = req.params
    const userId = req.user._id.toString()

    // Find the user who owns the tweet
    const user = await User.findOne({ 'tweets._id': tweetId })
    
    if (!user) {
      return res.status(404).json({ message: 'Tweet not found' })
    }

    const tweet = user.tweets.id(tweetId)
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' })
    }

    // Check if already liked
    const likeIndex = tweet.likes.findIndex(id => id.toString() === userId)
    
    if (likeIndex > -1) {
      // Unlike
      tweet.likes.splice(likeIndex, 1)
    } else {
      // Like
      tweet.likes.push(userId)
    }

    await user.save()

    res.json({ message: 'Tweet updated', likes: tweet.likes.length })
  } catch (error) {
    console.error('Like tweet error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete a tweet
router.delete('/tweet/:tweetId', authenticate, async (req, res) => {
  try {
    const { tweetId } = req.params
    const userId = req.user._id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const tweet = user.tweets.id(tweetId)
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' })
    }

    // Remove the tweet
    tweet.remove()
    await user.save()

    res.json({ message: 'Tweet deleted successfully' })
  } catch (error) {
    console.error('Delete tweet error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Reply to a tweet
router.post('/tweet/:tweetId/reply', authenticate, async (req, res) => {
  try {
    const { tweetId } = req.params
    const { text } = req.body
    const userId = req.user._id

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Reply text is required' })
    }

    if (text.length > 280) {
      return res.status(400).json({ message: 'Reply must be 280 characters or less' })
    }

    // Find the user who owns the tweet
    const user = await User.findOne({ 'tweets._id': tweetId })
    
    if (!user) {
      return res.status(404).json({ message: 'Tweet not found' })
    }

    const tweet = user.tweets.id(tweetId)
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' })
    }

    // Initialize replies array if it doesn't exist
    if (!tweet.replies) {
      tweet.replies = []
    }

    // Add reply
    tweet.replies.push({
      user: userId,
      text: text.trim(),
      createdAt: new Date()
    })

    await user.save()

    // Populate the reply with user info
    await user.populate('tweets.replies.user', 'firstName lastName profile.photos')

    const addedReply = tweet.replies[tweet.replies.length - 1]

    res.json({ 
      message: 'Reply added successfully', 
      reply: addedReply
    })
  } catch (error) {
    console.error('Reply to tweet error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get feed of tweets from matched users
router.get('/feed', authenticate, async (req, res) => {
  try {
    const userId = req.user._id

    // Get current user with matches
    const currentUser = await User.findById(userId)
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Get all matched user IDs
    const matchedUserIds = currentUser.matches
      .filter(m => m.status === 'matched')
      .map(m => m.user)

    // Include own user ID
    matchedUserIds.push(userId)

    // Get all users with tweets
    const usersWithTweets = await User.find({
      _id: { $in: matchedUserIds },
      'tweets.0': { $exists: true }
    })
      .select('_id firstName lastName profile.photos tweets')
      .populate('tweets.replies.user', 'firstName lastName profile.photos')

    // Flatten all tweets with user info
    const feedTweets = []
    usersWithTweets.forEach(user => {
      user.tweets.forEach(tweet => {
        feedTweets.push({
          _id: tweet._id,
          text: tweet.text,
          likes: tweet.likes,
          replies: tweet.replies || [],
          createdAt: tweet.createdAt,
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            photo: user.profile?.photos?.[0]
          }
        })
      })
    })

    // Sort by date, newest first
    feedTweets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    res.json(feedTweets)
  } catch (error) {
    console.error('Get feed error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

	// Get user profile
	router.get('/profile', authenticate, async (req, res) => {
	  try {
	    const user = await User.findById(req.user._id)
	      .select('-password')
	      .populate('college cluster');
	    res.json(user);
	  } catch (error) {
	    res.status(500).json({ message: 'Server error', error: error.message });
	  }
	});

	// Update user profile (generic update)
	router.put('/profile', authenticate, async (req, res) => {
	  try {
	    const updates = req.body;
	    const user = await User.findByIdAndUpdate(
	      req.user._id,
	      { $set: updates },
	      { new: true, runValidators: true }
	    ).select('-password').populate('college cluster');
	    
	    res.json(user);
	  } catch (error) {
	    res.status(500).json({ message: 'Server error', error: error.message });
	  }
	});

	// Complete onboarding - immediate access
	router.post('/onboarding', authenticate, async (req, res) => {
	  try {
	    const { typeDescription, bio, age, datingIntentions, photos } = req.body;

	    if (!age) {
	      return res.status(400).json({ message: 'Age is required' });
	    }
	    if (!datingIntentions) {
	      return res.status(400).json({ message: 'Dating intentions are required' });
	    }
	    if (!Array.isArray(photos) || photos.length < 1) {
	      return res.status(400).json({ message: 'Please upload at least 1 photo' });
	    }

	    const setOps = {
	      typeDescription: typeDescription || '',
	      datingIntentions,
	      hasCompletedOnboarding: true,
	      'profile.age': Number(age),
	      'profile.bio': bio || '',
	      'profile.photos': photos,
	    };

	    const user = await User.findByIdAndUpdate(
	      req.user._id,
	      { $set: setOps },
	      { new: true, runValidators: true }
	    )
	      .select('-password')
	      .populate('college cluster');

	    res.json({
	      message: 'Onboarding completed',
	      user,
	    });
	  } catch (error) {
	    console.error('Onboarding error:', error);
	    res.status(500).json({ message: 'Server error', error: error.message });
	  }
	});

	// Get potential matches (users from same cluster, not already matched/passed/requested)
	router.get('/potential-matches', authenticate, async (req, res) => {
	  try {
	    const currentUser = await User.findById(req.user._id)
	      .select('-password')
	      .populate('cluster');
	    
	    if (!currentUser.cluster) {
	      return res.json([]);
	    }

	    const sent = (currentUser.followRequestsSent || []).map(String);
	    const received = (currentUser.followRequestsReceived || []).map(r => String(r.user));
	    const matched = (currentUser.matches || []).map(m => String(m.user));
	    const passed = (currentUser.passed || []).map(String);

	    // Get all users from the same cluster, excluding current user
	    const potentialMatches = await User.find({
	      cluster: currentUser.cluster._id,
	      _id: { $ne: currentUser._id },
	      isActive: true,
	      $and: [
	        { _id: { $nin: sent } },
	        { _id: { $nin: received } },
	        { _id: { $nin: passed } },
	        { _id: { $nin: matched } },
	      ],
	    })
	      .select('-password')
	      .populate('college')
	      .limit(25);

	    res.json(potentialMatches);
	  } catch (error) {
	    console.error('Get potential matches error:', error);
	    res.status(500).json({ message: 'Server error', error: error.message });
	  }
	});

	// Leaderboard: top users in the same cluster by received follow request count
	router.get('/leaderboard', authenticate, async (req, res) => {
	  try {
	    const currentUser = await User.findById(req.user._id).populate('cluster');

	    if (!currentUser.cluster) {
	      return res.status(400).json({ message: 'User not assigned to a cluster' });
	    }

	    const users = await User.find({
	      cluster: currentUser.cluster._id,
	      isActive: true,
	    })
	      .select('-password')
	      .populate('college');

	    const leaderboard = users
	      .map(u => ({
	        id: u._id,
	        firstName: u.firstName,
	        lastName: u.lastName,
	        college: u.college?.name,
	        profilePhoto: u.profile?.photos?.[0] || null,
	        requestCount: (u.followRequestsReceived || []).length,
	      }))
	      .sort((a, b) => b.requestCount - a.requestCount)
	      .slice(0, 10);

	    res.json(leaderboard);
	  } catch (error) {
	    console.error('Get leaderboard error:', error);
	    res.status(500).json({ message: 'Server error', error: error.message });
	  }
	});

module.exports = router;

