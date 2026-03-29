const Interview = require('../models/Interview');
const Notification = require('../models/Notification');

// @desc    Schedule interview
// @route   POST /api/interviews
// @access  Private (Recruiter/Admin)
exports.scheduleInterview = async (req, res) => {
  try {
    const interview = await Interview.create({
      ...req.body,
      recruiterId: req.user._id
    });

    // Notify candidate
    await Notification.create({
        userId: interview.candidateId,
        subject: 'Interview Scheduled',
        message: `A new interview for the ${interview.jobTitle} position has been scheduled.`,
        sender: 'TalentFlow System'
    });

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get interviews
// @route   GET /api/interviews
// @access  Private (Candidate see own, Recruiter/Admin see all)
exports.getInterviews = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'candidate') {
      query.candidateId = req.user._id;
    }

    const interviews = await Interview.find(query)
      .sort('date')
      .populate('candidateId', 'fname lname avatar email')
      .populate('recruiterId', 'fname lname avatar');

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update interview status/feedback
// @route   PUT /api/interviews/:id
// @access  Private (Recruiter/Admin)
exports.updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete interview
// @route   DELETE /api/interviews/:id
// @access  Private (Recruiter/Admin)
exports.deleteInterview = async (req, res) => {
  try {
    await Interview.findByIdAndDelete(req.params.id);
    res.json({ message: 'Interview removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
