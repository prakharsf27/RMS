const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobTitle: { type: String, required: true },
  candidateName: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['virtual', 'in-person'], 
    required: true 
  },
  location: { type: String, required: true }, // Meeting link or address
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['scheduled', 'completed', 'cancelled'], 
    default: 'scheduled' 
  },
  feedback: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Interview', InterviewSchema);
