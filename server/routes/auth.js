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

router.post('/register', register);
router.post('/login', login);
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

// Admin Routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/bulk/status', protect, authorize('admin'), bulkUserStatus);
router.delete('/users/bulk/delete', protect, authorize('admin'), bulkUserDelete);
router.put('/users/:id/status', protect, authorize('admin'), toggleUserStatus);
router.get('/pending-recruiters', protect, authorize('admin'), getPendingRecruiters);
router.put('/approve-recruiter/:id', protect, authorize('admin'), approveRecruiter);

module.exports = router;
