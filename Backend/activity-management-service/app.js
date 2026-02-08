// index.js
const express = require('express');
const cors = require('cors');

const taskRoutes = require('./routes/task.routes');
const meetingRoutes = require('./routes/meeting.routes');
const phoneCallRoutes = require('./routes/phoneCall.routes');
const emailRoutes = require('./routes/emailRoutes');

const { PrismaClient } = require('@prisma/client');
const { ApiError } = require('./utils/errors/ApiError');
require('dotenv').config();

// Init
const app = express();
const prisma = new PrismaClient();

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")
  : [];

app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server calls (Postman, curl, cron jobs)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`), false);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/am/api/tasks', taskRoutes);
app.use('/am/api/meetings', meetingRoutes);
app.use('/am/api/phone-calls', phoneCallRoutes);
app.use('/am/api/emails', emailRoutes);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ message: '✅ Activity Management Service is up and running!' });
});

// 404 handler (should be before global error handler)
app.use((req, res, next) => {
  next(new ApiError(404, 'Route not found'));
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Handle specific Prisma errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = `Duplicate entry for ${err.meta.target.join(', ')}.`;
  }

  // Add more phone call specific Prisma errors
  if (err.code === 'P2003') { // Foreign key constraint violation
    statusCode = 400;
    message = 'Invalid reference to related record.';
  }

  if (err.code === 'P2025') { // Record not found
    statusCode = 404;
    message = 'Record not found.';
  }

  // For non-operational errors or in production, hide internal details
  if (!err.isOperational && process.env.NODE_ENV === 'production') {
    statusCode = 500;
    message = 'Internal Server Error';
    errors = [];
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    errors: errors.length > 0 ? errors : undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Handle Prisma Disconnection on Process Exit
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Optional: Set up automatic email sync
if (process.env.NODE_ENV === 'production') {
  const emailService = require('./services/emailService');

  setInterval(async () => {
    try {
      await emailService.syncEmails();
      console.log('Automatic email sync completed');
    } catch (error) {
      console.error('Automatic email sync failed:', error);
    }
  }, parseInt(process.env.EMAIL_SYNC_INTERVAL) || 300000); // 5 minutes
}

// Start server
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
