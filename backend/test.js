const mongoose = require('mongoose');
const Exercise = require('./src/models/Exercise');
require('dotenv').config();

async function run() {
    await mongoose.connect('mongodb://localhost:27017/fittrack');
    const exercise = await Exercise.findOne();
    if (!exercise) {
        console.log("No exercises found.");
        process.exit();
    }
    console.log("Original:", exercise);
    
    // Simulate updating
    const updateData = {
        name: exercise.name + " Test",
        category: ['Cardio'],
        muscleGroup: ['Legs']
    };
    
    Object.keys(updateData).forEach(key => {
        exercise[key] = updateData[key];
    });
    
    try {
        await exercise.save();
        console.log("Update success!");
    } catch(err) {
        console.log("Error updating:", err.message);
    }
    
    const fetched = await Exercise.findById(exercise._id);
    console.log("Fetched after update:", fetched);
    
    process.exit();
}

run();
