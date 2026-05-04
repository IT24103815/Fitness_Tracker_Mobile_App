const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getDashboard,
    createGoal,
    getUserGoals,
    updateGoal,
    deleteGoal,
    addProgressRecord
} = require('../controllers/progressController');

router.get('/dashboard', protect, getDashboard);
router.get('/dashboard/:clientId', protect, authorize('admin', 'trainer'), getDashboard);

router.post('/goals', protect, createGoal);
router.get('/goals', protect, getUserGoals);
router.put('/goals/:id', protect, updateGoal);
router.delete('/goals/:id', protect, deleteGoal);

router.post('/records', protect, addProgressRecord);

module.exports = router;