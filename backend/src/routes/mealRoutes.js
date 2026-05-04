const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    createTemplate,
    getAllTemplates,
    saveTemplateAsMyPlan,
    getMyMealPlans,
    logDailyMeal,
    updateMealPlan,
    deleteMealPlan,
    getMealPlanById
} = require('../controllers/mealController');

const upload = multer({ dest: 'uploads/' });

// Templates (Admin/Trainer only for create)
router.post('/templates', protect, authorize('admin', 'trainer'), createTemplate);
router.get('/templates', protect, getAllTemplates);

// Client actions
router.post('/templates/:id/save', protect, saveTemplateAsMyPlan);
router.get('/my', protect, getMyMealPlans);

// Daily logging with photo proof
router.post('/:id/log', protect, upload.single('photoProof'), logDailyMeal);

// Update & Delete (with role protection in controller)
router.get('/:id', protect, getMealPlanById);
router.put('/:id', protect, updateMealPlan);
router.delete('/:id', protect, deleteMealPlan);

module.exports = router;