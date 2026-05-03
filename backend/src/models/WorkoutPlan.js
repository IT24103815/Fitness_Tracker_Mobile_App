const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    goalType: [{
        type: String,
        enum: ['weight_loss', 'muscle_gain', 'maintenance', 'strength', 'endurance', 'general_fitness'],
        required: true
    }],
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    isTemplate: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    weeks: [{
        weekNumber: { type: Number, required: true },
        days: [{
            day: {
                type: String,
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                required: true
            },
            exercises: [{
                exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
                sets: { type: Number, required: true },
                reps: { type: String, required: true },        // e.g. "8-12" or "10"
                restTime: { type: Number },                    // seconds
                notes: String
            }],
            completed: { type: Boolean, default: false }
        }]
    }],
    isActive: { type: Boolean, default: true },
    completionPercentage: { type: Number, default: 0 },
    planId: { type: String, unique: true }
}, { timestamps: true });

workoutPlanSchema.pre('save', async function() {
    if (!this.planId) {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const nums = "0123456789";
        let randomPart = "";
        for(let i=0; i<3; i++) randomPart += letters.charAt(Math.floor(Math.random()*letters.length));
        randomPart += "-";
        for(let i=0; i<3; i++) randomPart += nums.charAt(Math.floor(Math.random()*nums.length));
        this.planId = `WRK-${randomPart}`; 
    }
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);