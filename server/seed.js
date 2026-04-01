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
      { fname: 'John', lname: 'Candidate', email: 'candidate@rms.com', password: hashedPassword, role: 'candidate', avatar: 'https://ui-avatars.com/api/?name=John+Candidate&background=10b981&color=fff' },
      { fname: 'Michael', lname: 'Apple', email: 'apple@rms.com', password: hashedPassword, role: 'recruiter', avatar: 'https://ui-avatars.com/api/?name=Apple+Recruiter&background=000&color=fff' },
      { fname: 'Satya', lname: 'Microsoft', email: 'ms@rms.com', password: hashedPassword, role: 'recruiter', avatar: 'https://ui-avatars.com/api/?name=MS+Talent&background=00a4ef&color=fff' },
      { fname: 'Jeff', lname: 'Amazon', email: 'amazon@rms.com', password: hashedPassword, role: 'recruiter', avatar: 'https://ui-avatars.com/api/?name=Amazon+Hiring&background=ff9900&color=000' }
    ]);
    
    const rUber = users[1];
    const rApple = users[3];
    const rMS = users[4];
    const rAmazon = users[5];

    console.log('🌱 Seeding companies...');
    const companies = await Company.insertMany([
        { 
            name: 'Uber', 
            logo: 'https://www.vectorlogo.zone/logos/uber/uber-icon.svg', 
            industry: 'Transportation/Tech', 
            location: 'San Francisco, CA',
            description: 'Uber is a technology platform that uses a massive network, leading technology, operational excellence and product expertise to power movement around the world.',
            recruiterId: rUber._id 
        },
        { 
            name: 'Google', 
            logo: 'https://www.vectorlogo.zone/logos/google/google-icon.svg', 
            industry: 'Search/Cloud', 
            location: 'Mountain View, CA',
            description: 'Google’s mission is to organize the world’s information and make it universally accessible and useful.',
            recruiterId: rUber._id 
        },
        {
            name: 'Apple',
            logo: 'https://www.vectorlogo.zone/logos/apple/apple-icon.svg',
            industry: 'Consumer Electronics',
            location: 'Cupertino, CA',
            description: 'Apple designs, manufactures and markets smartphones, personal computers, tablets, wearables and accessories worldwide.',
            recruiterId: rApple._id
        },
        {
            name: 'Microsoft',
            logo: 'https://www.vectorlogo.zone/logos/microsoft/microsoft-icon.svg',
            industry: 'Software/Cloud',
            location: 'Redmond, WA',
            description: 'Microsoft enables digital transformation for the era of an intelligent cloud and an intelligent edge.',
            recruiterId: rMS._id
        },
        {
            name: 'Amazon',
            logo: 'https://www.vectorlogo.zone/logos/amazon/amazon-icon.svg',
            industry: 'E-commerce/Cloud',
            location: 'Seattle, WA',
            description: 'Amazon is guided by four principles: customer obsession, passion for invention, commitment to operational excellence, and long-term thinking.',
            recruiterId: rAmazon._id
        },
        {
            name: 'Netflix',
            logo: 'https://www.vectorlogo.zone/logos/netflix/netflix-icon.svg',
            industry: 'Entertainment',
            location: 'Los Gatos, CA',
            description: 'Netflix is the world\'s leading streaming entertainment service with over 200 million paid memberships.',
            recruiterId: rMS._id
        }
    ]);

    console.log('🌱 Seeding jobs...');
    await Job.insertMany([
        {
            title: 'Senior Frontend Developer',
            department: 'Engineering',
            location: 'Remote',
            type: 'Full-Time',
            salary: '$140k - $190k',
            description: 'Join Uber to build the next generation of transportation platforms using React and advanced system design.',
            requirements: ['React', 'TypeScript', 'Node.js', 'System Design'],
            recruiterId: rUber._id,
            status: 'active'
        },
        {
            title: 'Staff Product Manager',
            department: 'Product',
            location: 'Mountain View, CA',
            type: 'Full-Time',
            salary: '$180k - $250k',
            description: 'Help us define the future of search at Google. Lead cross-functional teams to deliver massive impact.',
            requirements: ['Product Strategy', 'ML/AI knowledge', 'Data Analysis'],
            recruiterId: rUber._id,
            status: 'active'
        },
        {
            title: 'iOS Systems Engineer',
            department: 'OS Engineering',
            location: 'Cupertino, CA',
            type: 'Full-Time',
            salary: '$160k - $220k',
            description: 'Work on the core of iOS. Optimize performance and security for billions of users.',
            requirements: ['Swift', 'C/C++', 'Kernel Development', 'Performance Tuning'],
            recruiterId: rApple._id,
            status: 'active'
        },
        {
            title: 'Software Engineer II (Azure)',
            department: 'Cloud',
            location: 'Redmond, WA',
            type: 'Full-Time',
            salary: '$130k - $175k',
            description: 'Build hyperscale cloud services on Azure. Help developers build anything, anywhere.',
            requirements: ['C#', '.NET Core', 'Kubernetes', 'Distributed Systems'],
            recruiterId: rMS._id,
            status: 'active'
        },
        {
            title: 'Senior SDE (AWS Lambda)',
            department: 'AWS',
            location: 'Seattle, WA',
            type: 'Full-Time',
            salary: '$150k - $210k',
            description: 'Define the future of serverless computing at Amazon Web Services.',
            requirements: ['Java', 'Golang', 'Serverless', 'Microservices'],
            recruiterId: rAmazon._id,
            status: 'active'
        },
        {
            title: 'Principal Designer (Apple Vision Pro)',
            department: 'Design',
            location: 'Cupertino, CA',
            type: 'Full-Time',
            salary: '$200k+',
            description: 'Create the next generation of spatial computing experiences for Vision Pro.',
            requirements: ['Visual Design', '3D UI', 'Unity/RealityKit', 'Prototyping'],
            recruiterId: rApple._id,
            status: 'active'
        },
        {
            title: 'Security Researcher',
            department: 'Security',
            location: 'Remote',
            type: 'Full-Time',
            salary: '$170k - $240k',
            description: 'Identify and mitigate vulnerabilities in complex streaming architectures.',
            requirements: ['Cybersecurity', 'Rust', 'Cloud Security', 'Exploit Development'],
            recruiterId: rMS._id,
            status: 'active'
        },
        {
            title: 'Machine Learning Engineer (Alexa)',
            department: 'AI Lab',
            location: 'Boston, MA',
            type: 'Full-Time',
            salary: '$160k - $230k',
            description: 'Improve natural language understanding for Alexa using state-of-the-art LLMs.',
            requirements: ['Python', 'PyTorch', 'NLP', 'Big Data'],
            recruiterId: rAmazon._id,
            status: 'active'
        },
        {
            title: 'Data Scientist (Ads)',
            department: 'Analytics',
            location: 'San Francisco, CA',
            type: 'Full-Time',
            salary: '$150k - $200k',
            description: 'Optimize advertising algorithms at Uber using petabytes of data.',
            requirements: ['SQL', 'Statistical Modeling', 'Spark'],
            recruiterId: rUber._id,
            status: 'active'
        },
        {
            title: 'Frontend Engineer (Netflix.com)',
            department: 'Content Platform',
            location: 'Los Gatos, CA',
            type: 'Full-Time',
            salary: '$180k - $300k (Total Comp)',
            description: 'Build the world\'s best streaming UI. Performance and reliability at scale.',
            requirements: ['React', 'GraphQL', 'A/B Testing'],
            recruiterId: rMS._id,
            status: 'active'
        },
        {
            title: 'Cloud Solutions Architect',
            department: 'Sales Engineering',
            location: 'London, UK',
            type: 'Full-Time',
            salary: '£90k - £130k',
            description: 'Help enterprise customers move to Azure. Design and implement cloud strategies.',
            requirements: ['Cloud Architecture', 'Azure', 'Pre-Sales'],
            recruiterId: rMS._id,
            status: 'active'
        },
        {
            title: 'Operations Manager',
            department: 'Logistics',
            location: 'Delhi, India',
            type: 'Full-Time',
            salary: '₹15L - ₹25L',
            description: 'Optimize delivery operations for Amazon in the North India region.',
            requirements: ['Supply Chain', 'Logistics', 'Team Management'],
            recruiterId: rAmazon._id,
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
