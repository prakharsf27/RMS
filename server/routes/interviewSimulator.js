const express = require('express');
const router = express.Router();
const { 
  startInterviewSession, 
  submitAnswer, 
  completeSession 
} = require('../controllers/interviewSimulatorController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/start', startInterviewSession);
router.post('/answer', submitAnswer);
router.post('/complete', completeSession);

module.exports = router;
