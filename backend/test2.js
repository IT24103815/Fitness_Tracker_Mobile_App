const axios = require('axios');
const mongoose = require('mongoose');
const Exercise = require('./src/models/Exercise');
require('dotenv').config();

async function run() {
    await mongoose.connect('mongodb://localhost:27017/fittrack');
    const exercise = await Exercise.findOne();
    if (!exercise) {
        console.log("No exercises");
        process.exit();
    }
    
    console.log("Exercise ID:", exercise._id.toString());
    
    // We need a token to update
    const User = require('./src/models/User');
    const jwt = require('jsonwebtoken');
    const admin = await User.findOne({role: 'admin'});
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
    
    try {
        const res = await axios.put(`http://127.0.0.1:5000/api/exercises/${exercise._id}`, {
            name: exercise.name + " TEST",
            difficulty: "Advanced"
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log("Update Code:", res.status);
    } catch (err) {
        console.log("Update Error:", err.response ? err.response.status : err.message);
    }
    
    // Fetch it back
    try {
        const res2 = await axios.get(`http://127.0.0.1:5000/api/exercises/${exercise._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Fetch Code:", res2.status);
        console.log("Fetched Name:", res2.data.exercise.name);
    } catch(err) {
        console.log("Fetch Error:", err.response ? err.response.status : err.message);
    }
    
    process.exit();
}

run();
