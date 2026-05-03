const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes');
const progressRoutes = require('./routes/progressRoutes');

dotenv.config();

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fittrack')
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
      console.log('✅ Admin created: admin@fittrack.com / admin123');
    }
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FitTrack Goal Management Backend is Running',
    routes: {
      auth: '/api/auth',
      goals: '/api/progress/goals',
      progressDashboard: '/api/progress/dashboard'
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});