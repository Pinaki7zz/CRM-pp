// services/meeting.service.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { NotFoundError, ApiError } = require('../utils/errors/ApiError');

/**
 * Creates a new meeting record in the database, including its associated contacts.
 * @param {Object} meetingData - The data for the new meeting.
 * @param {string[]} [meetingData.contactIds] - Optional array of contact IDs to link.
 * @returns {Promise<Object>} The created meeting object.
 * @throws {ApiError} If the database operation fails.
 */
const createMeeting = async (meetingData) => {
  try {
    // 1. Separate relationships (contactIds) from the core meeting data
    const { contactIds = [], ...restMeetingData } = meetingData;

    // 2. Create the meeting with nested write for contacts
    const newMeeting = await prisma.meeting.create({
      data: {
        ...restMeetingData,
        // Ensure valid Date objects
        fromDate: restMeetingData.fromDate ? new Date(restMeetingData.fromDate) : null,
        toDate: restMeetingData.toDate ? new Date(restMeetingData.toDate) : null,
        
        // Handle Many-to-Many relation via MeetingContact join table
        meetingContacts: {
          create: contactIds.map(contactId => ({
            contactId: contactId
          })),
        },
      },
      include: {
        meetingContacts: true, // Return the created relationships
      },
    });
    return newMeeting;
  } catch (error) {
    console.error('Service Error: Failed to create meeting:', error);
    throw new ApiError(500, 'Failed to create meeting: ' + error.message);
  }
};

/**
 * Retrieves all meeting records from the database, including associated contacts.
 * @returns {Promise<Array<Object>>} An array of meeting objects.
 * @throws {ApiError} If the database operation fails.
 */
const getAllMeetings = async () => {
  try {
    const meetings = await prisma.meeting.findMany({
      include: {
        meetingContacts: true,
      },
      orderBy: {
        createdAt: 'desc', // Show newest meetings first
      },
    });
    return meetings;
  } catch (error) {
    console.error('Service Error: Failed to retrieve meetings:', error);
    throw new ApiError(500, 'Failed to retrieve meetings due to a database error.');
  }
};

/**
 * Retrieves a single meeting record by its ID, including associated contacts.
 * @param {string} id - The ID of the meeting to retrieve.
 * @returns {Promise<Object|null>} The meeting object if found, otherwise null.
 * @throws {NotFoundError|ApiError} If the meeting is not found or the database operation fails.
 */
const getMeetingById = async (id) => {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        meetingContacts: true,
      },
    });
    
    if (!meeting) {
      throw new NotFoundError(`Meeting with ID ${id} not found.`);
    }
    return meeting;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error(`Service Error: Failed to retrieve meeting with ID ${id}:`, error);
    throw new ApiError(500, `Failed to retrieve meeting with ID ${id} due to a database error.`);
  }
};

/**
 * Updates an existing meeting record, including its associated contacts.
 * @param {string} id - The ID of the meeting to update.
 * @param {Object} updateData - The data to update the meeting with.
 * @param {string[]} [updateData.contactIds] - Optional array of contact IDs to link/unlink.
 * @returns {Promise<Object>} The updated meeting object.
 * @throws {NotFoundError|ApiError} If the meeting is not found or the database operation fails.
 */
const updateMeeting = async (id, updateData) => {
  try {
    const { contactIds, ...restUpdateData } = updateData;

    // Prepare fields for update, handling Date conversion if present
    const dataToUpdate = {
      ...restUpdateData,
      fromDate: restUpdateData.fromDate ? new Date(restUpdateData.fromDate) : undefined,
      toDate: restUpdateData.toDate ? new Date(restUpdateData.toDate) : undefined,
    };

    // Handle updating MeetingContact relationships
    if (contactIds !== undefined) {
      // 1. Clear existing contacts
      await prisma.meetingContact.deleteMany({
        where: { meetingId: id },
      });
      
      // 2. Add new contacts
      dataToUpdate.meetingContacts = {
        create: contactIds.map(contactId => ({
          contactId: contactId
        })),
      };
    }

    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: dataToUpdate,
      include: {
        meetingContacts: true,
      },
    });
    return updatedMeeting;
  } catch (error) {
    if (error.code === 'P2025') {
      throw new NotFoundError(`Meeting with ID ${id} not found.`);
    }
    console.error(`Service Error: Failed to update meeting with ID ${id}:`, error);
    throw new ApiError(500, `Failed to update meeting with ID ${id} due to a database error.`);
  }
};

/**
 * Deletes a meeting record by its ID.
 * @param {string} id - The ID of the meeting to delete.
 * @returns {Promise<Object>} The deleted meeting object.
 * @throws {NotFoundError|ApiError} If the meeting is not found or the database operation fails.
 */
const deleteMeeting = async (id) => {
  try {
    // Note: 'onDelete: Cascade' in schema handles meetingContacts automatically
    const deletedMeeting = await prisma.meeting.delete({
      where: { id },
    });
    return deletedMeeting;
  } catch (error) {
    if (error.code === 'P2025') {
      throw new NotFoundError(`Meeting with ID ${id} not found.`);
    }
    console.error(`Service Error: Failed to delete meeting with ID ${id}:`, error);
    throw new ApiError(500, `Failed to delete meeting with ID ${id} due to a database error.`);
  }
};

module.exports = {
  createMeeting,
  getAllMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
};