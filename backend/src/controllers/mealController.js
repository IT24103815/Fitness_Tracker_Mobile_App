const MealPlan = require('../models/MealPlan');
const cloudinary = require('../config/cloudinary');

// Create Template (Admin/Trainer only)
const createTemplate = async (req, res) => {
    try {
        if (!req.body.title || !req.body.goalType || !req.body.dailyMeals) {
            return res.status(400).json({ success: false, message: 'Please provide title, goalType, and dailyMeals' });
        }

        const plan = await MealPlan.create({
            ...req.body,
            isTemplate: true,
            createdBy: req.user._id
        });
        res.status(201).json({ success: true, plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Templates (Everyone can see)
const getAllTemplates = async (req, res) => {
    try {
        const templates = await MealPlan.find({ isTemplate: true })
            .populate('createdBy', 'name role');
        res.json({ success: true, templates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Save Template as My Plan (Client only)
const saveTemplateAsMyPlan = async (req, res) => {
    try {
        const template = await MealPlan.findById(req.params.id);
        if (!template || !template.isTemplate) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }

        const myPlan = await MealPlan.create({
            title: template.title + " (My Plan)",
            goalType: template.goalType,
            isTemplate: false,
            client: req.user._id,
            createdBy: req.user._id,
            dailyMeals: template.dailyMeals,
            targetMacros: template.targetMacros
        });

        res.status(201).json({ success: true, myPlan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get My Meal Plans (for logged in client)
const getMyMealPlans = async (req, res) => {
    try {
        const plans = await MealPlan.find({
            client: req.user._id,
            isTemplate: false
        }).populate('createdBy', 'name');
        res.json({ success: true, plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Log Daily Adherence + Photo (Client only)
const logDailyMeal = async (req, res) => {
    try {
        const plan = await MealPlan.findById(req.params.id);
        if (!plan || plan.isTemplate) return res.status(403).json({ success: false, message: 'Cannot log on template' });

        if (req.user.role === 'client' && plan.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { date, adherencePercentage, notes } = req.body;
        if (!date || adherencePercentage === undefined) {
            return res.status(400).json({ success: false, message: 'Please provide date and adherencePercentage' });
        }
        
        let photoProof = '';

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { folder: 'fittrack/mealproof' });
            photoProof = result.secure_url;
        }

        plan.dailyLogs.push({
            date: new Date(date),
            adherencePercentage,
            notes,
            photoProof
        });

        await plan.save();
        res.json({ success: true, plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update (only owner or admin/trainer)
const updateMealPlan = async (req, res) => {
    try {
        const plan = await MealPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        if (req.user.role === 'client' && plan.client?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only edit your own plans' });
        }

        Object.assign(plan, req.body);
        
        // Explicitly mark dailyMeals as modified if provided
        if (req.body.dailyMeals) {
            plan.markModified('dailyMeals');
        }

        await plan.save();

        res.json({ success: true, plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMealPlanById = async (req, res) => {
    try {
        const plan = await MealPlan.findById(req.params.id)
            .populate('createdBy', 'name')
            .populate('client', 'name');
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        res.json({ success: true, plan });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete (only owner or admin/trainer)
const deleteMealPlan = async (req, res) => {
    try {
        const plan = await MealPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        if (req.user.role === 'client' && plan.client?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        await plan.deleteOne();
        res.json({ success: true, message: 'Plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createTemplate,
    getAllTemplates,
    saveTemplateAsMyPlan,
    getMyMealPlans,
    logDailyMeal,
    updateMealPlan,
    deleteMealPlan,
    getMealPlanById
};