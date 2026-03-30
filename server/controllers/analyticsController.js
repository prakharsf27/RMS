const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const Interview = require('../models/Interview');

// @desc    Get dashboard analytics (Stats + Charts)
// @route   GET /api/analytics
// @access  Private (Admin/Recruiter)
exports.getStats = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'recruiter') {
        query.recruiterId = req.user._id;
    }

    const jobsCount = await Job.countDocuments(query);
    
    // For Applications, we filter by jobId if user is recruiter
    let appQuery = {};
    if (req.user.role === 'recruiter') {
        const recruiterJobs = await Job.find({ recruiterId: req.user._id }).select('_id');
        appQuery.jobId = { $in: recruiterJobs.map(j => j._id) };
    }
    const appsCount = await Application.countDocuments(appQuery);

    // Candidates: Recruiters see only those who applied to their jobs
    let candQuery = { role: 'candidate' };
    if (req.user.role === 'recruiter') {
        const applicants = await Application.find(appQuery).distinct('candidateId');
        candQuery._id = { $in: applicants };
    }
    const candidatesCount = await User.countDocuments(candQuery);
    
    const interviewsCount = await Interview.countDocuments(query);

    // Hired vs Rejected vs Applied (for Pie Chart)
    const statsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Applications by Department (for Bar Chart)
    const statsByDept = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      { $group: { _id: '$job.department', count: { $sum: 1 } } }
    ]);

    // Candidate Stats
    if (req.user.role === 'candidate') {
      const candidateId = req.user._id;
      const appliedCount = await Application.countDocuments({ candidateId });
      const offeredCount = await Application.countDocuments({ candidateId, status: 'offered' });
      const interviewsCount = await Interview.countDocuments({ candidateId });
      const userDoc = await User.findById(candidateId).select('profileViews');

      return res.json({
        summary: {
          applications: appliedCount,
          offers: offeredCount,
          interviews: interviewsCount,
          profileViews: userDoc?.profileViews || 0,
          jobs: await Job.countDocuments({ status: 'active' }) // Total open jobs for context
        }
      });
    }

    res.json({
      summary: {
        jobs: jobsCount,
        applications: appsCount,
        candidates: candidatesCount,
        interviews: interviewsCount
      },
      byStatus: statsByStatus,
      byDepartment: statsByDept
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
