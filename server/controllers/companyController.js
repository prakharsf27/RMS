const Company = require('../models/Company');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().populate('recruiterId', 'fname lname email');
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recruiter's company
// @route   GET /api/companies/my
// @access  Private (Recruiter)
exports.getMyCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ recruiterId: req.user._id });
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create/Update company profile
// @route   POST /api/companies
// @access  Private (Recruiter)
exports.upsertCompany = async (req, res) => {
  const { name, description, industry, location, website, logo } = req.body;

  try {
    let company = await Company.findOne({ recruiterId: req.user._id });

    if (company) {
      // Update
      company.name = name || company.name;
      company.description = description || company.description;
      company.industry = industry || company.industry;
      company.location = location || company.location;
      company.website = website || company.website;
      company.logo = logo || company.logo;
    } else {
      // Create
      company = new Company({
        name,
        description,
        industry,
        location,
        website,
        logo,
        recruiterId: req.user._id
      });
    }

    const savedCompany = await company.save();
    res.status(201).json(savedCompany);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
