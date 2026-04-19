const connectDB = require('../config/db');

const dbMiddleware = async (req, res, next) => {
  // Detailed pre-check
  if (!process.env.MONGO_URI) {
    console.error('❌ CRITICAL: MONGO_URI is not defined in environment variables.');
    return res.status(500).json({
      message: 'Server configuration error: Database URI is missing.',
      suggestion: 'Ensure MONGO_URI is set in Vercel Project Settings.'
    });
  }

  try {
    const conn = await connectDB();
    if (!conn) throw new Error('Failed to obtain database connection object');
    next();
  } catch (error) {
    console.error('💥 Database Connection Error:', error.message);
    res.status(503).json({ 
      message: 'Database connection failed. Service temporarily unavailable.',
      error: error.message,
      help: 'Check if your IP is whitelisted in MongoDB Atlas or if the URI is correct.'
    });
  }
};

module.exports = dbMiddleware;
