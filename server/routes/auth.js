const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  getAllUsers, 
  toggleUserStatus, 
  getPendingRecruiters, 
  approveRecruiter,
  updateProfile,
  bulkUserStatus,
  bulkUserDelete,
  getUserById,
  toggleEngaged
} = require('../controllers/authController');

const {
  sendEmailOTP,
  verifyEmailOTP,
  sendPhoneOTP,
  verifyPhoneOTP
} = require('../controllers/otpController');


const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', register);
router.post('/login', login);
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
  ]), updateProfile);

// OTP Verification Routes
router.post('/send-email-otp', protect, sendEmailOTP);
router.post('/verify-email-otp', protect, verifyEmailOTP);
router.post('/send-phone-otp', protect, sendPhoneOTP);
router.post('/verify-phone-otp', protect, verifyPhoneOTP);

// Admin Routes
router.get('/users', protect, authorize('admin', 'recruiter'), getAllUsers);
router.put('/users/bulk/status', protect, authorize('admin'), bulkUserStatus);
router.delete('/users/bulk/delete', protect, authorize('admin'), bulkUserDelete);
router.get('/users/:id', protect, getUserById);
router.put('/users/:id/status', protect, authorize('admin'), toggleUserStatus);
router.put('/users/:id/engaged', protect, authorize('admin', 'recruiter'), toggleEngaged);


router.get('/pending-recruiters', protect, authorize('admin'), getPendingRecruiters);
router.put('/approve-recruiter/:id', protect, authorize('admin'), approveRecruiter);
router.put('/users/:id', protect, authorize('admin'), require('../controllers/authController').updateUserAdmin);

module.exports = router;
