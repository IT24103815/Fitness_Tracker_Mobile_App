const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    createExercise,
    getAllExercises,
    getExerciseById,
    updateExercise,
    deleteExercise
} = require('../controllers/exerciseController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', protect, getAllExercises);
router.get('/:id', protect, getExerciseById);

router.post('/', protect, authorize('admin', 'trainer'), upload.single('image'), createExercise);
router.put('/:id', protect, authorize('admin', 'trainer'), upload.single('image'), updateExercise);
router.delete('/:id', protect, authorize('admin', 'trainer'), deleteExercise);

module.exports = router;