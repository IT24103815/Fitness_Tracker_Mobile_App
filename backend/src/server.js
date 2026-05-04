const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const os = require('os');
const dns = require('dns');

// Set DNS servers to Google's to help with SRV lookup issues on some local networks
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (dnsErr) {
  console.log('⚠️ DNS configuration failed, using system defaults.');
}

const authRoutes = require('./routes/authRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// ─── Helper: detect this machine's LAN IP ────────────────────────────────────
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return '127.0.0.1';
};

// ─── Middleware ───────────────────────────────────────────────────────────────
// origin:'*' is correct for a JWT-based mobile app (no cookies involved).
// NOTE: Do NOT combine origin:'*' with credentials:true — that violates the
//       CORS spec and causes network errors on Android/iOS.
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes (all registered BEFORE app.listen) ───────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/challenges', challengeRoutes);

// Health-check root route
app.get('/', (req, res) => {
  res.json({ message: 'FitTrack Backend is Running! 🚀', version: '1.0' });
});

// ─── Global Error Handler (must be the LAST middleware) ───────────────────────
app.use(errorHandler);

// ─── Database Connection ──────────────────────────────────────────────────────
console.log('⏳ Attempting to connect to MongoDB...');
mongoose.set('bufferCommands', false); // Disable buffering so we see errors immediately

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fittrack', {
  family: 4,
  serverSelectionTimeoutMS: 30000
})
  .then(async () => {
    console.log('✅ MongoDB Connected Successfully');
    try {
      const User = require('./models/User');
      const adminEmail = 'admin@fittrack.com';
      const adminExists = await User.findOne({ email: adminEmail });
      
      if (!adminExists) {
        await User.create({
          name: 'Super Admin',
          email: adminEmail,
          password: 'Admin@123',
          role: 'admin'
        });
        console.log(`✅ Admin user created: ${adminEmail} / Admin@123`);
      } else {
        console.log(`✅ Admin user ready: ${adminEmail}`);
      }
    } catch (adminError) {
      console.error('⚠️ Admin Initialization Error:', adminError.message);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    if (err.name === 'MongooseServerSelectionError' || err.name === 'MongoServerSelectionError') {
      console.log('\n   ⚠️  CRITICAL: IP Whitelist Check Required');
      console.log('   It looks like your current IP address is not whitelisted on MongoDB Atlas.');
      console.log('   1. Log in to MongoDB Atlas (https://cloud.mongodb.com)');
      console.log('   2. Go to "Network Access" (under Security in the sidebar)');
      console.log('   3. Click "Add IP Address" and select "Allow Access From Anywhere" (0.0.0.0/0) or "Add Current IP Address".\n');
    }
  });

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const LOCAL_IP = getLocalIP();

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🚀 FitTrack Backend is running!');
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://${LOCAL_IP}:${PORT}  ← teammates connect here`);
  console.log('');
});

// Handle server startup errors (like Port already in use)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Error: Port ${PORT} is already in use by another process.`);
    console.error(`   Try killing the process on port ${PORT} or change the PORT in .env`);
    process.exit(1);
  } else {
    console.error('❌ Server failed to start:', err);
  }
});

// ─── Global Error Listeners ──────────────────────────────────────────────────
// Catch unhandled promise rejections (like database timeout or failed requests)
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Catch unexpected synchronous errors
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Give the server time to log before exiting
  setTimeout(() => process.exit(1), 500);
});