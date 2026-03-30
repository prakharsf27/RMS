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
  bulkUserDelete
} = require('../controllers/authController');
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

// Admin Routes
router.get('/users', protect, authorize('admin', 'recruiter'), getAllUsers);
router.put('/users/bulk/status', protect, authorize('admin'), bulkUserStatus);
router.delete('/users/bulk/delete', protect, authorize('admin'), bulkUserDelete);
router.put('/users/:id/status', protect, authorize('admin'), toggleUserStatus);
router.get('/pending-recruiters', protect, authorize('admin'), getPendingRecruiters);
router.put('/approve-recruiter/:id', protect, authorize('admin'), approveRecruiter);

module.exports = router;
