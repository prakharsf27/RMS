const { 
  createInterviewSession, 
  evaluateAnswerAndNext, 
  generateDebriefReport 
} = require('../services/interviewEngine');

// In-memory active session store (keyed by sessionId)
const activeSessions = new Map();

// @desc    Start adaptive mock interview session
// @route   POST /api/interview-simulator/start
// @access  Private
exports.startInterviewSession = async (req, res) => {
  try {
    const { track, role, company, difficulty } = req.body;

    const session = createInterviewSession({
      track: track || 'fresher',
      role: role || 'Software Engineer',
      company,
      difficulty: difficulty || 'Medium',
      candidateProfile: req.user
    });

    activeSessions.set(session.sessionId, session);

    res.json({
      success: true,
      sessionId: session.sessionId,
      track: session.track,
      role: session.role,
      difficulty: session.difficulty,
      currentQuestion: session.currentQuestion
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ message: error.message || 'Failed to start interview session' });
  }
};

// @desc    Submit answer to current question and get next question
// @route   POST /api/interview-simulator/answer
// @access  Private
exports.submitAnswer = async (req, res) => {
  try {
    const { sessionId, answer } = req.body;

    let session = activeSessions.get(sessionId);
    if (!session) {
      // Re-create a session if timed out or refreshed
      session = createInterviewSession({
        track: 'fresher',
        candidateProfile: req.user
      });
      activeSessions.set(session.sessionId, session);
    }

    const currentQuestion = session.currentQuestion;
    const result = evaluateAnswerAndNext({
      session,
      candidateAnswer: answer,
      currentQuestion
    });

    // Update session state
    session.transcript = result.transcript;
    session.currentQuestionIndex = result.nextQuestionIndex;
    session.currentQuestion = result.nextQuestion;
    activeSessions.set(sessionId, session);

    res.json({
      success: true,
      isFinished: result.isFinished,
      lastEvaluation: result.lastEvaluation,
      nextQuestion: result.nextQuestion
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: error.message || 'Evaluation failed' });
  }
};

// @desc    Complete interview session and generate final debrief report
// @route   POST /api/interview-simulator/complete
// @access  Private
exports.completeSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    let session = activeSessions.get(sessionId);

    if (!session) {
      session = createInterviewSession({
        track: 'fresher',
        candidateProfile: req.user
      });
    }

    const report = generateDebriefReport(session);
    // Cleanup completed session
    activeSessions.delete(sessionId);

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Complete session error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate report' });
  }
};
