const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getWeightHistory,
    logWeight,
    deleteWeightEntry
} = require('../controllers/progressAnalyticsController');

router.get('/weight', protect, getWeightHistory);
router.get('/weight/:clientId', protect, getWeightHistory);
router.post('/weight', protect, logWeight);
router.delete('/weight/:id', protect, deleteWeightEntry);

module.exports = router;
