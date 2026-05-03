const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    createWorkoutPlan,
    getMyPlans,
    getAllPlans,
    getPlanById,
    updatePlan,
    deletePlan,
    getTemplates,
    clonePlan,
    toggleDayComplete
} = require('../controllers/workoutController');

router.post('/', protect, createWorkoutPlan);
router.get('/my', protect, getMyPlans);
router.get('/templates', protect, getTemplates); // Public templates
router.get('/', protect, authorize('admin', 'trainer'), getAllPlans);
router.get('/:id', protect, getPlanById);
router.post('/:id/clone', protect, clonePlan);
router.post('/:id/toggle-day', protect, toggleDayComplete);
router.put('/:id', protect, updatePlan);
router.delete('/:id', protect, deletePlan);

module.exports = router;