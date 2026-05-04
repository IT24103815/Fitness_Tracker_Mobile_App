const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: {
        type: String,
        enum: ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'consistency', 'flexibility'],
        required: true
    },
    targetValue: { type: Number, required: true },
    startValue: { type: Number, default: 0 },
    currentValue: { type: Number, default: 0 },
    targetUnit: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['active', 'completed', 'failed', 'paused'], default: 'active' },
    description: String,
    deadline: Date,
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);