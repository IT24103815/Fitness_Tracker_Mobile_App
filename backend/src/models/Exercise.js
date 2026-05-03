const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    category: [{
        type: String,
        required: true,
        enum: ['Strength', 'Cardio', 'HIIT', 'Yoga', 'Mobility', 'Full Body']
    }],
    muscleGroup: [{
        type: String,
        required: true,
        enum: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body', 'Calves', 'Glutes']
    }],
    description: { type: String, required: true },
    difficulty: {
        type: String,
        required: true,
        enum: ['Beginner', 'Intermediate', 'Advanced']
    },
    caloriesPerMinute: { type: Number, required: true, min: 0 },
    image: { type: String }, // Cloudinary secure URL

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Exercise', exerciseSchema);