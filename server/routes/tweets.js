const express = require('express')
const router = express.Router()
const User = require('../models/User')
const auth = require('../middleware/auth')

// Get user profile with tweets
router.get('/profile/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params
    const currentUserId = req.user.id

    // Find the user
    const user = await User.findById(userId)
      .populate('college', 'name')
      .select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if users are matched (have access to view profile)
    const currentUser = await User.findById(currentUserId)
    
    const isMatch = currentUser.matches.some(
      match => match.user.toString() === userId
    )
    const isOwnProfile = currentUserId === userId

    // Only allow viewing if it's own profile or they are matched
    if (!isOwnProfile && !isMatch) {
      return res.status(403).json({ message: 'Not authorized to view this profile' })
    }

    // Return user profile with tweets
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      college: user.college,
      profile: user.profile,
      tweets: user.tweets || []
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Post a tweet
router.post('/tweet', auth, async (req, res) => {
  try {
    const { text } = req.body
    const userId = req.user.id

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
router.post('/tweet/:tweetId/like', auth, async (req, res) => {
  try {
    const { tweetId } = req.params
    const userId = req.user.id

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
    const likeIndex = tweet.likes.indexOf(userId)
    
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
router.delete('/tweet/:tweetId', auth, async (req, res) => {
  try {
    const { tweetId } = req.params
    const userId = req.user.id

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

module.exports = router
