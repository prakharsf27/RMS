const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const Company = require('../models/Company');
const { cloudinary } = require('../config/cloudinary');
const sendEmail = require('../config/emailService');
const mongoose = require('mongoose');

// Utility to calculate match score based on simple keyword matching
const calculateMatchScore = (jobRequirements, userBio = "") => {
  if (!jobRequirements || jobRequirements.length === 0) return 75; // Baseline
  
  const bioWords = userBio.toLowerCase().split(/\W+/);
  let matches = 0;
  
  jobRequirements.forEach(req => {
    if (bioWords.includes(req.toLowerCase())) {
      matches++;
    }
  });

  return Math.round((matches / jobRequirements.length) * 100);
};

// @desc    Apply for a job with resume upload
// @route   POST /api/applications
// @access  Private (Candidate)
exports.applyForJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    
    // Resume URL: from Cloudinary upload OR from direct link provided by candidate
    const resumeUrl = req.file?.path || req.body.resumeUrl || null;

    const job = await Job.findById(jobId).populate('recruiterId');
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const existingApp = await Application.findOne({ jobId, candidateId: req.user._id });
    if (existingApp) {
      return res.status(400).json({ message: 'Already applied for this position' });
    }

    // Calculate match score based on user bio and job requirements
    const matchScore = calculateMatchScore(job.requirements, req.user.bio);

    // 1. Create Application in MongoDB
    const application = await Application.create({
      jobId,
      candidateId: req.user._id,
      resumeUrl,
      matchScore
    });

    // 2. Update job applicant count
    job.applicantsCount = (job.applicantsCount || 0) + 1;
    await job.save();

    // 3. Resolve Recruiter & Company info
    const emailService = require('../services/emailService');
    const User = require('../models/User');
    let recruiter = job.recruiterId;
    if (recruiter && !recruiter.email) {
      recruiter = await User.findById(job.recruiterId);
    }

    const company = recruiter ? await Company.findOne({ recruiterId: recruiter._id }) : null;
    const companyName = company?.name || job.company?.name || 'TalentFlow Partner';
    const candidateName = `${req.user.fname || ''} ${req.user.lname || ''}`.trim() || 'Candidate';

    // 4. Create Notification for Candidate
    await Notification.create({
      userId: req.user._id,
      subject: 'Application Submitted',
      message: `Your application for "${job.title}" at ${companyName} has been submitted successfully.`,
      sender: 'TalentFlow Recruitment'
    }).catch(err => console.warn('Candidate notification warning:', err.message));

    // 5. Create Notification for Recruiter
    if (recruiter?._id) {
      await Notification.create({
        userId: recruiter._id,
        subject: 'New Talent Applied',
        message: `${candidateName} applied for your "${job.title}" position.`,
        sender: 'TalentFlow Recruitment'
      }).catch(err => console.warn('Recruiter notification warning:', err.message));
    }

    // 6. Send Confirmation Email to Candidate
    emailService.sendApplicationSubmittedToCandidate({
      email: req.user.email,
      candidateName,
      jobTitle: job.title,
      companyName,
      status: 'Applied',
      appliedDate: application.appliedAt || new Date(),
      applicationId: application._id,
      idempotencyKey: `app_sub_cand_${application._id}`
    }).catch(err => console.warn('Candidate application email error:', err.message));

    // 7. Send New Application Notification Email to Recruiter
    if (recruiter?.email) {
      emailService.sendNewApplicationToRecruiter({
        email: recruiter.email,
        recruiterName: recruiter.fname || 'Hiring Manager',
        candidateName,
        candidateEmail: req.user.email,
        jobTitle: job.title,
        companyName,
        matchScore,
        status: 'Applied',
        candidateId: req.user._id,
        applicationId: application._id,
        idempotencyKey: `app_sub_rec_${application._id}`
      }).catch(err => console.warn('Recruiter application email error:', err.message));
    }

    // 8. Automated Recruiter Welcome Message
    const autoMessage = `Hello ${req.user.fname},

Thank you for applying to "${job.title}". 
We will be reviewing your application and get back to you soon.

This is an automated message.

About ${company?.name || 'the company'}:
${company?.description || 'Leading innovation in the industry.'}

Visit us: ${company?.website || 'N/A'}`;

    if (recruiter?._id) {
      await Message.create({
        senderId: recruiter._id,
        receiverId: req.user._id,
        content: autoMessage
      }).catch(err => console.warn('Auto-message warning:', err.message));
    }

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all applications (with population)
// @route   GET /api/applications
// @access  Private (Admin/Recruiter see all, Candidate see own)
exports.getApplications = async (req, res) => {
  try {
    const match = {};
    if (req.user.role === 'candidate') {
      match.candidateId = new mongoose.Types.ObjectId(req.user._id);
    }

    if (req.user.role === 'recruiter') {
      const recruiterJobs = await Job.find({ recruiterId: req.user._id }).select('_id');
      match.jobId = { $in: recruiterJobs.map(j => new mongoose.Types.ObjectId(j._id)) };
    }

    const applications = await Application.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      // Join with Job
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      // Join with Candidate (User)
      {
        $lookup: {
          from: 'users',
          localField: 'candidateId',
          foreignField: '_id',
          as: 'candidate'
        }
      },
      { $unwind: '$candidate' },
      // Join with Company matching recruiterId of the job
      {
        $lookup: {
          from: 'companies',
          localField: 'job.recruiterId',
          foreignField: 'recruiterId',
          as: 'company'
        }
      },
      { 
        $addFields: { 
          jobId: {
            $mergeObjects: [
              "$job",
              { company: { $ifNull: [{ $arrayElemAt: ['$company', 0] }, null] } }
            ]
          },
          candidateId: '$candidate'
        } 
      },
      {
        $project: {
          job: 0,
          candidate: 0,
          company: 0,
          'candidateId.password': 0
        }
      }
    ]);

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application status & send bidirectional notifications & emails
// @route   PUT /api/applications/:id
// @access  Private (Admin/Recruiter)
exports.updateStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate('candidateId', 'fname lname email avatar isDemoAccount');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    const previousStatus = application.status || 'applied';
    application.status = status;
    await application.save();

    // 1. Resolve Job, Recruiter, Company and Candidate details
    const emailService = require('../services/emailService');
    const User = require('../models/User');
    const job = application.jobId;
    let recruiter = null;
    if (job?.recruiterId) {
      recruiter = await User.findById(job.recruiterId);
    }
    const company = recruiter ? await Company.findOne({ recruiterId: recruiter._id }) : null;
    const companyName = company?.name || job?.company?.name || 'TalentFlow Partner';
    const jobTitle = job?.title || 'Engineering Role';
    const candidate = application.candidateId;
    const candidateName = candidate ? `${candidate.fname || ''} ${candidate.lname || ''}`.trim() || 'Candidate' : 'Candidate';
    const updatedByName = req.user ? `${req.user.fname || ''} ${req.user.lname || ''}`.trim() || 'Recruiter' : 'Hiring Team';

    // 2. Candidate In-App Notification
    if (candidate?._id) {
      await Notification.create({
        userId: candidate._id,
        subject: `Application update: ${status}`,
        message: `Your application for "${jobTitle}" at ${companyName} has moved from ${previousStatus} to ${status}.`,
        sender: 'TalentFlow Recruitment'
      }).catch(err => console.warn('Candidate status notification warning:', err.message));
    }

    // 3. Recruiter In-App Notification
    if (recruiter?._id) {
      await Notification.create({
        userId: recruiter._id,
        subject: `Application Status Updated: ${candidateName}`,
        message: `The application for ${candidateName} (${jobTitle}) was updated from ${previousStatus} to ${status} by ${updatedByName}.`,
        sender: 'TalentFlow Recruitment'
      }).catch(err => console.warn('Recruiter status notification warning:', err.message));
    }

    // 4. Candidate Email
    if (candidate?.email) {
      emailService.sendApplicationStatusUpdatedToCandidate({
        email: candidate.email,
        candidateName,
        jobTitle,
        companyName,
        previousStatus,
        newStatus: status,
        updatedDate: new Date(),
        notes,
        applicationId: application._id,
        idempotencyKey: `app_status_cand_${application._id}_${status}`
      }).catch(err => console.warn('Candidate status email error:', err.message));
    }

    // 5. Recruiter Confirmation Email
    if (recruiter?.email) {
      emailService.sendApplicationStatusUpdatedToRecruiter({
        email: recruiter.email,
        recruiterName: recruiter.fname || 'Hiring Manager',
        candidateName,
        jobTitle,
        companyName,
        previousStatus,
        newStatus: status,
        updatedBy: updatedByName,
        applicationId: application._id,
        idempotencyKey: `app_status_rec_${application._id}_${status}`
      }).catch(err => console.warn('Recruiter status email error:', err.message));
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk update application status
// @route   PUT /api/applications/bulk/status
// @access  Private (Admin/Recruiter)
exports.bulkStatusUpdate = async (req, res) => {
  try {
    const { ids, status } = req.body;
    await Application.updateMany({ _id: { $in: ids } }, { status });
    res.json({ message: `Successfully updated ${ids.length} applications` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk delete applications
// @route   DELETE /api/applications/bulk/delete
// @access  Private (Admin)
exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    await Application.deleteMany({ _id: { $in: ids } });
    res.json({ message: `Successfully deleted ${ids.length} applications` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private (Admin)
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    await application.deleteOne();
    res.json({ message: 'Application removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
