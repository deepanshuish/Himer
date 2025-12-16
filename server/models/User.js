const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
	  gender: {
	    type: String,
	    enum: ['male', 'female', 'non-binary', 'other', 'prefer-not-to-say'],
	  },
	  collegeStatus: {
	    type: String,
	    enum: ['studying', 'alumni'],
	  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
  },
  cluster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cluster',
  },
  profile: {
    age: Number,
    bio: String,
    major: String,
    year: {
      type: String,
      enum: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'],
    },
    interests: [String],
    photos: [String],
  },
  preferences: {
    ageRange: {
      min: { type: Number, default: 18 },
      max: { type: Number, default: 30 },
    },
    maxDistance: { type: Number, default: 50 }, // miles
  },
  matches: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    matchedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['matched', 'liked', 'passed'],
      default: 'matched',
    },
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  passed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // Follow requests (like -> request; accept -> match)
  followRequestsSent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  followRequestsReceived: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  }],
	  // Onboarding & matching metadata
	  typeDescription: {
	    type: String,
	  },
	  datingIntentions: {
	    type: String,
	  },
	  hasCompletedOnboarding: {
	    type: Boolean,
	    default: false,
	  },
	  homepageUnlockAt: {
	    type: Date,
	  },
  // Tweets/Updates
  tweets: [{
    text: {
      type: String,
      required: true,
      maxlength: 280,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      text: {
        type: String,
        required: true,
        maxlength: 280,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

