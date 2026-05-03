const ProgressRecord = require('../models/ProgressRecord');
const User = require('../models/User');

/**
 * @desc    Get weight history for a client
 * @route   GET /api/analytics/weight/:clientId?
 * @access  Private
 */
const getWeightHistory = async (req, res) => {
    try {
        let clientId = req.user._id;
        if ((req.user.role === 'admin' || req.user.role === 'trainer') && req.params.clientId) {
            clientId = req.params.clientId;
        }

        // Fetch records that have weight defined, sorted by date
        const history = await ProgressRecord.find({ 
            client: clientId, 
            weight: { $exists: true, $ne: null } 
        })
        .sort({ date: 1 }) // Chronological for the graph
        .select('date weight notes');

        res.json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Log weight for a specific date
 * @route   POST /api/analytics/weight
 * @access  Private (Client only for themselves)
 */
const logWeight = async (req, res) => {
    try {
        const { date, weight, notes } = req.body;
        const clientId = req.user._id;

        if (!date || !weight) {
            return res.status(400).json({ success: false, message: 'Date and weight are required' });
        }

        // We use the start of the day to ensure uniqueness per day
        const logDate = new Date(date);
        logDate.setHours(0, 0, 0, 0);

        const record = await ProgressRecord.findOneAndUpdate(
            { client: clientId, date: logDate },
            { 
                $set: { 
                    weight: parseFloat(weight),
                    notes: notes || "" 
                } 
            },
            { new: true, upsert: true }
        );

        // Also update the user's current weight in their profile and trigger BMI recalculation
        const user = await User.findById(clientId);
        if (user) {
            user.currentWeight = parseFloat(weight);
            await user.save(); // This triggers the pre-save hook that calculates BMI
        }

        res.json({ success: true, record, bmi: user?.bmi });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Delete a weight entry
 * @route   DELETE /api/analytics/weight/:id
 * @access  Private
 */
const deleteWeightEntry = async (req, res) => {
    try {
        const record = await ProgressRecord.findById(req.params.id);
        if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

        if (record.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Instead of deleting the whole record (which might have workout data), 
        // we just unset the weight field if other data exists, or delete if empty.
        if (record.workoutCompleted || record.mealsAdhered || record.activities?.length > 0) {
            record.weight = undefined;
            await record.save();
        } else {
            await record.deleteOne();
        }

        res.json({ success: true, message: 'Weight entry removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getWeightHistory,
    logWeight,
    deleteWeightEntry
};
