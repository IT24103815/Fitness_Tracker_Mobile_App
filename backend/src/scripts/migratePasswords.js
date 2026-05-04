const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const migratePasswords = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fittrack';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for migration');

    const users = await User.find({});
    console.log(`🔍 Found ${users.length} users to update`);

    for (const user of users) {
      const emailPrefix = user.email.split('@')[0];
      const newPassword = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) + '@123';
      
      user.password = newPassword;
      await user.save();
      console.log(`✅ Updated password for: ${user.email} -> ${newPassword} (will be hashed)`);
    }

    console.log('🏁 Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migratePasswords();
