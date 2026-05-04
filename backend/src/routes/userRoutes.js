const express = require('express');
const { getAllUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // Only admin can access these user management routes

router.route('/')
    .get(getAllUsers);

router.route('/:id')
    .put(updateUserRole)
    .delete(deleteUser);

module.exports = router;
