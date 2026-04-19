const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const dbMiddleware = require('./middleware/dbMiddleware');

// Load environment variables
dotenv.config();

// Check Critical Environment Variables
const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
requiredEnv.forEach(env => {
  if (!process.env[env]) {
    console.error(`⚠️  WARNING: Environment variable ${env} is missing!`);
  }
});

const app = express();

// Middleware
app.use(express.json());

// CORS Configuration - Loosened for Vercel production debugging
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow if no origin (like mobile apps/curl) or if matches allowed list or is a Vercel subdomain
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Ensure DB is connected before handling any requests
app.use(dbMiddleware);

// Static Folders
const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
const uploadPath = isVercel ? '/tmp/uploads' : path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadPath));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes Placeholder
app.get('/', (req, res) => {
  res.send('TalentFlow API is running...');
});

// Import Routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const appRoutes = require('./routes/applications');
const interviewRoutes = require('./routes/interviews');
const analyticsRoutes = require('./routes/analytics');
const auditRoutes = require('./routes/audit');
const companiesRoutes = require('./routes/companies');
const notificationRoutes = require('./routes/notifications');
const messageRoutes = require('./routes/messages');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', appRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/messages', messageRoutes);

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error('💥 Backend Error:', err.message);
  console.error(err.stack);
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

if (process.env.NODE_ENV !== 'production' && !isVercel) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
