const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EmailVerification = require('../models/EmailVerification');
const emailService = require('../services/emailService');

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
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // New user starts with real user settings (never demo data)
    const user = await User.create({
      fname: fname.trim(),
      lname: lname.trim(),
      email: normalizedEmail,
      password,
      role: role === 'admin' ? 'candidate' : (role || 'candidate'), // Admin not publicly creatable
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fname)}+${encodeURIComponent(lname)}&background=random`,
      isDemoAccount: false,
      emailVerified: false,
      isEmailVerified: false,
      onboardingCompleted: false,
      profileCompletion: 15
    });

    if (user) {
      // 1. Generate cryptographically secure 6-digit OTP
      const plainOtp = crypto.randomInt(100000, 1000000).toString();
      const otpHash = await bcrypt.hash(plainOtp, 10);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // 2. Invalidate any prior records and save hashed OTP
      await EmailVerification.deleteMany({ email: user.email });
      await EmailVerification.create({
        userId: user._id,
        email: user.email,
        otpHash,
        expiresAt,
        attempts: 0,
        resendCooldownUntil: new Date(Date.now() + 60 * 1000)
      });

      // 3. Send Transactional Verification OTP
      emailService.sendVerificationOTP({
        email: user.email,
        name: user.fname,
        otp: plainOtp
      }).catch(err => console.warn('Verification email dispatch error:', err.message));

      res.status(201).json({
        _id: user._id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        profileImageUrl: user.avatar,
        isDemoAccount: false,
        emailVerified: false,
        onboardingCompleted: false,
        profileCompletion: 15,
        emailVerificationSent: true,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    const user = await User.findOne({ email: normalizedEmail });

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
        profileImageUrl: user.profileImageUrl || user.avatar,
        isDemoAccount: !!user.isDemoAccount,
        emailVerified: !!user.emailVerified,
        onboardingCompleted: !!user.onboardingCompleted,
        profileCompletion: user.profileCompletion || (user.isDemoAccount ? 100 : 0),
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
    let query = {};
    
    if (req.user.role === 'admin') {
      // Admin sees everyone by default, can filter by role via query param if needed
      if (req.query.role) query.role = req.query.role;
    } else {
      query.role = 'candidate';
      // Privacy: Recruiters only see candidates who applied to their jobs
      if (req.user.role === 'recruiter') {
        const Application = require('../models/Application');
        const Job = require('../models/Job');
        
        const recruiterJobs = await Job.find({ recruiterId: req.user._id }).select('_id');
        const applicants = await Application.find({ jobId: { $in: recruiterJobs.map(j => j._id) } }).distinct('candidateId');
        query._id = { $in: applicants };
      }
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

// @desc    Get user by ID
// @route   GET /api/auth/users/:id
// @access  Private (Admin/Recruiter)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle candidate's engaged status
// @route   PUT /api/auth/users/:id/engaged
// @access  Private (Recruiter/Admin)
exports.toggleEngaged = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isEngaged: !user.isEngaged } },
      { new: true }
    );
    res.json(updatedUser);
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
// Calculate real profile completion percentage
const calculateProfileCompletion = (user) => {
  if (user.isDemoAccount) return 100;
  let score = 20; // Base registered & email verified

  if (user.role === 'recruiter') {
    if (user.phone) score += 15;
    if (user.professionalHeadline || user.bio) score += 15;
    if (user.address || user.state) score += 10;
    if (user.avatar && !user.avatar.includes('ui-avatars.com')) score += 15;
    if (user.onboardingCompleted) score = Math.max(score, 100);
    return Math.min(100, score);
  }

  // Candidate
  if (user.phone) score += 10;
  if (user.professionalHeadline || user.careerObjective) score += 10;
  if (user.skills && user.skills.length >= 3) score += 15;
  if (user.education && user.education.length > 0) score += 15;
  if ((user.workExperience && user.workExperience.length > 0) || (user.projects && user.projects.length > 0)) score += 15;
  if (user.resume) score += 10;
  if (user.avatar && !user.avatar.includes('ui-avatars.com')) score += 5;
  return Math.min(100, score);
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

    // Professional Identity
    user.professionalHeadline = req.body.professionalHeadline || user.professionalHeadline;
    user.careerObjective = req.body.careerObjective || user.careerObjective;
    
    if (req.body.links) {
        user.links = typeof req.body.links === 'string' ? JSON.parse(req.body.links) : req.body.links;
    }
    
    // Arrays and complex objects
    if (req.body.workExperience) {
        user.workExperience = typeof req.body.workExperience === 'string' ? JSON.parse(req.body.workExperience) : req.body.workExperience;
    }
    if (req.body.education) {
        user.education = typeof req.body.education === 'string' ? JSON.parse(req.body.education) : req.body.education;
    }
    if (req.body.certifications) {
        user.certifications = typeof req.body.certifications === 'string' ? JSON.parse(req.body.certifications) : req.body.certifications;
    }
    if (req.body.projects) {
        user.projects = typeof req.body.projects === 'string' ? JSON.parse(req.body.projects) : req.body.projects;
    }
    if (req.body.languages) {
        user.languages = typeof req.body.languages === 'string' ? JSON.parse(req.body.languages) : req.body.languages;
    }
    if (req.body.jobPreferences) {
        user.jobPreferences = typeof req.body.jobPreferences === 'string' ? JSON.parse(req.body.jobPreferences) : req.body.jobPreferences;
    }
    if (req.body.references) {
        user.references = typeof req.body.references === 'string' ? JSON.parse(req.body.references) : req.body.references;
    }
    if (req.body.skills) {
        user.skills = typeof req.body.skills === 'string' ? JSON.parse(req.body.skills) : req.body.skills;
    }

    // Identity Fields
    user.gender = req.body.gender || user.gender;
    user.nationality = req.body.nationality || user.nationality;
    user.pan = req.body.pan || user.pan;
    user.address = req.body.address || user.address;
    user.state = req.body.state || user.state;

    if (req.body.password) {
      user.password = req.body.password;
    }

    // Handle File Uploads
    if (req.files) {
      if (req.files.avatar) {
        user.avatar = req.files.avatar[0].path.startsWith('http') 
          ? req.files.avatar[0].path 
          : `/uploads/avatars/${req.files.avatar[0].filename}`;
        user.profileImageUrl = user.avatar;
      }
      if (req.files.resume) {
        user.resume = req.files.resume[0].path.startsWith('http') 
          ? req.files.resume[0].path 
          : `/uploads/resumes/${req.files.resume[0].filename}`;
      }
    }

    user.profileCompletion = calculateProfileCompletion(user);
    const updatedUser = await user.save();

    res.json({
      ...updatedUser.toObject(),
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Upload profile photo
// @route   POST /api/auth/upload-avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!req.file) {
      return res.status(400).json({ message: 'Please select an image file (PNG, JPG, or WEBP)' });
    }

    const avatarUrl = req.file.path.startsWith('http') 
      ? req.file.path 
      : `/uploads/avatars/${req.file.filename}`;

    user.avatar = avatarUrl;
    user.profileImageUrl = avatarUrl;
    user.profileCompletion = calculateProfileCompletion(user);
    await user.save();

    res.json({
      success: true,
      message: 'Profile photo updated successfully',
      avatar: avatarUrl,
      profileImageUrl: avatarUrl,
      profileCompletion: user.profileCompletion
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Avatar upload failed' });
  }
};

// @desc    Remove profile photo
// @route   DELETE /api/auth/upload-avatar
// @access  Private
exports.removeAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fname)}+${encodeURIComponent(user.lname)}&background=random`;
    user.avatar = defaultAvatar;
    user.profileImageUrl = '';
    user.profileCompletion = calculateProfileCompletion(user);
    await user.save();

    res.json({
      success: true,
      message: 'Profile photo removed',
      avatar: defaultAvatar,
      profileImageUrl: '',
      profileCompletion: user.profileCompletion
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete profile onboarding
// @route   POST /api/auth/complete-onboarding
// @access  Private
exports.completeOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Validate required identity
    if (!user.fname || !user.lname || !user.email) {
      return res.status(400).json({ message: 'Required identity fields are incomplete' });
    }

    user.onboardingCompleted = true;
    user.profileCompletion = Math.max(85, calculateProfileCompletion(user));
    await user.save();

    res.json({
      success: true,
      message: 'Onboarding completed successfully!',
      user: {
        _id: user._id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        profileImageUrl: user.profileImageUrl || user.avatar,
        isDemoAccount: !!user.isDemoAccount,
        emailVerified: !!user.emailVerified,
        onboardingCompleted: true,
        profileCompletion: user.profileCompletion,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to complete onboarding' });
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
// @desc    Update user profile (Admin override)
// @route   PUT /api/auth/users/:id
// @access  Private (Admin)
exports.updateUserAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.fname = req.body.fname || user.fname;
    user.lname = req.body.lname || user.lname;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.status = req.body.status || user.status;
    user.bio = req.body.bio || user.bio;
    user.experienceLevel = req.body.experienceLevel || user.experienceLevel;
    user.yearsOfExperience = req.body.yearsOfExperience || user.yearsOfExperience;
    user.hiringStatus = req.body.hiringStatus || user.hiringStatus;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
