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

    // Filter by recruiter if 'myJobs' is specified or as default for recruiters on certain pages
    if (req.query.myJobs === 'true' && req.user && req.user.role === 'recruiter') {
      query.recruiterId = req.user._id;
    }

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

// @desc    Get recommended jobs for candidate
// @route   GET /api/jobs/recommended
// @access  Private (Candidate)
exports.getRecommendedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('skills');
    const userSkills = user?.skills || [];
    
    // Find active jobs
    const jobs = await Job.find({ status: 'active' })
      .populate('recruiterId', 'fname lname email')
      .limit(10);
      
    // Join with Company matching recruiterId
    const jobsWithCompany = await Promise.all(jobs.map(async (job) => {
      const Company = require('../models/Company');
      const company = await Company.findOne({ recruiterId: job.recruiterId._id });
      return { ...job.toObject(), company };
    }));
    
    // Mock Match Score calculation
    const recommendedJobs = jobsWithCompany.map(job => {
      let matchCount = 0;
      const jobReqs = (job.requirements || []).map(r => r.toLowerCase());
      
      userSkills.forEach(skill => {
        if (jobReqs.some(req => req.includes(skill.toLowerCase()))) {
          matchCount++;
        }
      });
      
      // Artificial boost based on department/title match
      let score = 70 + (matchCount * 5); // baseline 70%
      if (score > 98) score = 98; // cap at 98%
      
      // If no skills match, assign a varied score between 65-80
      if (matchCount === 0) {
        const randomBonus = (job._id.toString().charCodeAt(0) % 15);
        score = 65 + randomBonus;
      }

      return {
        ...job,
        matchScore: score,
        missingSkills: (job.requirements || []).filter(req => 
          !userSkills.some(skill => req.toLowerCase().includes(skill.toLowerCase()))
        ).slice(0, 3)
      };
    });

    // Sort by match score descending
    recommendedJobs.sort((a, b) => b.matchScore - a.matchScore);

    res.json(recommendedJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
