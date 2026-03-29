const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['applied', 'screened', 'interviewing', 'offered', 'rejected'], 
    default: 'applied' 
  },
  resumeUrl: { type: String }, // Cloudinary URL
  matchScore: { type: Number, default: 0 }, // 0-100
  appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);
