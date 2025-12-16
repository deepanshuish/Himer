const mongoose = require('mongoose');

const clusterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  colleges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Ensure clusters have exactly 3 colleges
clusterSchema.pre('save', function(next) {
  if (this.colleges.length !== 3) {
    return next(new Error('A cluster must contain exactly 3 colleges'));
  }
  next();
});

module.exports = mongoose.model('Cluster', clusterSchema);

