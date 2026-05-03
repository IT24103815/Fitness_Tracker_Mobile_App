const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },

  role: {
    type: String,
    enum: ['admin', 'trainer', 'client'],
    default: 'client'
  },

  // Fitness profile fields (existing)
  gender: { type: String, enum: ['male', 'female', 'non-binary', 'prefer_not_to_say'], default: 'prefer_not_to_say' },
  dateOfBirth: Date,
  height: Number,
  currentWeight: Number,
  targetWeight: Number,
  preferredUnits: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
  fitnessGoals: [{ type: String, enum: ['weight_loss', 'muscle_gain', 'maintenance', 'endurance', 'strength', 'general_fitness'] }],
  activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'], default: 'moderate' },
  experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  bio: { type: String, maxlength: 250, default: '' },
  profilePicture: String,
  bmi: Number,

  // === NEW: Gamification System ===
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  badges: [{ type: String }],                    // e.g. "First Workout", "30-Day Streak"
  title: { type: String, default: "Rookie" },

  // Character Stat Board (meaningful fitness stats)
  stats: {
    strength: { type: Number, default: 10, min: 0 },
    endurance: { type: Number, default: 10, min: 0 },
    stamina: { type: Number, default: 10, min: 0 },
    flexibility: { type: Number, default: 10, min: 0 },
    explosivePower: { type: Number, default: 10, min: 0 },
    coreStability: { type: Number, default: 10, min: 0 },
    overallScore: { type: Number, default: 10 }
  },

  // === NEW: Trainer Supervision ===
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  clientId: { type: String, unique: true, sparse: true } // Unique short ID for trainers to claim
}, { timestamps: true });

// Pre-save: hash password + calculate BMI + Generate clientId if client
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (this.height && this.currentWeight) {
    const heightInMeters = this.preferredUnits === 'metric' ? this.height / 100 : this.height * 0.0254;
    this.bmi = parseFloat((this.currentWeight / (heightInMeters * heightInMeters)).toFixed(2));
  }

  // Generate unique client ID if it's a client and doesn't have one
  if (this.role === 'client' && !this.clientId) {
    this.clientId = 'FIT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
});

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);