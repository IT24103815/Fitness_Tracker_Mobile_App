const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    changeUserRole
} = require('../controllers/authController');

const upload = multer({ dest: 'uploads/' });

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/profile', protect, getProfile);
router.patch('/profile', protect, upload.single('profilePicture'), updateProfile);

// Admin only - change user role
router.patch('/users/:id/role', protect, authorize('admin'), changeUserRole);

module.exports = router;