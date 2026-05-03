const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
  getDashboard
} = require('../controllers/progressController');

// Kept for mobile compatibility: /api/progress/goals
router.get('/dashboard', protect, getDashboard);
router.post('/goals', protect, createGoal);
router.get('/goals', protect, getGoals);
router.put('/goals/:id', protect, updateGoal);
router.delete('/goals/:id', protect, deleteGoal);

module.exports = router;
