const WorkoutPlan = require('../models/WorkoutPlan');

// Create Workout Plan
const createWorkoutPlan = async (req, res) => {
    try {
        const { title, goalType, client, weeks, isTemplate } = req.body;

        if (!title || !goalType || !weeks) {
            return res.status(400).json({ success: false, message: 'Please provide title, goalType, and weeks' });
        }

        let targetClient = client;

        if (!client && !isTemplate) {
            targetClient = req.user._id;
        }

        // Security: Clients can only create for themselves, no templates
        if (req.user.role === 'client') {
            if (isTemplate) {
                 return res.status(403).json({ success: false, message: 'Clients cannot create templates' });
            }
            if (targetClient && targetClient.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: 'Clients can only create plans for themselves' });
            }
            targetClient = req.user._id;
        }

        const plan = await WorkoutPlan.create({
            title,
            goalType,
            client: isTemplate ? undefined : targetClient,
            isTemplate: isTemplate || false,
            createdBy: req.user._id,
            weeks: weeks || []
        });

        res.status(201).json({ success: true, plan });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get My Plans (for the logged-in user)
const getMyPlans = async (req, res) => {
    try {
        const plans = await WorkoutPlan.find({ client: req.user._id })
            .populate('client', 'name')
            .populate('createdBy', 'name role')
            .populate('weeks.days.exercises.exercise', 'name muscleGroup difficulty image');

        res.json({ success: true, plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Plans - Admin & Trainer only
const getAllPlans = async (req, res) => {
    try {
        const plans = await WorkoutPlan.find()
            .populate('client', 'name')
            .populate('createdBy', 'name role');
        res.json({ success: true, plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Single Plan
const getPlanById = async (req, res) => {
    try {
        const plan = await WorkoutPlan.findById(req.params.id)
            .populate('client', 'name')
            .populate('createdBy', 'name role')
            .populate('weeks.days.exercises.exercise', 'name muscleGroup difficulty image');
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        res.json({ success: true, plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update / Personalize Plan
const updatePlan = async (req, res) => {
    try {
        const plan = await WorkoutPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        // Clients can edit their own plans (personalization allowed)
        // Trainers & Admin can edit any plan
        if (req.user.role === 'client' && plan.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only edit your own plans' });
        }

        Object.assign(plan, req.body);
        await plan.save();

        res.json({ success: true, plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Plan
const deletePlan = async (req, res) => {
    try {
        const plan = await WorkoutPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        if (req.user.role === 'client' && plan.client && plan.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        await plan.deleteOne();
        res.json({ success: true, message: 'Plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Public Templates
const getTemplates = async (req, res) => {
    try {
        const plans = await WorkoutPlan.find({ isTemplate: true })
            .populate('createdBy', 'name role')
            .populate('weeks.days.exercises.exercise', 'name muscleGroup difficulty image');
        res.json({ success: true, plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Clone a Plan for current user
const clonePlan = async (req, res) => {
    try {
        const originalPlan = await WorkoutPlan.findById(req.params.id);
        if (!originalPlan) return res.status(404).json({ success: false, message: 'Plan not found' });

        const clonedData = {
            title: `${originalPlan.title} (Personalized)`,
            goalType: originalPlan.goalType,
            client: req.user._id,
            isTemplate: false,
            createdBy: req.user._id,
            weeks: originalPlan.weeks
        };

        const newPlan = await WorkoutPlan.create(clonedData);
        res.status(201).json({ success: true, plan: newPlan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const User = require('../models/User');

// Toggle Day Completion
const toggleDayComplete = async (req, res) => {
    try {
        const { weekIndex, dayIndex } = req.body;
        const plan = await WorkoutPlan.findById(req.params.id);

        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        if (plan.client?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only complete your own plans' });
        }

        const week = plan.weeks[weekIndex];
        const day = week.days[dayIndex];

        if (!day) return res.status(404).json({ success: false, message: 'Day not found' });

        const wasCompleted = day.completed;

        // Clients cannot undo completion
        if (wasCompleted && req.user.role === 'client') {
            return res.status(403).json({ success: false, message: 'You cannot undo a completed session. Contact your trainer if this was an error.' });
        }

        day.completed = !day.completed;

        // Recalculate overall completion percentage
        let totalDays = 0;
        let completedDays = 0;
        plan.weeks.forEach(w => {
            w.days.forEach(d => {
                totalDays++;
                if (d.completed) completedDays++;
            });
        });
        plan.completionPercentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

        const user = await User.findById(req.user._id);

        if (day.completed && !wasCompleted) {
            // Reward for completion
            user.xp += 50;
            user.stats.strength += 1;
            user.stats.endurance += 1;
            user.currentStreak += 1;
            if (user.currentStreak > user.longestStreak) {
                user.longestStreak = user.currentStreak;
            }
        } else if (!day.completed && wasCompleted) {
            // Remove reward if un-marked
            user.xp = Math.max(0, user.xp - 50);
            user.currentStreak = Math.max(0, user.currentStreak - 1);
        }

        // Level up logic
        const newLevel = Math.floor(user.xp / 500) + 1;
        if (newLevel > user.level) {
            user.level = newLevel;
            const titles = ["Rookie", "Novice", "Warrior", "Champion", "Elite", "Legend", "Mythic"];
            user.title = titles[Math.min(Math.floor(newLevel / 5), titles.length - 1)];
        }

        // Recalculate overall score
        user.stats.overallScore = Math.round(
            (user.stats.strength + user.stats.endurance + user.stats.stamina +
                user.stats.flexibility + user.stats.explosivePower + user.stats.coreStability) / 6
        );

        user.markModified('stats');

        // Parallelize all writes
        const updatePromises = [plan.save(), user.save()];

        const Goal = require('../models/Goal');
        if (day.completed && !wasCompleted) {
            updatePromises.push(Goal.updateMany(
                { client: req.user._id, status: 'active', type: { $in: ['consistency', 'strength', 'endurance'] } },
                { $inc: { currentValue: 1 } }
            ));
        } else if (!day.completed && wasCompleted) {
            updatePromises.push(Goal.updateMany(
                { client: req.user._id, status: 'active', type: { $in: ['consistency', 'strength', 'endurance'] } },
                { $inc: { currentValue: -1 } }
            ));
        }

        const ProgressRecord = require('../models/ProgressRecord');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (day.completed && !wasCompleted) {
            updatePromises.push(ProgressRecord.findOneAndUpdate(
                { client: req.user._id, date: today },
                { 
                    $set: { workoutCompleted: true },
                    $inc: { xpGained: 50 },
                    $push: { 
                        activities: { 
                            title: `Workout: ${plan.title} - ${day.day}`,
                            type: 'workout',
                            xpAwarded: 50
                        } 
                    }
                },
                { upsert: true }
            ));
        } else if (!day.completed && wasCompleted) {
            updatePromises.push(ProgressRecord.findOneAndUpdate(
                { client: req.user._id, date: today },
                { 
                    $inc: { xpGained: -50 },
                    $pull: { activities: { title: `Workout: ${plan.title} - ${day.day}` } }
                }
            ));
        }

        await Promise.all(updatePromises);
        res.json({ success: true, plan, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createWorkoutPlan,
    getMyPlans,
    getAllPlans,
    getPlanById,
    updatePlan,
    deletePlan,
    getTemplates,
    clonePlan,
    toggleDayComplete
};