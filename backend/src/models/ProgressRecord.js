const mongoose = require('mongoose');

const progressRecordSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    workoutCompleted: { type: Boolean, default: false },
    
    // Store summaries of activities for the day
    activities: [{
        title: String,
        type: { type: String, enum: ['workout', 'challenge', 'meal'] },
        xpAwarded: Number,
        notes: String
    }],

    mealsAdhered: { type: Number, min: 0, max: 100 },
    weight: Number,
    bodyFat: Number,
    goal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
    xpGained: { type: Number, default: 0 },
    notes: String
}, { timestamps: true });

// Ensure one record per client per day
progressRecordSchema.index({ client: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ProgressRecord', progressRecordSchema);