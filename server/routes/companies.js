const express = require('express');
const router = express.Router();
const { getCompanies, getMyCompany, upsertCompany } = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getCompanies);
router.get('/my', protect, authorize('recruiter'), getMyCompany);
router.post('/', protect, authorize('recruiter'), upsertCompany);

module.exports = router;
