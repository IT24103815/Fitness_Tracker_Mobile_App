const mongoose = require('mongoose');

const userWeeklyChallengeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'FitnessChallenge', required: true },
  weekStartDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'failed', 'rejected'],
    default: 'pending'
  },
  progress: { type: Number, default: 0 },   // 0-100
  completedAt: Date,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('UserWeeklyChallenge', userWeeklyChallengeSchema);