const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Remote'], 
    required: true 
  },
  salary: { type: String },
  description: { type: String, required: true },
  requirements: [String],
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['active', 'closed'], 
    default: 'active' 
  },
  applicantsCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
