const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '30d' });

const registerUser = async (req, res) => {
  try {
    const {
      name, email, password, role, gender, dateOfBirth, height,
      currentWeight, targetWeight, preferredUnits,
      fitnessGoals, activityLevel, experienceLevel, bio
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const assignedRole = role === 'trainer' ? 'trainer' : 'client';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      gender: gender || 'prefer_not_to_say',
      dateOfBirth: dateOfBirth || undefined,
      height: height ? Number(height) : undefined,
      currentWeight: currentWeight ? Number(currentWeight) : undefined,
      targetWeight: targetWeight ? Number(targetWeight) : undefined,
      preferredUnits: preferredUnits || 'metric',
      fitnessGoals: Array.isArray(fitnessGoals) ? fitnessGoals : [],
      activityLevel: activityLevel || 'moderate',
      experienceLevel: experienceLevel || 'beginner',
      bio: bio || ''
    });

    res.status(201).json({ success: true, token: generateToken(user._id), user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({ success: true, token: generateToken(user._id), user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  res.json({ success: true, user: req.user });
};

const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'height', 'currentWeight', 'targetWeight', 'fitnessGoals', 'activityLevel', 'experienceLevel', 'bio'];
    const user = await User.findById(req.user._id);

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    const updatedUser = await user.save();
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerUser, loginUser, getProfile, updateProfile };
