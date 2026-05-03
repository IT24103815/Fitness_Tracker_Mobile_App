const User = require('../models/User');
const Goal = require('../models/Goal');
const ProgressRecord = require('../models/ProgressRecord');

// Get Gamified Dashboard
const getDashboard = async (req, res) => {
    try {
        let clientId = req.user._id;
        if ((req.user.role === 'admin' || req.user.role === 'trainer') && req.params.clientId) {
            clientId = req.params.clientId;
        }

        const user = await User.findById(clientId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const goals = await Goal.find({ client: clientId });
        const progressRecords = await ProgressRecord.find({ client: clientId })
            .sort({ date: -1 })
            .limit(30);

        res.json({
            success: true,
            user: {
                name: user.name,
                level: user.level,
                xp: user.xp,
                currentStreak: user.currentStreak,
                longestStreak: user.longestStreak,
                title: user.title,
                badges: user.badges,
                stats: user.stats,
                bmi: user.bmi,
                currentWeight: user.currentWeight
            },
            goals,
            recentProgress: progressRecords
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create Goal
const createGoal = async (req, res) => {
    try {
        const goal = await Goal.create({
            ...req.body,
            client: req.body.client || req.user._id,
            createdBy: req.user._id
        });
        res.status(201).json({ success: true, goal });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getUserGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ client: req.user._id });
        res.json({ success: true, goals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

        if (req.user.role === 'client' && goal.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        Object.assign(goal, req.body);
        await goal.save();
        res.json({ success: true, goal });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

        if (req.user.role === 'client' && goal.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        await goal.deleteOne();
        res.json({ success: true, message: 'Goal deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add Progress Record + XP Gain + Stat Updates
const addProgressRecord = async (req, res) => {
    try {
        const { date, workoutCompleted, mealsAdhered, weight, bodyFat, notes } = req.body;

        if (!date) {
            return res.status(400).json({ success: false, message: 'Please provide a date for the progress record' });
        }

        const xpGained = (workoutCompleted ? 30 : 0) + Math.floor((mealsAdhered || 0) / 5);

        const record = await ProgressRecord.create({
            client: req.user._id,
            goal: req.body.goalId,
            date: new Date(date),
            workoutCompleted: !!workoutCompleted,
            mealsAdhered: mealsAdhered || 0,
            weight,
            bodyFat,
            xpGained,
            notes,
        });

        // Update User stats and XP
        const user = await User.findById(req.user._id);

        user.xp += xpGained;

        // Level up logic
        const newLevel = Math.floor(user.xp / 500) + 1;
        if (newLevel > user.level) {
            user.level = newLevel;
            const titles = ["Rookie", "Novice", "Warrior", "Champion", "Elite", "Legend", "Mythic"];
            user.title = titles[Math.min(Math.floor(newLevel / 5), titles.length - 1)];
        }

        // Update stats (simple growth logic)
        if (workoutCompleted) {
            user.stats.strength += 2;
            user.stats.endurance += 1;
            user.stats.explosivePower += 2;
        }
        if (mealsAdhered > 80) {
            user.stats.coreStability += 1;
        }

        if (weight) {
            user.currentWeight = weight;
        }

        // Recalculate overall score
        user.stats.overallScore = Math.round(
            (user.stats.strength + user.stats.endurance + user.stats.stamina +
                user.stats.flexibility + user.stats.explosivePower + user.stats.coreStability) / 6
        );
        user.markModified('stats');
        await user.save();

        res.status(201).json({ success: true, record, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDashboard,
    createGoal,
    getUserGoals,
    updateGoal,
    deleteGoal,
    addProgressRecord
};