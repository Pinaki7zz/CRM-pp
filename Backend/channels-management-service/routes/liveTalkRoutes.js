const express = require('express');
const router = express.Router();
const path = require('path');

// Import controller and validation middleware
const liveTalkController = require('../controllers/liveTalkController');
const { validate, validateQuery, validateParams, schemas } = require('../utils/validators/livetalkValidator');

// ===============================
// CHATFLOW CRUD ROUTES
// ===============================

router.post('/chatflows',
  validate(schemas.createChatflow),
  liveTalkController.createChatflow
);

router.get('/chatflows',
  validateQuery(schemas.chatflowQuery),
  liveTalkController.getChatflows
);

router.get('/chatflows/:id',
  validateParams(schemas.idParam),
  liveTalkController.getChatflowById
);

router.put('/chatflows/:id',
  validateParams(schemas.idParam),
  validate(schemas.updateChatflow),
  liveTalkController.updateChatflow
);

router.put('/chatflows/:id/status',
  validateParams(schemas.idParam),
  validate(schemas.updateChatflowStatus),
  liveTalkController.updateChatflowStatus
);

router.delete('/chatflows/:id',
  validateParams(schemas.idParam),
  liveTalkController.deleteChatflow
);

// ===============================
// API ROUTES (NOT STATIC FILES)
// ===============================

// Widget configuration for embedding
router.get('/widget/config', liveTalkController.getWidgetConfig);

// Auto-assign conversation to agent
router.post('/conversations/assign', liveTalkController.assignConversation);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'LiveTalk API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ❌ REMOVED: All static file serving routes (widget.js, widget.css, widget-component.js)
// These are now handled by express.static() in index.js

module.exports = router;
