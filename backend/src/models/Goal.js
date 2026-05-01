const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Goal title is required'], trim: true },
  type: {
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'consistency', 'flexibility'],
    required: [true, 'Goal type is required']
  },
  targetValue: { type: Number, required: [true, 'Target value is required'] },
  startValue: { type: Number, default: 0 },
  currentValue: { type: Number, default: 0 },
  targetUnit: { type: String, required: [true, 'Target unit is required'], trim: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['active', 'completed', 'failed', 'paused'], default: 'active' },
  description: { type: String, default: '' },
  deadline: Date,
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

goalSchema.methods.calculateProgress = function () {
  const start = Number(this.startValue || 0);
  const current = Number(this.currentValue || 0);
  const target = Number(this.targetValue || 0);

  if (target === start) return 0;

  let progress;
  if (this.type === 'weight_loss' && target < start) {
    progress = ((start - current) / (start - target)) * 100;
  } else {
    progress = ((current - start) / (target - start)) * 100;
  }

  return Math.max(0, Math.min(100, Math.round(progress)));
};

goalSchema.methods.getBadge = function () {
  const progress = this.calculateProgress();
  if (progress >= 100) return 'Goal Crusher';
  if (progress >= 75) return 'Almost There';
  if (progress >= 50) return 'Halfway Hero';
  if (progress >= 25) return 'Strong Start';
  return 'Starter';
};

goalSchema.methods.getMotivationMessage = function () {
  const progress = this.calculateProgress();
  if (progress >= 100) return 'Congratulations! You completed this goal.';
  if (progress >= 75) return 'Almost there! Keep pushing.';
  if (progress >= 50) return 'Great progress! You are halfway past your target.';
  if (progress >= 25) return 'Nice start! Stay consistent.';
  return 'Start today. Small steps create big results.';
};

goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Goal', goalSchema);
