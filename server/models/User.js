const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'recruiter', 'candidate'], 
    default: 'candidate' 
  },
  avatar: { type: String },
  bio: { type: String },
  skills: [{ type: String }],
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  profileViews: { type: Number, default: 0 },
  
  // Advanced Identity Fields
  // Advanced Identity Fields
  dob: { type: Date },
  phone: { type: String },
  gender: { type: String },
  nationality: { type: String },
  pan: { type: String },
  address: { type: String },
  state: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  
  // Professional Identity
  professionalHeadline: { type: String },
  careerObjective: { type: String },
  links: {
    linkedin: String,
    github: String,
    portfolio: String,
    behance: String,
    other: String
  },

  // Talent Assets
  resume: { type: String }, // Path to PDF
  experienceLevel: { 
    type: String, 
    enum: ['fresher', 'experienced'], 
    default: 'fresher' 
  },
  yearsOfExperience: { type: Number, default: 0 },

  workExperience: [{
    title: String,
    empType: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    isCurrent: Boolean,
    description: String,
    skills: [String]
  }],

  education: [{
    degree: String,
    field: String,
    institution: String,
    board: String,
    startYear: String,
    endYear: String,
    grade: String,
    coursework: String,
    achievements: String
  }],

  certifications: [{
    title: String,
    certType: String,
    organization: String,
    issueDate: Date,
    expiryDate: Date,
    credentialId: String
  }],

  projects: [{
    title: String,
    projectType: String,
    description: String,
    duration: String,
    link: String,
    skills: [String]
  }],

  languages: [{
    name: String,
    proficiency: String
  }],

  jobPreferences: {
    titles: [String],
    workModes: [String],
    locations: [String],
    relocation: String,
    salaryMin: Number,
    salaryMax: Number,
    salaryType: { type: String, default: 'Annual' },
    noticePeriod: String,
    employmentStatus: String
  },

  references: [{
    name: String,
    designation: String,
    organization: String,
    relationship: String,
    email: String,
    phone: String
  }],
  
  // Recruitment Status
  hiringStatus: { 
    type: String, 
    enum: ['pending', 'interviewing', 'hired', 'rejected'], 
    default: 'pending' 
  },

  status: { 
    type: String, 
    enum: ['active', 'suspended'], 
    default: 'active' 
  },
  isEngaged: { type: Boolean, default: false },

  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
