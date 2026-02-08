const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const domainRoutes = require('./routes/domainRoutes');
const emailChannelRoutes = require('./routes/emailChannel.routes');
const liveTalkRoutes = require('./routes/liveTalkRoutes');
const webformRoutes = require('./routes/webformRoutes');
// Init
const app = express();

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

// ✅ CRITICAL FIX: Configure Helmet to allow cross-origin widget embedding
app.use(helmet({
  crossOriginEmbedderPolicy: false,  // Disable COEP to allow cross-origin scripts
  crossOriginResourcePolicy: {
    policy: 'cross-origin'           // Allow cross-origin resource requests
  },
  contentSecurityPolicy: false       // Disable CSP for widget compatibility
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Disable ETag to prevent 304 CORS issues
app.set('etag', false);

// ✅ Serve static files with no-cache headers
app.use('/cm/api/live-talk', express.static(path.join(__dirname, 'public'), {
  etag: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
    }
  }
}));

// API Routes
app.use('/cm/api/domain-auth', domainRoutes);
app.use('/cm/api/email-channels', emailChannelRoutes);
app.use('/cm/api/live-talk', liveTalkRoutes);
app.use('/cm/api/webforms', webformRoutes);

// Health check
app.get('/cm', (req, res) => {
  res.status(200).json({ message: '✅ Email Integration is up and running!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Widget available at http://localhost:${PORT}/api/live-talk/widget.js`);
  console.log(`✅ CORS and COEP configured for widget embedding`);
});
