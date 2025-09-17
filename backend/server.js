const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const subscriptionRoutes = require('./routes/subscriptions');
const planRoutes = require('./routes/plans');
const hrmsRoutes = require('./routes/hrms');
const userRoutes = require('./routes/users');

const { initializeDatabase } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// --------------------
// CORS configuration
// --------------------
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:5173' // vite dev server
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors()); // handle preflight requests

// --------------------
// Initialize database
// --------------------
initializeDatabase();

// --------------------
// Security middleware
// --------------------
app.use(helmet());

// --------------------
// Compression middleware
// --------------------
app.use(compression());

// --------------------
// Body parsing middleware
// --------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --------------------
// Logging middleware
// --------------------
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// --------------------
// Health check
// --------------------
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'CRM HRMS API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// --------------------
// API routes
// --------------------
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/hrms', hrmsRoutes);
app.use('/api/users', userRoutes);

// --------------------
// 404 handler
// --------------------
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`
  });
});

// --------------------
// Global error handler
// --------------------
app.use(errorHandler);

// --------------------
// Graceful shutdown
// --------------------
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// --------------------
// Start server
// --------------------
app.listen(PORT, () => {
  console.log(`🚀 CRM HRMS API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`💾 Database: ${process.env.DB_NAME || 'crm_hrms'}`);
});
