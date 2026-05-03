const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    connectClient,
    getMyClients,
    getClientDetail,
    getAvailableClients
} = require('../controllers/trainerController');

router.post('/connect-client', protect, authorize('trainer'), connectClient);
router.get('/my-clients', protect, authorize('trainer'), getMyClients);
router.get('/available-clients', protect, authorize('trainer', 'admin'), getAvailableClients);
router.get('/client/:id', protect, authorize('trainer', 'admin'), getClientDetail);

module.exports = router;
