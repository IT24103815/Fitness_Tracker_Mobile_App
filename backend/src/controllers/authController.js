const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// REGISTER - now accepts all professional fields
// @desc    Register new user
const registerUser = async (req, res) => {
  const { 
    name, email, password, role, gender, dateOfBirth, height, 
    currentWeight, targetWeight, preferredUnits, 
    fitnessGoals, activityLevel, experienceLevel, bio,
    specializations, experienceYears, certifications
  } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    if (role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot register as admin' });
    }

    const assignedRole = role === 'trainer' ? 'trainer' : 'client';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      gender: gender || 'prefer_not_to_say',
      dateOfBirth: dateOfBirth || undefined,
      height: height || undefined,
      currentWeight: currentWeight || undefined,
      targetWeight: targetWeight || undefined,
      preferredUnits: preferredUnits || 'metric',
      fitnessGoals: Array.isArray(fitnessGoals) ? fitnessGoals : [],   // Handle array safely
      activityLevel: activityLevel || 'moderate',
      experienceLevel: experienceLevel || 'beginner',
      bio: bio || '',
      specializations: Array.isArray(specializations) ? specializations : [],
      experienceYears: experienceYears || undefined,
      certifications: Array.isArray(certifications) ? certifications : [],
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Registration failed. Please try again.' 
    });
  }
};

// LOGIN (unchanged)
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    res.json({ success: true, token: generateToken(user._id), user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => res.json({ success: true, user: req.user });

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'fittrack/profiles',
      });
      user.profilePicture = result.secure_url;
    }

    // Define allowed fields for update (exclude role, admin, stats, level, xp, etc.)
    const allowedUpdates = [
      'name', 'gender', 'dateOfBirth', 'height', 'currentWeight', 
      'targetWeight', 'preferredUnits', 'fitnessGoals', 'activityLevel', 
      'experienceLevel', 'bio', 'specializations', 'experienceYears', 'certifications'
    ];

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key) && req.body[key] !== undefined) {
        user[key] = req.body[key];
      }
    });

    const updatedUser = await user.save();
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const changeUserRole = async (req, res) => { /* same as before */ };

module.exports = { registerUser, loginUser, getProfile, updateProfile, changeUserRole };