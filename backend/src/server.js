const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes');
const mealRoutes = require('./routes/mealRoutes');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fittrack_meals')
  .then(async () => {
    console.log('✅ MongoDB Connected Successfully');
    const User = require('./models/User');
    const adminEmail = 'admin@fittrack.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: 'admin123',
        role: 'admin'
      });
      console.log(`✅ Admin user created: ${adminEmail} / admin123`);
    } else {
      console.log(`✅ Admin user already exists: ${adminEmail}`);
    }
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: '🥗 FitTrack - Meal & Nutrition Management API',
    component: 'Custom Meal Plan & Nutrition Management',
    student: 'Egalla J.I | IT24101315',
    version: '1.0',
    endpoints: {
      auth_register: 'POST /api/auth/register',
      auth_login: 'POST /api/auth/login',
      auth_profile: 'GET /api/auth/profile',
      meal_templates: 'GET /api/meals/templates',
      create_template: 'POST /api/meals/templates  (admin/trainer)',
      save_template: 'POST /api/meals/templates/:id/save  (client)',
      my_plans: 'GET /api/meals/my',
      log_meal: 'POST /api/meals/:id/log',
      plan_detail: 'GET /api/meals/:id',
      update_plan: 'PUT /api/meals/:id',
      delete_plan: 'DELETE /api/meals/:id'
    }
  });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Meal & Nutrition API running on http://localhost:${PORT}`);
  console.log(`📋 Component: Custom Meal Plan & Nutrition Management`);
  console.log(`🎓 Student: Egalla J.I | IT24101315\n`);
});
