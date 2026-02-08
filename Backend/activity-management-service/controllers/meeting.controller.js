// controllers/meeting.controller.js
const meetingService = require('../services/meeting.service');
const { ApiError, NotFoundError } = require('../utils/errors/ApiError');

/**
 * Handles the creation of a new meeting.
 * POST /api/meetings
 */
const createMeetingController = async (req, res, next) => {
  try {
    const rawData = req.body;

    // --- DEBUGGING LOGS ---
    console.log("Backend Controller: Received meetingData:", rawData);

    // --- SMART PAYLOAD PREPARATION ---
    // This logic ensures the data fits the schema regardless of minor frontend inconsistencies
    const payloadForService = {
      subject: rawData.subject,
      location: rawData.location || null,
      
      // Ensure IDs are strings and handle fallbacks if one is missing
      meetingOwnerId: rawData.meetingOwnerId || rawData.hostId, 
      hostId: rawData.hostId || rawData.meetingOwnerId,         
      
      primaryContactId: rawData.primaryContactId || null,
      leadId: rawData.leadId || null,
      accountId: rawData.accountId || null,

      relatedTo: rawData.relatedTo || null,
      relatedRecordId: rawData.relatedRecordId || null, 

      // Safe Enum Handling: Uppercase it, default to SCHEDULED/MEDIUM
      status: (rawData.status || 'SCHEDULED').toUpperCase(),
      priority: (rawData.priority || 'MEDIUM').toUpperCase(),

      // Date Handling: Ensure valid date objects
      fromDate: rawData.fromDate ? new Date(rawData.fromDate) : null,
      toDate: rawData.toDate ? new Date(rawData.toDate) : null,

      // Arrays: Ensure it's an array
      participants: Array.isArray(rawData.participants) ? rawData.participants : [],
      contactIds: Array.isArray(rawData.contactIds) ? rawData.contactIds : [],

      // Type Conversion: Convert Number to String for Schema compatibility
      participantReminder: rawData.participantReminder ? String(rawData.participantReminder) : null,
      
      description: rawData.description || null,
    };

    console.log("Backend Controller: Processed Payload:", payloadForService);

    const newMeeting = await meetingService.createMeeting(payloadForService);
    res.status(201).json({ message: 'Meeting created successfully', meeting: newMeeting });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles fetching all meetings.
 * GET /api/meetings
 */
const getAllMeetingsController = async (req, res, next) => {
  try {
    const meetings = await meetingService.getAllMeetings();
    res.status(200).json(meetings);
  } catch (error) {
    next(error);
  }
};

/**
 * Handles fetching a single meeting by ID.
 * GET /api/meetings/:id
 */
const getMeetingByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const meeting = await meetingService.getMeetingById(id);
    res.status(200).json(meeting);
  } catch (error) {
    next(error);
  }
};

/**
 * Handles updating an existing meeting.
 * PUT /api/meetings/:id
 */
const updateMeetingController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rawData = req.body;

    // Apply similar robust parsing for updates
    // We only transform fields if they are strictly present in the request
    const updatePayload = {
      ...rawData,
      ...(rawData.status && { status: rawData.status.toUpperCase() }),
      ...(rawData.priority && { priority: rawData.priority.toUpperCase() }),
      ...(rawData.participantReminder && { participantReminder: String(rawData.participantReminder) }),
      ...(rawData.fromDate && { fromDate: new Date(rawData.fromDate) }),
      ...(rawData.toDate && { toDate: new Date(rawData.toDate) }),
      // Ensure contactIds is an array if it's being updated
      ...(rawData.contactIds && { contactIds: Array.isArray(rawData.contactIds) ? rawData.contactIds : [] }),
    };

    const updatedMeeting = await meetingService.updateMeeting(id, updatePayload);
    res.status(200).json({ message: 'Meeting updated successfully', meeting: updatedMeeting });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles deleting a meeting.
 * DELETE /api/meetings/:id
 */
const deleteMeetingController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedMeeting = await meetingService.deleteMeeting(id);
    res.status(200).json({ message: 'Meeting deleted successfully', meeting: deletedMeeting });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMeetingController,
  getAllMeetingsController,
  getMeetingByIdController,
  updateMeetingController,
  deleteMeetingController,
};