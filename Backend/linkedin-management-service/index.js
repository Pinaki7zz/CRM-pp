// const express = require('express');
// const { PrismaClient } = require('@prisma/client');
// const dotenv = require('dotenv');
// const cors = require('cors');

// dotenv.config();

// const app = express();
// const prisma = new PrismaClient();

// // Middleware
// app.use(cors({
//   origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003'],
//   credentials: true
// }));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Health check endpoint
// app.get('/health', async (req, res) => {
//   try {
//     await prisma.$connect();
//     res.json({ 
//       status: 'OK', 
//       timestamp: new Date().toISOString(),
//       message: 'Server and database are running',
//       env: process.env.NODE_ENV || 'development'
//     });
//   } catch (error) {
//     console.error('Health check error:', error);
//     res.status(500).json({ 
//       status: 'ERROR', 
//       message: error.message 
//     });
//   }
// });

// // Safe route loading with error handling
// const loadRoute = (path, routeModule) => {
//   try {
//     if (typeof routeModule === 'function') {
//       app.use(path, routeModule);
//       console.log(`✅ Loaded route: ${path}`);
//       return true;
//     } else {
//       console.error(`❌ Invalid route module for ${path}:`, typeof routeModule);
//       return false;
//     }
//   } catch (error) {
//     console.error(`❌ Failed to load route ${path}:`, error.message);
//     return false;
//   }
// };

// // Load routes safely
// // loadRoute('/auth', require('./routes/authRoutes'));
// // loadRoute('/integrations', require('./routes/integrationRoutes'));
// // loadRoute('/credentials', require('./routes/credentialRoutes'));
// // loadRoute('/linkedin-external', require('./routes/linkedinExternalRoutes'));
// // loadRoute('/leads', require('./routes/leadRoutes'));


// app.use('/auth', require('./routes/authRoutes'));
// app.use('/integrations', require('./routes/integrationRoutes'));
// app.use('/add-identity-providers', require('./routes/addIdentityProviderRoutes'));
// app.use('/add-external-bodies', require('./routes/addExternalBodyRoutes'));
// app.use('/add-principals', require('./routes/addPrincipalRoutes'));
// app.use('/add-named-credentials', require('./routes/addNamedCredentialRoutes'));
// app.use('/linkedin-externals', require('./routes/linkedinExternalRoutes'));
// app.use('/leads', require('./routes/leadRoutes'));

// // 404 handler
// app.use((req, res, next) => {
//   res.status(404).json({ 
//     error: 'Route not found',
//     path: req.originalUrl,
//     method: req.method
//   });
// });

// // Global error handling
// app.use((error, req, res, next) => {
//   console.error('Global error:', error);
//   res.status(500).json({ 
//     error: 'Internal server error',
//     message: error.message || 'Something went wrong'
//   });
// });

// const PORT = process.env.PORT || 3003;

// const server = app.listen(PORT, async () => {
//   try {
//     await prisma.$connect();
//     console.log(`✅ Server running on port ${PORT}`);
//     console.log(`✅ Database connected successfully`);
//     console.log(`📱 Health check: http://localhost:${PORT}/health`);
//     console.log(`🔐 Auth: http://localhost:${PORT}/auth/*`);
//     console.log(`🔗 Integrations: http://localhost:${PORT}/integrations/*`);
//     console.log(`📋 Credentials: http://localhost:${PORT}/credentials/*`);
//     console.log(`🔗 LinkedIn External: http://localhost:${PORT}/linkedin-external/*`);
//     console.log(`📊 Leads: http://localhost:${PORT}/leads/*`);
//   } catch (error) {
//     console.error('❌ Database connection failed:', error.message);
//     process.exit(1);
//   }
// });

// // Graceful shutdown
// process.on('SIGINT', async () => {
//   console.log('\n🛑 Shutting down gracefully...');
//   await prisma.$disconnect();
//   server.close(() => {
//     console.log('✅ Server closed');
//     process.exit(0);
//   });
// });

// module.exports = app;


const express = require('express');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003', 'http://localhost:4010',],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// app.use(cors({
//   origin: 'http://localhost:4010', // React frontend
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true // ✅ allow cookies / auth headers
// }));
// Health check endpoint (public)
app.get('/health', async (req, res) => {
  try {
    await prisma.$connect();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      message: 'CRM LinkedIn Integration Server running',
      env: process.env.NODE_ENV || 'development',
      publicEndpoints: [
        '/integrations/*',
        '/add-identity-providers/*',
        '/add-external-bodies/*',
        '/add-principals/*',
        '/add-named-credentials/*',
        '/linkedin-externals/*'
      ],
      protectedEndpoints: ['/auth/*', '/leads/*']
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

// === SETUP PHASE (Public - No Auth Required) ===
// Step 1: Integration
app.use('/integrations', require('./routes/integrationRoutes'));

// Step 2: 4 Credential Popups
app.use('/add-identity-providers', require('./routes/addIdentityProviderRoutes'));
app.use('/add-external-bodies', require('./routes/addExternalBodyRoutes'));
app.use('/add-principals', require('./routes/addPrincipalRoutes'));
app.use('/add-named-credentials', require('./routes/addNamedCredentialRoutes'));

// Step 3: LinkedIn External
app.use('/linkedin-externals', require('./routes/linkedinExternalRoutes'));

// === USAGE PHASE (Protected - JWT Required) ===
// CRM User Management
app.use('/auth', require('./routes/authRoutes'));

// Lead Generation (requires LinkedIn setup + CRM login)
app.use('/leads', require('./routes/leadRoutes'));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    available: {
      setup: ['/integrations', '/add-identity-providers', '/add-external-bodies', '/add-principals', '/add-named-credentials', '/linkedin-externals'],
      usage: ['/auth', '/leads']
    }
  });
});

// Global error handling
app.use((error, req, res, next) => {
  console.error('Global error:', {
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    error: error.message,
    stack: error.stack
  });
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3003;

const server = app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`\n🚀 CRM LinkedIn Integration Server`);
    console.log(`✅ Running on port ${PORT}`);
    console.log(`✅ Database connected successfully`);
    console.log(`\n📱 Health check: http://localhost:${PORT}/health`);
    console.log(`\n=== SETUP PHASE (Public - No Login Required) ===`);
    console.log(`🔧 1. Integration: http://localhost:${PORT}/integrations`);
    console.log(`🔧 2. Identity Providers: http://localhost:${PORT}/add-identity-providers`);
    console.log(`🔧 3. External Bodies: http://localhost:${PORT}/add-external-bodies`);
    console.log(`🔧 4. Principals: http://localhost:${PORT}/add-principals`);
    console.log(`🔧 5. Named Credentials: http://localhost:${PORT}/add-named-credentials`);
    console.log(`🔗 6. LinkedIn External: http://localhost:${PORT}/linkedin-externals`);
    console.log(`\n=== USAGE PHASE (CRM Login Required) ===`);
    console.log(`👤 Auth: http://localhost:${PORT}/auth`);
    console.log(`📊 Leads: http://localhost:${PORT}/leads`);
    console.log(`\n🎯 Workflow: Integration → Credentials → LinkedIn External → LinkedIn Login → CRM Login → Generate Leads`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;