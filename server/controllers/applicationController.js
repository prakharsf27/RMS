const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const { cloudinary } = require('../config/cloudinary');

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

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const existingApp = await Application.findOne({ jobId, candidateId: req.user._id });
    if (existingApp) {
      return res.status(400).json({ message: 'Already applied for this position' });
    }

    // Calculate match score based on user bio and job requirements
    const matchScore = calculateMatchScore(job.requirements, req.user.bio);

    const application = await Application.create({
      jobId,
      candidateId: req.user._id,
      resumeUrl,
      matchScore
    });

    // Update job applicant count
    job.applicantsCount += 1;
    await job.save();

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
    let query = {};
    if (req.user.role === 'candidate') {
      query.candidateId = req.user._id;
    }

    const applications = await Application.find(query)
      .populate('jobId', 'title department location')
      .populate('candidateId', 'fname lname email avatar bio')
      .sort('-createdAt');

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application status & send notification
// @route   PUT /api/applications/:id
// @access  Private (Admin/Recruiter)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id)
        .populate('jobId', 'title')
        .populate('candidateId', 'fname email');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.status = status;
    await application.save();

    // Trigger Notification
    const subject = status === 'offered' ? 'You have been Hired!' : 'Update on your application';
    const message = status === 'offered' 
        ? `Congratulations ${application.candidateId.fname}! You have been offered the ${application.jobId.title} position.`
        : `Thank you for your interest in the ${application.jobId.title} role. We will not be moving forward at this time.`;

    await Notification.create({
        userId: application.candidateId._id,
        subject,
        message,
        sender: 'TalentFlow Recruitment'
    });

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
