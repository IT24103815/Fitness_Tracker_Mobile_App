const Exercise = require('../models/Exercise');
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'fittrack/exercises' },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        stream.end(buffer);
    });
};

// Create Exercise (Admin/Trainer only)
const createExercise = async (req, res) => {
    try {
        const { name, category, muscleGroup, description, difficulty, caloriesPerMinute } = req.body;

        if (!name || !category || !muscleGroup || !difficulty) {
            return res.status(400).json({ success: false, message: 'Please provide name, category, muscleGroup, and difficulty' });
        }

        let imageUrl = '';
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;
        }

        const exercise = await Exercise.create({
            name,
            category,
            muscleGroup,
            description,
            difficulty,
            caloriesPerMinute: Number(caloriesPerMinute),
            image: imageUrl,
            createdBy: req.user._id
        });

        res.status(201).json({ success: true, exercise });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Exercises (All roles)
const getAllExercises = async (req, res) => {
    try {
        const { search, category, muscleGroup } = req.query;
        let query = {};

        if (search) query.name = { $regex: search, $options: 'i' };
        if (category) query.category = category;
        if (muscleGroup) query.muscleGroup = muscleGroup;

        const exercises = await Exercise.find(query).sort({ createdAt: -1 });
        res.json({ success: true, exercises });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Single Exercise
const getExerciseById = async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id);
        if (!exercise) return res.status(404).json({ success: false, message: 'Exercise not found' });
        res.json({ success: true, exercise });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Exercise (Admin/Trainer only)
const updateExercise = async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id);
        if (!exercise) return res.status(404).json({ success: false, message: 'Exercise not found' });

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            req.body.image = result.secure_url;
        }

        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) exercise[key] = req.body[key];
        });

        const updated = await exercise.save();
        res.json({ success: true, exercise: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Exercise (Admin/Trainer only)
const deleteExercise = async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id);
        if (!exercise) return res.status(404).json({ success: false, message: 'Exercise not found' });

        await exercise.deleteOne();
        res.json({ success: true, message: 'Exercise deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createExercise,
    getAllExercises,
    getExerciseById,
    updateExercise,
    deleteExercise
};