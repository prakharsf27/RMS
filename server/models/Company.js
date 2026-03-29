const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  industry: { type: String },
  location: { type: String },
  website: { type: String },
  logo: { type: String },
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);
