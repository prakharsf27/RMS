const connectDB = require('../config/db');

const dbMiddleware = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database Connection Middleware Error:', error.message);
    res.status(500).json({ 
      message: 'Database connection failed. Please check backend logs or MONGO_URI.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = dbMiddleware;
