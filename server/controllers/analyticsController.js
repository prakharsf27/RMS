const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const Interview = require('../models/Interview');

// @desc    Get dashboard analytics (Stats + Charts)
// @route   GET /api/analytics
// @access  Private (Admin/Recruiter)
exports.getStats = async (req, res) => {
  try {
    const jobsCount = await Job.countDocuments();
    const appsCount = await Application.countDocuments();
    const candidatesCount = await User.countDocuments({ role: 'candidate' });
    const interviewsCount = await Interview.countDocuments();

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
          remoteField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      { $group: { _id: '$job.department', count: { $sum: 1 } } }
    ]);

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
