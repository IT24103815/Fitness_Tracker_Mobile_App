const FitnessChallenge = require('../models/FitnessChallenge');
const UserWeeklyChallenge = require('../models/UserWeeklyChallenge');
const User = require('../models/User');

// Create Challenge Template (Admin & Trainer only)
const createChallenge = async (req, res) => {
    try {
        const challenge = await FitnessChallenge.create({
            ...req.body,
            createdBy: req.user._id
        });
        res.status(201).json({ success: true, challenge });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Challenge Templates
const getAllChallenges = async (req, res) => {
    try {
        const challenges = await FitnessChallenge.find({ isActive: true }).populate('tasks.exercise');
        res.json({ success: true, challenges });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Weekly Challenges for Current User + Auto Trigger
const getMyWeeklyChallenges = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Calculate start of this week (Monday)
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
        weekStart.setHours(0, 0, 0, 0);

        // Check if user already has challenges for this week
        let userChallenges = await UserWeeklyChallenge.find({
            user: req.user._id,
            weekStartDate: weekStart
        }).populate({
            path: 'challenge',
            populate: { path: 'tasks.exercise' }
        });

        // Auto-discover new challenges: Find all active templates not already assigned to this user this week
        const existingChallengeIds = userChallenges.map(uc => uc.challenge?._id?.toString() || uc.challenge?.toString());
        
        const newTemplates = await FitnessChallenge.find({
            _id: { $nin: existingChallengeIds },
            minLevel: { $lte: user.level || 1 },
            isActive: true
        });

        if (newTemplates.length > 0) {
            const newAssignments = await Promise.all(
                newTemplates.map(async (ch) => {
                    return await UserWeeklyChallenge.create({
                        user: req.user._id,
                        challenge: ch._id,
                        weekStartDate: weekStart,
                        status: 'pending'
                    });
                })
            );
            
            // Re-fetch all assignments for this week to ensure they are populated
            userChallenges = await UserWeeklyChallenge.find({
                user: req.user._id,
                weekStartDate: weekStart
            }).populate({
                path: 'challenge',
                populate: { path: 'tasks.exercise' }
            });
        }

        res.json({
            success: true,
            weeklyChallenges: userChallenges,
            weekStart: weekStart
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Accept / Reject Challenge
const updateChallengeStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'accepted' or 'rejected'
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const userChallenge = await UserWeeklyChallenge.findById(req.params.id);
        if (!userChallenge || userChallenge.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        if (userChallenge.status === 'completed') {
            return res.status(400).json({ success: false, message: 'Cannot change status of a completed challenge' });
        }

        userChallenge.status = status;
        await userChallenge.save();

        res.json({ success: true, userChallenge });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark Challenge as Completed (with XP & Stat rewards)
const completeChallenge = async (req, res) => {
    try {
        const userChallenge = await UserWeeklyChallenge.findById(req.params.id).populate('challenge');
        if (!userChallenge || userChallenge.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        if (userChallenge.status === 'completed') {
            return res.status(400).json({ success: false, message: 'Challenge already completed' });
        }

        if (userChallenge.status !== 'accepted') {
            return res.status(400).json({ success: false, message: 'Challenge must be accepted first' });
        }

        // Give rewards
        const user = await User.findById(req.user._id);
        const challenge = userChallenge.challenge;

        // Apply XP & Levels
        user.xp += (challenge.rewardXP || 100);
        const newLevel = Math.floor(user.xp / 500) + 1;
        if (newLevel > user.level) {
            user.level = newLevel;
            const titles = ["Rookie", "Novice", "Warrior", "Champion", "Elite", "Legend", "Mythic"];
            user.title = titles[Math.min(Math.floor(newLevel / 5), titles.length - 1)];
        }

        // Apply stat boosts explicitly
        const statsToUpdate = ['strength', 'endurance', 'stamina', 'flexibility', 'explosivePower', 'coreStability'];
        statsToUpdate.forEach(stat => {
            if (challenge.rewardStats[stat] > 0) {
                user.stats[stat] = (user.stats[stat] || 0) + challenge.rewardStats[stat];
            }
        });

        // Recalculate overall score
        user.stats.overallScore = Math.round(
            (user.stats.strength + user.stats.endurance + user.stats.stamina +
             user.stats.flexibility + user.stats.explosivePower + user.stats.coreStability) / 6
        );

        user.markModified('stats');

        // Prepare all update promises
        const updatePromises = [
            user.save(),
            UserWeeklyChallenge.findByIdAndUpdate(userChallenge._id, { 
                status: 'completed', 
                completedAt: new Date() 
            })
        ];

        // --- Auto-update Goal progress ---
        const Goal = require('../models/Goal');
        const rewardedCategories = ['consistency'];
        if (challenge.rewardStats.strength > 0) rewardedCategories.push('strength');
        if (challenge.rewardStats.endurance > 0) rewardedCategories.push('endurance');

        updatePromises.push(Goal.updateMany(
            { client: req.user._id, status: 'active', type: { $in: rewardedCategories } },
            { $inc: { currentValue: 1 } }
        ));

        // --- Heatmap record ---
        const ProgressRecord = require('../models/ProgressRecord');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        updatePromises.push(ProgressRecord.findOneAndUpdate(
            { client: req.user._id, date: today },
            { 
                $set: { workoutCompleted: true },
                $inc: { xpGained: challenge.rewardXP || 100 },
                $push: { 
                    activities: { 
                        title: `Challenge: ${challenge.title}`,
                        type: 'challenge',
                        xpAwarded: challenge.rewardXP || 100
                    } 
                }
            },
            { upsert: true }
        ));

        await Promise.all(updatePromises);
        res.json({ success: true, message: 'Challenge completed! Rewards applied.', user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Challenge Template (Admin & Trainer only)
const updateChallenge = async (req, res) => {
    try {
        const challenge = await FitnessChallenge.findById(req.params.id);
        if (!challenge) {
            return res.status(404).json({ success: false, message: 'Challenge not found' });
        }

        Object.assign(challenge, req.body);
        
        // Ensure arrays and nested objects are marked as modified
        challenge.markModified('tasks');
        challenge.markModified('category');
        challenge.markModified('rewardStats');

        await challenge.save();

        res.json({ success: true, challenge });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Challenge Template (Admin & Trainer only)
const deleteChallenge = async (req, res) => {
    try {
        const challenge = await FitnessChallenge.findById(req.params.id);
        if (!challenge) {
            return res.status(404).json({ success: false, message: 'Challenge not found' });
        }

        await challenge.deleteOne();
        res.json({ success: true, message: 'Challenge deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getChallengeById = async (req, res) => {
    try {
        const challenge = await FitnessChallenge.findById(req.params.id).populate('tasks.exercise');
        if (!challenge) {
            return res.status(404).json({ success: false, message: 'Challenge not found' });
        }
        res.json({ success: true, challenge });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const acceptChallengeTemplate = async (req, res) => {
    try {
        const { templateId } = req.params;
        const challenge = await FitnessChallenge.findById(templateId);
        if (!challenge) return res.status(404).json({ success: false, message: 'Template not found' });

        // Check if user already has this specific challenge accepted/completed this week
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
        weekStart.setHours(0,0,0,0);

        const existing = await UserWeeklyChallenge.findOne({
            user: req.user._id,
            challenge: templateId,
            weekStartDate: weekStart
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'You already have this challenge for this week' });
        }

        const newUserChallenge = await UserWeeklyChallenge.create({
            user: req.user._id,
            challenge: templateId,
            status: 'accepted',
            weekStartDate: weekStart
        });

        res.json({ success: true, userChallenge: newUserChallenge });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createChallenge,
    getAllChallenges,
    getMyWeeklyChallenges,
    updateChallengeStatus,
    completeChallenge,
    updateChallenge,
    deleteChallenge,
    acceptChallengeTemplate,
    getChallengeById
};