const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../config/emailService');

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { fname, lname, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      fname,
      lname,
      email,
      password,
      role: role === 'admin' ? 'candidate' : (role || 'candidate'),
      avatar: `https://ui-avatars.com/api/?name=${fname}+${lname}&background=random`
    });

    if (user) {
      // Send Welcome Email
      sendEmail({
        email: user.email,
        type: 'WELCOME',
        data: { name: user.fname }
      });

      res.status(201).json({
        _id: user._id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register if you are new.' });
    }

    if (await user.matchPassword(password)) {
      if (user.status === 'suspended') {
        return res.status(403).json({ message: 'Account suspended. Contact support.' });
      }

      res.json({
        _id: user._id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all candidates
// @route   GET /api/auth/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    let query = { role: 'candidate' };
    
    // Privacy: Recruiters only see candidates who applied to their jobs
    if (req.user.role === 'recruiter') {
      const Application = require('../models/Application');
      const Job = require('../models/Job');
      
      const recruiterJobs = await Job.find({ recruiterId: req.user._id }).select('_id');
      const applicants = await Application.find({ jobId: { $in: recruiterJobs.map(j => j._id) } }).distinct('candidateId');
      query._id = { $in: applicants };
    }

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle user status (block/unblock)
// @route   PUT /api/auth/users/:id/status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending recruiters
// @route   GET /api/auth/pending-recruiters
// @access  Private (Admin)
exports.getPendingRecruiters = async (req, res) => {
  try {
    const users = await User.find({ role: 'recruiter', status: 'suspended' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve recruiter
// @route   PUT /api/auth/approve-recruiter/:id
// @access  Private (Admin)
exports.approveRecruiter = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = 'active';
    await user.save();
    res.json({ message: 'Recruiter approved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.fname = req.body.fname || user.fname;
    user.lname = req.body.lname || user.lname;
    user.email = req.body.email || user.email;
    user.bio = req.body.bio || user.bio;
    user.dob = req.body.dob || user.dob;
    user.phone = req.body.phone || user.phone;
    user.experienceLevel = req.body.experienceLevel || user.experienceLevel;
    user.yearsOfExperience = req.body.yearsOfExperience || user.yearsOfExperience;

    if (req.body.password) {
      user.password = req.body.password;
    }

    // Handle File Uploads
    if (req.files) {
      if (req.files.avatar) {
        user.avatar = `/uploads/avatars/${req.files.avatar[0].filename}`;
      }
      if (req.files.resume) {
        user.resume = `/uploads/resumes/${req.files.resume[0].filename}`;
      }
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      fname: updatedUser.fname,
      lname: updatedUser.lname,
      email: updatedUser.email,
      bio: updatedUser.bio,
      dob: updatedUser.dob,
      phone: updatedUser.phone,
      experienceLevel: updatedUser.experienceLevel,
      yearsOfExperience: updatedUser.yearsOfExperience,
      isEmailVerified: updatedUser.isEmailVerified,
      isPhoneVerified: updatedUser.isPhoneVerified,
      hiringStatus: updatedUser.hiringStatus,
      resume: updatedUser.resume,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Bulk user status toggle
// @route   PUT /api/auth/users/bulk/status
// @access  Private (Admin)
exports.bulkUserStatus = async (req, res) => {
  try {
    const { ids, status } = req.body; // status: 'suspended' or 'active'
    await User.updateMany({ _id: { $in: ids } }, { status });
    res.json({ message: `Successfully updated ${ids.length} users` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk delete users
// @route   DELETE /api/auth/users/bulk/delete
// @access  Private (Admin)
exports.bulkUserDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    await User.deleteMany({ _id: { $in: ids } });
    res.json({ message: `Successfully deleted ${ids.length} users` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
