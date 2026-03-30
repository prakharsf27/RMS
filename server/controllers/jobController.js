const Job = require('../models/Job');

// @desc    Get all jobs with search, filters, and pagination
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      department, 
      location, 
      type, 
      sort = '-createdAt' 
    } = req.query;

    const query = {};

    // Search by title or department
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by department
    if (department && department !== 'all') {
      query.department = department;
    }

    // Filter by location
    if (location && location !== 'all') {
      query.location = location;
    }

    // Filter by type
    if (type && type !== 'all') {
      query.type = type;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Use aggregation to join with Company
    const pipeline = [
      { $match: query },
      { $sort: { [sort.startsWith('-') ? sort.substring(1) : sort]: sort.startsWith('-') ? -1 : 1 } },
      { $skip: skip },
      { $limit: Number(limit) },
      // Join with User (recruiter)
      {
        $lookup: {
          from: 'users',
          localField: 'recruiterId',
          foreignField: '_id',
          as: 'recruiter'
        }
      },
      { $unwind: '$recruiter' },
      // Join with Company
      {
        $lookup: {
          from: 'companies',
          localField: 'recruiterId',
          foreignField: 'recruiterId',
          as: 'company'
        }
      },
      { 
        $addFields: { 
          company: { $ifNull: [{ $arrayElemAt: ['$company', 0] }, null] } 
        } 
      },
      {
        $project: {
          'recruiter.password': 0,
          'recruiter.role': 0
        }
      }
    ];

    const [jobs, totalDocs] = await Promise.all([
      Job.aggregate(pipeline),
      Job.countDocuments(query)
    ]);

    res.json({
      jobs,
      page: Number(page),
      pages: Math.ceil(totalDocs / limit),
      total: totalDocs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Recruiter/Admin)
exports.createJob = async (req, res) => {
  const { title, department, location, type, salary, description, requirements } = req.body;

  try {
    const job = await Job.create({
      title,
      department,
      location,
      type,
      salary,
      description,
      requirements,
      recruiterId: req.user._id
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter/Admin)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (job) {
      // Check ownership
      if (job.recruiterId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'User not authorized to update this job' });
      }

      const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedJob);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter/Admin)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (job) {
      // Check ownership
      if (job.recruiterId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'User not authorized to delete this job' });
      }

      await job.deleteOne();
      res.json({ message: 'Job removed' });
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
