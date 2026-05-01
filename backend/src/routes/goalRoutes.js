const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
  getDashboard
} = require('../controllers/goalController');

router.get('/dashboard', protect, getDashboard);
router.post('/', protect, createGoal);
router.get('/', protect, getGoals);
router.get('/:id', protect, getGoalById);
router.put('/:id', protect, updateGoal);
router.patch('/:id/progress', protect, updateGoalProgress);
router.delete('/:id', protect, deleteGoal);

module.exports = router;
