const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: folder },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        stream.end(buffer);
    });
};

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

    // Password validation regex
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters long and include a capital letter, a number, and a special character (!@#$%^&*)' 
      });
    }

    // Email validation regex (simple @ check as requested)
    if (!email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email with @' });
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
      fitnessGoals: Array.isArray(fitnessGoals) ? fitnessGoals : [],
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
  let { email, password } = req.body;
  email = email ? email.toLowerCase().trim() : email;
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
      const result = await uploadToCloudinary(req.file.buffer, 'fittrack/profiles');
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

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid current password' });
    }

    user.password = newPassword;
    await user.save(); // This will trigger the pre-save hook and schema validations

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const changeUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        if (req.body.role) {
            user.role = req.body.role;
        }
        await user.save();
        res.json({ success: true, message: 'User role updated', user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { registerUser, loginUser, getProfile, updateProfile, changeUserRole, changePassword };