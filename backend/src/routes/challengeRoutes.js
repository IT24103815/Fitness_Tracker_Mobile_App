const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    createChallenge,
    getAllChallenges,
    getMyWeeklyChallenges,
    updateChallengeStatus,
    completeChallenge,
    updateChallenge,
    deleteChallenge,
    acceptChallengeTemplate,
    getChallengeById
} = require('../controllers/challengeController');

router.post('/', protect, authorize('admin', 'trainer'), createChallenge);
router.get('/', protect, getAllChallenges);
router.get('/my-weekly', protect, getMyWeeklyChallenges);
router.get('/:id', protect, getChallengeById);
router.put('/:id', protect, authorize('admin', 'trainer'), updateChallenge);
router.delete('/:id', protect, authorize('admin', 'trainer'), deleteChallenge);

router.post('/accept-template/:templateId', protect, acceptChallengeTemplate);
router.patch('/:id/status', protect, updateChallengeStatus);
router.post('/:id/complete', protect, completeChallenge);

module.exports = router;