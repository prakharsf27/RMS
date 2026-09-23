const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  industry: { type: String, default: 'Enterprise Cloud Infrastructure' },
  location: { type: String, default: '' },
  website: { type: String, default: '' },
  logo: { type: String, default: '' },
  cinOrGst: { type: String, default: 'PENDING' },
  country: { type: String, default: 'United States' },
  isVerified: { type: Boolean, default: false },
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);
