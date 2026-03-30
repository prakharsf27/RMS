require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found.');
  process.exit(1);
}

// Define Schemas inline for seeding to avoid dependency issues during seed
const User = mongoose.model('User', new mongoose.Schema({
  fname: String,
  lname: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'candidate' },
  status: { type: String, default: 'active' },
  avatar: String
}, { timestamps: true }));

const Company = mongoose.model('Company', new mongoose.Schema({
  name: String,
  description: String,
  industry: String,
  location: String,
  website: String,
  logo: String,
  recruiterId: mongoose.Schema.Types.ObjectId
}, { timestamps: true }));

const Job = mongoose.model('Job', new mongoose.Schema({
  title: String,
  department: String,
  location: String,
  type: String,
  salary: String,
  description: String,
  requirements: [String],
  recruiterId: mongoose.Schema.Types.ObjectId,
  status: { type: String, default: 'active' },
  applicantsCount: { type: Number, default: 0 }
}, { timestamps: true }));

const seed = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected!\n');

    console.log('🗑️  Clearing existing data...');
    await Promise.all([
        User.deleteMany({}),
        Company.deleteMany({}),
        Job.deleteMany({})
    ]);
    console.log('✅ Cleared!\n');

    const hashedPassword = await bcrypt.hash('password123', 10);

    console.log('🌱 Seeding users...');
    const users = await User.insertMany([
      { fname: 'Admin', lname: 'User', email: 'admin@rms.com', password: hashedPassword, role: 'admin', avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=7c3aed&color=fff' },
      { fname: 'Sarah', lname: 'Recruiter', email: 'recruiter@rms.com', password: hashedPassword, role: 'recruiter', avatar: 'https://ui-avatars.com/api/?name=Sarah+Recruiter&background=0ea5e9&color=fff' },
      { fname: 'John', lname: 'Candidate', email: 'candidate@rms.com', password: hashedPassword, role: 'candidate', avatar: 'https://ui-avatars.com/api/?name=John+Candidate&background=10b981&color=fff' }
    ]);
    const recruiter = users[1];

    console.log('🌱 Seeding companies...');
    const companies = await Company.insertMany([
        { 
            name: 'Uber', 
            logo: 'https://www.vectorlogo.zone/logos/uber/uber-icon.svg', 
            industry: 'Transportation/Tech', 
            location: 'San Francisco, CA',
            recruiterId: recruiter._id 
        },
        { 
            name: 'Google', 
            logo: 'https://www.vectorlogo.zone/logos/google/google-icon.svg', 
            industry: 'Search/Cloud', 
            location: 'Mountain View, CA',
            recruiterId: recruiter._id 
        }
    ]);

    console.log('🌱 Seeding jobs...');
    await Job.insertMany([
        {
            title: 'Senior Frontend Developer',
            department: 'Engineering',
            location: 'Remote',
            type: 'Full-Time',
            salary: '$120k - $160k',
            description: 'Join Uber to build the next generation of transportation platforms.',
            requirements: ['React', 'Node.js', 'System Design'],
            recruiterId: recruiter._id,
            status: 'active'
        },
        {
            title: 'Product Manager',
            department: 'Product',
            location: 'Banglore',
            type: 'Full-Time',
            salary: '₹20L - ₹35L',
            description: 'Help us define the future of search at Google.',
            requirements: ['Product Strategy', 'Agile', 'Data Analysis'],
            recruiterId: recruiter._id,
            status: 'active'
        }
    ]);

    console.log('\n🎉 Database Seeded Successfully!');
    console.log('   ✅ admin@rms.com / password123');
    console.log('   ✅ recruiter@rms.com / password123');
    console.log('   ✅ candidate@rms.com / password123');

  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
