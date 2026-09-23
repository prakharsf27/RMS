const Interview = require('../models/Interview');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Company = require('../models/Company');
const emailService = require('../services/emailService');

// @desc    Schedule interview
// @route   POST /api/interviews
// @access  Private (Recruiter/Admin)
exports.scheduleInterview = async (req, res) => {
  try {
    let { candidateId, candidateName, applicationId, jobTitle, date, time, type, location, notes, duration } = req.body;

    // 1. Resolve candidate user
    let candidateUser = null;
    if (candidateId) {
      candidateUser = await User.findById(candidateId);
      if (candidateUser && !candidateName) {
        candidateName = `${candidateUser.fname || ''} ${candidateUser.lname || ''}`.trim() || candidateUser.email;
      }
    }

    // 2. Resolve applicationId & jobTitle if not supplied
    if (candidateId && !applicationId) {
      try {
        const Application = require('../models/Application');
        const latestApp = await Application.findOne({ candidateId }).sort({ createdAt: -1 });
        if (latestApp) {
          applicationId = latestApp._id;
          if (!jobTitle && latestApp.jobId) {
            const Job = require('../models/Job');
            const job = await Job.findById(latestApp.jobId);
            if (job) jobTitle = job.title;
          }
        }
      } catch (e) {
        console.warn('Could not auto-resolve applicationId:', e.message);
      }
    }

    // 3. Create Interview in MongoDB
    const interview = await Interview.create({
      candidateId,
      candidateName: candidateName || 'Candidate',
      applicationId: applicationId || undefined,
      recruiterId: req.user._id,
      jobTitle: jobTitle || 'General Assessment',
      date: date || new Date(),
      time: time || '14:00',
      type: type || 'virtual',
      location: location || 'https://meet.google.com/talentflow-demo',
      notes: notes || ''
    });

    // 4. Resolve Recruiter & Company details
    const recruiter = req.user;
    const company = await Company.findOne({ recruiterId: recruiter._id });
    const companyName = company?.name || 'TalentFlow Partner';

    // 5. In-App Notifications
    if (interview.candidateId) {
      await Notification.create({
        userId: interview.candidateId,
        subject: `Interview Scheduled — ${interview.jobTitle}`,
        message: `An interview for "${interview.jobTitle}" at ${companyName} has been scheduled for ${new Date(interview.date).toLocaleDateString()} at ${interview.time}.`,
        sender: 'TalentFlow Recruitment'
      }).catch(err => console.warn('Notification create warning:', err.message));
    }

    if (recruiter._id) {
      await Notification.create({
        userId: recruiter._id,
        subject: `Interview Scheduled: ${candidateName}`,
        message: `You scheduled an interview with ${candidateName} for "${interview.jobTitle}" on ${new Date(interview.date).toLocaleDateString()} at ${interview.time}.`,
        sender: 'TalentFlow Recruitment'
      }).catch(err => console.warn('Notification create warning:', err.message));
    }

    // 6. Send Bidirectional Transactional Emails
    // A. Candidate Email
    if (candidateUser?.email) {
      emailService.sendInterviewScheduledToCandidate({
        email: candidateUser.email,
        candidateName,
        jobTitle: interview.jobTitle,
        companyName,
        interviewType: interview.type,
        date: interview.date,
        time: interview.time,
        duration: duration || '45 mins',
        interviewer: `${recruiter.fname || ''} ${recruiter.lname || ''}`.trim() || `${companyName} Hiring Team`,
        meetLink: interview.location,
        interviewId: interview._id,
        idempotencyKey: `int_sched_cand_${interview._id}`
      }).catch(err => console.warn('Candidate interview email error:', err.message));
    }

    // B. Recruiter Confirmation Email
    if (recruiter.email) {
      emailService.sendInterviewScheduledToRecruiter({
        email: recruiter.email,
        recruiterName: recruiter.fname || 'Hiring Manager',
        candidateName,
        jobTitle: interview.jobTitle,
        companyName,
        interviewType: interview.type,
        date: interview.date,
        time: interview.time,
        meetLink: interview.location,
        currentStage: 'Interview Scheduled',
        interviewId: interview._id,
        idempotencyKey: `int_sched_rec_${interview._id}`
      }).catch(err => console.warn('Recruiter interview email error:', err.message));
    }

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
    } else if (req.user.role === 'recruiter') {
      query.recruiterId = req.user._id;
    }

    const interviews = await Interview.find(query)
      .sort('date')
      .populate('candidateId', 'fname lname avatar email isDemoAccount')
      .populate('recruiterId', 'fname lname avatar email');

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update interview status/feedback & send bidirectional emails
// @route   PUT /api/interviews/:id
// @access  Private (Recruiter/Admin)
exports.updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidateId', 'fname lname email')
      .populate('recruiterId', 'fname lname email');

    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    // Check ownership
    if (req.user.role === 'recruiter' && interview.recruiterId?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this interview' });
    }

    const oldDate = interview.date;
    const oldTime = interview.time;
    const wasCancelled = req.body.status === 'cancelled';

    const updatedInterview = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('candidateId', 'fname lname email')
      .populate('recruiterId', 'fname lname email');

    const candidate = updatedInterview.candidateId;
    const recruiter = updatedInterview.recruiterId || req.user;
    const company = await Company.findOne({ recruiterId: recruiter._id });
    const companyName = company?.name || 'TalentFlow Partner';
    const candidateName = candidate ? `${candidate.fname || ''} ${candidate.lname || ''}`.trim() || 'Candidate' : updatedInterview.candidateName;
    const recruiterName = recruiter ? `${recruiter.fname || ''} ${recruiter.lname || ''}`.trim() || 'Hiring Manager' : 'Recruiter';

    if (wasCancelled) {
      // ─── CANCELLED FLOW ───
      // 1. In-app notifications
      if (candidate?._id) {
        await Notification.create({
          userId: candidate._id,
          subject: `Interview Cancelled — ${updatedInterview.jobTitle}`,
          message: `Your scheduled interview for ${updatedInterview.jobTitle} at ${companyName} has been cancelled.`,
          sender: 'TalentFlow System'
        }).catch(err => console.warn('Candidate cancel notification error:', err.message));
      }

      if (recruiter?._id) {
        await Notification.create({
          userId: recruiter._id,
          subject: `Interview Cancelled: ${candidateName}`,
          message: `The interview with ${candidateName} for ${updatedInterview.jobTitle} has been cancelled.`,
          sender: 'TalentFlow System'
        }).catch(err => console.warn('Recruiter cancel notification error:', err.message));
      }

      // 2. Transactional Emails
      if (candidate?.email) {
        emailService.sendInterviewCancelledToCandidate({
          email: candidate.email,
          candidateName,
          jobTitle: updatedInterview.jobTitle,
          companyName,
          date: oldDate,
          time: oldTime,
          reason: req.body?.reason || req.body?.feedback || 'Cancelled by hiring team',
          interviewId: updatedInterview._id,
          idempotencyKey: `int_can_cand_${updatedInterview._id}`
        }).catch(err => console.warn('Candidate cancel email error:', err.message));
      }

      if (recruiter?.email) {
        emailService.sendInterviewCancelledToRecruiter({
          email: recruiter.email,
          recruiterName,
          candidateName,
          jobTitle: updatedInterview.jobTitle,
          companyName,
          date: oldDate,
          time: oldTime,
          reason: req.body?.reason || 'Cancelled by hiring team',
          interviewId: updatedInterview._id,
          idempotencyKey: `int_can_rec_${updatedInterview._id}`
        }).catch(err => console.warn('Recruiter cancel email error:', err.message));
      }

    } else {
      // ─── RESCHEDULED / UPDATED FLOW ───
      // 1. In-app notifications
      if (candidate?._id) {
        await Notification.create({
          userId: candidate._id,
          subject: `Interview Rescheduled — ${updatedInterview.jobTitle}`,
          message: `Your interview for ${updatedInterview.jobTitle} has been rescheduled to ${new Date(updatedInterview.date).toLocaleDateString()} at ${updatedInterview.time}.`,
          sender: 'TalentFlow System'
        }).catch(err => console.warn('Candidate reschedule notification error:', err.message));
      }

      if (recruiter?._id) {
        await Notification.create({
          userId: recruiter._id,
          subject: `Interview Rescheduled: ${candidateName}`,
          message: `The interview with ${candidateName} for ${updatedInterview.jobTitle} is now set for ${new Date(updatedInterview.date).toLocaleDateString()} at ${updatedInterview.time}.`,
          sender: 'TalentFlow System'
        }).catch(err => console.warn('Recruiter reschedule notification error:', err.message));
      }

      // 2. Transactional Emails
      if (candidate?.email) {
        emailService.sendInterviewUpdatedToCandidate({
          email: candidate.email,
          candidateName,
          jobTitle: updatedInterview.jobTitle,
          companyName,
          oldDate,
          oldTime,
          newDate: updatedInterview.date,
          newTime: updatedInterview.time,
          meetLink: updatedInterview.location,
          interviewType: updatedInterview.type,
          interviewId: updatedInterview._id,
          idempotencyKey: `int_upd_cand_${updatedInterview._id}_${Date.now()}`
        }).catch(err => console.warn('Candidate reschedule email error:', err.message));
      }

      if (recruiter?.email) {
        emailService.sendInterviewUpdatedToRecruiter({
          email: recruiter.email,
          recruiterName,
          candidateName,
          jobTitle: updatedInterview.jobTitle,
          companyName,
          oldDate,
          oldTime,
          newDate: updatedInterview.date,
          newTime: updatedInterview.time,
          meetLink: updatedInterview.location,
          interviewType: updatedInterview.type,
          interviewId: updatedInterview._id,
          idempotencyKey: `int_upd_rec_${updatedInterview._id}_${Date.now()}`
        }).catch(err => console.warn('Recruiter reschedule email error:', err.message));
      }
    }

    res.json(updatedInterview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete interview (Cancelled)
// @route   DELETE /api/interviews/:id
// @access  Private (Recruiter/Admin)
exports.deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidateId', 'fname lname email')
      .populate('recruiterId', 'fname lname email');

    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    // Check ownership
    if (req.user.role === 'recruiter' && interview.recruiterId?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this interview' });
    }

    const candidate = interview.candidateId;
    const recruiter = interview.recruiterId || req.user;
    const company = await Company.findOne({ recruiterId: recruiter._id });
    const companyName = company?.name || 'TalentFlow Partner';
    const candidateName = candidate ? `${candidate.fname || ''} ${candidate.lname || ''}`.trim() || 'Candidate' : interview.candidateName;
    const recruiterName = recruiter ? `${recruiter.fname || ''} ${recruiter.lname || ''}`.trim() || 'Hiring Manager' : 'Recruiter';
    const reason = req.body?.reason || 'Cancelled by hiring team';

    // 1. In-app notifications
    if (candidate?._id) {
      await Notification.create({
        userId: candidate._id,
        subject: `Interview Cancelled — ${interview.jobTitle}`,
        message: `Your scheduled interview for ${interview.jobTitle} at ${companyName} has been cancelled.`,
        sender: 'TalentFlow System'
      }).catch(err => console.warn('Candidate cancel notification warning:', err.message));
    }

    if (recruiter?._id) {
      await Notification.create({
        userId: recruiter._id,
        subject: `Interview Cancelled: ${candidateName}`,
        message: `The interview with ${candidateName} for ${interview.jobTitle} was cancelled.`,
        sender: 'TalentFlow System'
      }).catch(err => console.warn('Recruiter cancel notification warning:', err.message));
    }

    // 2. Bidirectional Cancelled Emails
    if (candidate?.email) {
      emailService.sendInterviewCancelledToCandidate({
        email: candidate.email,
        candidateName,
        jobTitle: interview.jobTitle,
        companyName,
        date: interview.date,
        time: interview.time,
        reason,
        interviewId: interview._id,
        idempotencyKey: `int_del_cand_${interview._id}`
      }).catch(err => console.warn('Candidate cancel email warning:', err.message));
    }

    if (recruiter?.email) {
      emailService.sendInterviewCancelledToRecruiter({
        email: recruiter.email,
        recruiterName,
        candidateName,
        jobTitle: interview.jobTitle,
        companyName,
        date: interview.date,
        time: interview.time,
        reason,
        interviewId: interview._id,
        idempotencyKey: `int_del_rec_${interview._id}`
      }).catch(err => console.warn('Recruiter cancel email warning:', err.message));
    }

    await interview.deleteOne();
    res.json({ message: 'Interview removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
