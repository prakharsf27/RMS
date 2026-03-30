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
  dob: { type: Date },
  phone: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  
  // Talent Assets
  resume: { type: String }, // Path to PDF
  experienceLevel: { 
    type: String, 
    enum: ['fresher', 'experienced'], 
    default: 'fresher' 
  },
  yearsOfExperience: { type: Number, default: 0 },
  
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
