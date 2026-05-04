const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    goalType: {
        type: String,
        enum: ['weight_loss', 'muscle_gain', 'maintenance'],
        required: true
    },
    isTemplate: { type: Boolean, default: false },        // true = master template by trainer/admin

    // Who owns this plan
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    duration: { type: Number, default: 1 }, // in weeks
    
    dailyMeals: [{
        day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
        meals: [{
            mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'] },
            foods: [{
                name: String,
                calories: Number
            }]
        }]
    }],

    targetMacros: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fats: Number
    },

    // Client daily logging (only for non-template plans)
    dailyLogs: [{
        date: { type: Date, required: true },
        adherencePercentage: { type: Number, min: 0, max: 100 },
        notes: String,
        photoProof: String                    // Cloudinary URL of meal photo
    }],
    planId: { type: String, unique: true }
}, { timestamps: true });

mealPlanSchema.pre('save', async function() {
    if (!this.planId) {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const nums = "0123456789";
        let randomPart = "";
        for(let i=0; i<3; i++) randomPart += letters.charAt(Math.floor(Math.random()*letters.length));
        randomPart += "-";
        for(let i=0; i<3; i++) randomPart += nums.charAt(Math.floor(Math.random()*nums.length));
        this.planId = `MEL-${randomPart}`; 
    }
});

module.exports = mongoose.model('MealPlan', mealPlanSchema);