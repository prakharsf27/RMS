const mongoose = require('mongoose');

const EmailLogSchema = new mongoose.Schema({
  eventType: { type: String, required: true },
  recipient: { type: String, required: true },
  entityId: { type: String },
  idempotencyKey: { type: String, index: true },
  status: { 
    type: String, 
    enum: ['sent', 'preview', 'failed', 'suppressed'], 
    default: 'sent' 
  },
  subject: { type: String },
  provider: { type: String, default: 'resend' },
  providerMessageId: { type: String },
  error: { type: String },
  sentAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Prevent TTL/expiry by default, keep logs for auditing
module.exports = mongoose.model('EmailLog', EmailLogSchema);
