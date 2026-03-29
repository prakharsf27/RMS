require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found.');
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'candidate' },
  status: { type: String, default: 'active' },
  avatar: String
});

const User = mongoose.model('User', userSchema);

const seed = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected!\n');

    console.log('🗑️  Clearing existing users...');
    await User.deleteMany({});
    console.log('✅ Cleared!\n');

    // Hash password once for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const seedUsers = [
      { fname: 'Admin', lname: 'User', email: 'admin@rms.com', password: hashedPassword, role: 'admin', status: 'active', avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=7c3aed&color=fff' },
      { fname: 'Sarah', lname: 'Recruiter', email: 'recruiter@rms.com', password: hashedPassword, role: 'recruiter', status: 'active', avatar: 'https://ui-avatars.com/api/?name=Sarah+Recruiter&background=0ea5e9&color=fff' },
      { fname: 'John', lname: 'Candidate', email: 'candidate@rms.com', password: hashedPassword, role: 'candidate', status: 'active', avatar: 'https://ui-avatars.com/api/?name=John+Candidate&background=10b981&color=fff' }
    ];

    console.log('🌱 Seeding demo accounts...');
    await User.insertMany(seedUsers);
    
    console.log('   ✅ admin@rms.com / password123');
    console.log('   ✅ recruiter@rms.com / password123');
    console.log('   ✅ candidate@rms.com / password123');

    console.log('\n🎉 Done! Try logging in now.');

  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
