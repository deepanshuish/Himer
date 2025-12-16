const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // Not unique: NIRF rank-band/participating lists can include duplicates / multi-campus names.
  },
  emailDomain: {
    type: String,
    // Email domain is no longer required (we're not verifying email domains).
    // Kept only for legacy data; NOT unique (many colleges will have null/empty here).
  },
  clusterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cluster',
  },
  category: {
    type: String,
    enum: ['engineering', 'medical'],
    required: false,
  },
  genderType: {
    // College gender type (used only to avoid clusters where all 3 are same gender-type)
    type: String,
    enum: ['coed', 'girls', 'boys'],
    default: 'coed',
  },
  location: {
    city: String,
    state: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('College', collegeSchema);

