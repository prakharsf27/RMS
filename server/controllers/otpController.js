const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const EmailVerification = require('../models/EmailVerification');
const emailService = require('../services/emailService');

// Generate cryptographically secure 6-digit OTP
const generateSecureOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// @desc    Send / Resend Email OTP
// @route   POST /api/auth/send-email-otp
// @access  Public or Private (supports req.user or req.body.email)
exports.sendEmailOTP = async (req, res) => {
  try {
    let email = req.user?.email || req.body.email;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'This email is already verified' });
    }

    // Check resend cooldown (60 seconds)
    const existing = await EmailVerification.findOne({ email });
    if (existing && existing.resendCooldownUntil && existing.resendCooldownUntil > Date.now()) {
      const waitSeconds = Math.ceil((existing.resendCooldownUntil - Date.now()) / 1000);
      return res.status(429).json({ 
        message: `Please wait ${waitSeconds} seconds before requesting a new code.`,
        cooldownRemaining: waitSeconds 
      });
    }

    // Generate new OTP & hash it
    const plainOtp = generateSecureOTP();
    const otpHash = await bcrypt.hash(plainOtp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const resendCooldownUntil = new Date(Date.now() + 60 * 1000); // 60 seconds

    // Invalidate any previous OTP records for this email
    await EmailVerification.deleteMany({ email });

    // Store secure hashed verification record
    await EmailVerification.create({
      userId: user._id,
      email,
      otpHash,
      expiresAt,
      attempts: 0,
      resendCooldownUntil
    });

    // Send transactional verification email
    await emailService.sendVerificationOTP({
      email: user.email,
      name: user.fname,
      otp: plainOtp
    });

    res.json({ 
      success: true, 
      message: 'Verification code sent to your email',
      cooldownSeconds: 60
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: error.message || 'Failed to send verification code' });
  }
};

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email-otp
// @access  Public or Private (supports req.user or req.body.email)
exports.verifyEmailOTP = async (req, res) => {
  const { otp } = req.body;
  let email = req.user?.email || req.body.email;

  if (!otp) {
    return res.status(400).json({ message: 'Please provide the 6-digit verification code' });
  }

  if (!email) {
    return res.status(400).json({ message: 'Email identifier is missing' });
  }
  email = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.json({ 
        success: true, 
        message: 'Email already verified', 
        emailVerified: true,
        onboardingCompleted: user.onboardingCompleted 
      });
    }

    // Find active verification record
    const verification = await EmailVerification.findOne({ email }).sort({ createdAt: -1 });

    if (!verification) {
      return res.status(400).json({ 
        message: 'No active verification code found. Please request a new code.' 
      });
    }

    // Check expiration
    if (new Date() > verification.expiresAt) {
      await EmailVerification.deleteMany({ email });
      return res.status(400).json({ 
        message: 'Verification code has expired. Please request a new one.' 
      });
    }

    // Check max attempts
    if (verification.attempts >= 5) {
      await EmailVerification.deleteMany({ email });
      return res.status(429).json({ 
        message: 'Too many incorrect attempts. For security, please request a new code.' 
      });
    }

    // Validate hash
    const isMatch = await bcrypt.compare(otp.trim(), verification.otpHash);
    if (!isMatch) {
      verification.attempts += 1;
      await verification.save();
      const remaining = 5 - verification.attempts;
      return res.status(400).json({ 
        message: `Incorrect verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Code invalidated.'}` 
      });
    }

    // Success: Mark user email verified
    user.emailVerified = true;
    user.isEmailVerified = true;
    // Calculate initial profile completion if starting
    if (!user.profileCompletion || user.profileCompletion < 20) {
      user.profileCompletion = 20;
    }
    await user.save();

    // Delete verification record after successful verification
    await EmailVerification.deleteMany({ email });

    // Send Welcome Email
    emailService.sendWelcomeEmail({
      email: user.email,
      name: user.fname,
      role: user.role
    }).catch(err => console.warn('Welcome email error:', err.message));

    res.json({
      success: true,
      message: 'Email verified successfully!',
      emailVerified: true,
      onboardingCompleted: user.onboardingCompleted,
      profileCompletion: user.profileCompletion,
      user: {
        _id: user._id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isDemoAccount: user.isDemoAccount,
        emailVerified: user.emailVerified,
        onboardingCompleted: user.onboardingCompleted,
        profileCompletion: user.profileCompletion
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: error.message || 'Verification failed' });
  }
};

// @desc    Send Phone OTP (Mock / Future Twilio hook)
exports.sendPhoneOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.phone) return res.status(400).json({ message: 'Please add a phone number first' });

    const otp = generateSecureOTP();
    user.phoneOTP = otp;
    user.phoneOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    res.json({ message: 'OTP sent to your phone' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Phone OTP
exports.verifyPhoneOTP = async (req, res) => {
  const { otp } = req.body;
  try {
    const user = await User.findById(req.user?._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.phoneOTP === otp && user.phoneOTPExpires > Date.now()) {
      user.isPhoneVerified = true;
      user.phoneOTP = undefined;
      user.phoneOTPExpires = undefined;
      await user.save();
      res.json({ message: 'Phone verified successfully', isPhoneVerified: true });
    } else {
      res.status(400).json({ message: 'Invalid or expired phone OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
