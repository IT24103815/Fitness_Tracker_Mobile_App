const mongoose = require('mongoose');

const fitnessChallengeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: [{
        type: String,
        enum: ['strength', 'endurance', 'consistency', 'nutrition', 'mixed']
    }],
    minLevel: { type: Number, default: 1 },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    targetDescription: String,           // e.g., "Complete 6 workouts this week"
    tasks: [{
        exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
        sets: Number,
        reps: String
    }],
    rewardXP: { type: Number, default: 100 },
    rewardStats: {
        strength: { type: Number, default: 0 },
        endurance: { type: Number, default: 0 },
        stamina: { type: Number, default: 0 },
        flexibility: { type: Number, default: 0 },
        explosivePower: { type: Number, default: 0 },
        coreStability: { type: Number, default: 0 }
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    challengeId: { type: String, unique: true }
}, { timestamps: true });

fitnessChallengeSchema.pre('save', async function() {
    if (!this.challengeId) {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const nums = "0123456789";
        let randomPart = "";
        for(let i=0; i<3; i++) randomPart += letters.charAt(Math.floor(Math.random()*letters.length));
        randomPart += "-";
        for(let i=0; i<3; i++) randomPart += nums.charAt(Math.floor(Math.random()*nums.length));
        this.challengeId = `CHL-${randomPart}`; 
    }
});

module.exports = mongoose.model('FitnessChallenge', fitnessChallengeSchema);