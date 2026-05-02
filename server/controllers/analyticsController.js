const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const Interview = require('../models/Interview');
const AuditLog = require('../models/AuditLog');
const Message = require('../models/Message');

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

    // Activity Feed
    const activities = await AuditLog.find({ userId: req.user._id })
      .sort('-createdAt')
      .limit(5);

    // Unread Messages
    const unreadMessages = await Message.countDocuments({ receiverId: req.user._id, read: false });

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

    // Applications by Month (for Chart)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const statsByMonth = await Application.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format for frontend
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        
        const monthStats = statsByMonth.filter(s => s._id.month === m && s._id.year === y);
        chartData.push({
            month: monthNames[m - 1],
            Applications: monthStats.reduce((acc, curr) => acc + curr.count, 0),
            Interviews: monthStats.filter(s => s._id.status === 'interviewing').reduce((acc, curr) => acc + curr.count, 0),
            Hired: monthStats.filter(s => s._id.status === 'offered').reduce((acc, curr) => acc + curr.count, 0)
        });
    }

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
          jobs: await Job.countDocuments({ status: 'active' }),
          unreadMessages
        },
        chartData,
        activities
      });
    }

    const pendingVerifications = req.user.role === 'admin' ? await (require('../models/Company')).countDocuments({ isVerified: false }) : 0;
    
    res.json({
      summary: {
        jobs: jobsCount,
        applications: appsCount,
        candidates: candidatesCount,
        interviews: interviewsCount,
        unreadMessages,
        pendingVerifications
      },
      byStatus: statsByStatus,
      byDepartment: statsByDept,
      chartData,
      activities
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get public global platform stats
// @route   GET /api/analytics/global
// @access  Public
exports.getGlobalStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'candidate' });
        const totalApps = await Application.countDocuments();
        const totalInterviews = await Interview.countDocuments();
        
        res.json({
            users: totalUsers, 
            applications: totalApps,
            interviews: totalInterviews,
            successRate: totalApps > 0 ? Math.round((totalInterviews / totalApps) * 100) : 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
