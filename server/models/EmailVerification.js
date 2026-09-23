const mongoose = require('mongoose');

const EmailVerificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    lowercase: true,
    index: true 
  },
  otpHash: { 
    type: String, 
    required: true 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    index: { expires: '10m' } // TTL auto-index in MongoDB
  },
  attempts: { 
    type: Number, 
    default: 0 
  },
  resendCooldownUntil: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('EmailVerification', EmailVerificationSchema);
