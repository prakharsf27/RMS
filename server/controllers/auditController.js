const AuditLog = require('../models/AuditLog');

// @desc    Get all audit logs
// @route   GET /api/audit
// @access  Private (Admin)
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'fname lname email')
      .sort('-timestamp')
      .limit(100);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an audit log (internal helper)
exports.createLog = async (userId, action, details, req) => {
  try {
    await AuditLog.create({
      userId,
      action,
      details,
      ip: req ? req.ip : 'internal',
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};
