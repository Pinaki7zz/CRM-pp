// routes/meeting.routes.js
const express = require('express');
const {
  createMeetingController,
  getAllMeetingsController,
  getMeetingByIdController,
  updateMeetingController,
  deleteMeetingController,
} = require('../controllers/meeting.controller');

// Import the updated validators
const { 
  validateCreateMeeting, 
  validateUpdateMeeting 
} = require('../utils/validators/meeting.validator');

const router = express.Router();

// Route to create a new meeting with validation enabled
router.post('/', validateCreateMeeting, createMeetingController);

// Route to get all meetings
router.get('/', getAllMeetingsController);

// Route to get a single meeting by ID
router.get('/:id', getMeetingByIdController);

// Route to update a meeting by ID with validation enabled
router.put('/:id', validateUpdateMeeting, updateMeetingController);

// Route to delete a meeting by ID
router.delete('/:id', deleteMeetingController);

module.exports = router;