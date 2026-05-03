const User = require('../models/User');
const sendEmail = require('../config/emailService');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Send Email OTP
// @route   POST /api/auth/send-email-otp
// @access  Private
exports.sendEmailOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    user.emailOTP = otp;
    user.emailOTPExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Your Verification Code',
      type: 'OTP',
      data: { 
        message: `Your verification code is <strong>${otp}</strong>. It will expire in 10 minutes.`,
        name: user.fname
      }
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email-otp
// @access  Private
exports.verifyEmailOTP = async (req, res) => {
  const { otp } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.emailOTP === otp && user.emailOTPExpires > Date.now()) {
      user.isEmailVerified = true;
      user.emailOTP = undefined;
      user.emailOTPExpires = undefined;
      await user.save();
      res.json({ message: 'Email verified successfully', isEmailVerified: true });
    } else {
      res.status(400).json({ message: 'Invalid or expired OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send Phone OTP
// @route   POST /api/auth/send-phone-otp
// @access  Private
exports.sendPhoneOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.phone) return res.status(400).json({ message: 'Please add a phone number first' });

    const otp = generateOTP();
    user.phoneOTP = otp;
    user.phoneOTPExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    // MOCK SMS SENDING
    console.log(`\n[SMS MOCK] Sending OTP ${otp} to ${user.phone}\n`);
    
    // If you had Twilio, you'd do: 
    // await twilio.messages.create({ body: `Your code: ${otp}`, from: '...', to: user.phone });

    res.json({ message: 'OTP sent to your phone (Mocked in console)' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Phone OTP
// @route   POST /api/auth/verify-phone-otp
// @access  Private
exports.verifyPhoneOTP = async (req, res) => {
  const { otp } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.phoneOTP === otp && user.phoneOTPExpires > Date.now()) {
      user.isPhoneVerified = true;
      user.phoneOTP = undefined;
      user.phoneOTPExpires = undefined;
      await user.save();
      res.json({ message: 'Phone number verified successfully', isPhoneVerified: true });
    } else {
      res.status(400).json({ message: 'Invalid or expired OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
