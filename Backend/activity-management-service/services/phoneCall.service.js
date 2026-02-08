const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PhoneCallService {
  // Get all phone calls with pagination and filters
  async getAllPhoneCalls(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    
    // Build where clause based on filters
    const whereClause = {};
    if (filters.status) whereClause.status = filters.status;
    if (filters.callFor) whereClause.callFor = filters.callFor;
    if (filters.owner) whereClause.owner = { contains: filters.owner, mode: 'insensitive' };

    const [phoneCalls, totalRecords] = await Promise.all([
      prisma.phoneCall.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          phoneCallContacts: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.phoneCall.count({ where: whereClause })
    ]);

    return {
      phoneCalls,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit)
    };
  }

  // Get phone call by ID
  async getPhoneCallById(id) {
    return await prisma.phoneCall.findUnique({
      where: { id },
      include: {
        phoneCallContacts: true
      }
    });
  }

  // Create new phone call (FIXED: removed accountId)
  async createPhoneCall(phoneCallData) {
    const { contacts = [], ...callData } = phoneCallData;

    return await prisma.$transaction(async (tx) => {
      // Remove accountId from callData before creating (if it exists)
      const { accountId, ...phoneCallFields } = callData;
      
      // Create the phone call
      const phoneCall = await tx.phoneCall.create({
        data: {
          ...phoneCallFields,
          // Handle relatedTo field based on callFor
          relatedTo: callData.callFor === 'LEADS' ? null : callData.relatedTo
        }
      });

      // Create phone call contacts if any
      if (contacts.length > 0) {
        await tx.phoneCallContact.createMany({
          data: contacts.map(contactId => ({
            phoneCallId: phoneCall.id,
            contactId
          }))
        });
      }

      return await tx.phoneCall.findUnique({
        where: { id: phoneCall.id },
        include: {
          phoneCallContacts: true
        }
      });
    });
  }

  // Update phone call (FIXED: removed accountId)
  async updatePhoneCall(id, updateData) {
    const { contacts, accountId, ...callData } = updateData; // Remove accountId

    return await prisma.$transaction(async (tx) => {
      // Check if phone call exists
      const existingCall = await tx.phoneCall.findUnique({ where: { id } });
      if (!existingCall) return null;

      // Update phone call
      const updatedCall = await tx.phoneCall.update({
        where: { id },
        data: {
          ...callData,
          // Handle relatedTo field based on callFor
          relatedTo: callData.callFor === 'LEADS' ? null : callData.relatedTo
        }
      });

      // Update contacts if provided
      if (contacts) {
        // Remove existing contacts
        await tx.phoneCallContact.deleteMany({
          where: { phoneCallId: id }
        });

        // Add new contacts
        if (contacts.length > 0) {
          await tx.phoneCallContact.createMany({
            data: contacts.map(contactId => ({
              phoneCallId: id,
              contactId
            }))
          });
        }
      }

      return await tx.phoneCall.findUnique({
        where: { id },
        include: {
          phoneCallContacts: true
        }
      });
    });
  }

  // Delete phone call
  async deletePhoneCall(id) {
    try {
      await prisma.phoneCall.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      if (error.code === 'P2025') return false; // Record not found
      throw error;
    }
  }

  // Update phone call status
  async updatePhoneCallStatus(id, status) {
    try {
      return await prisma.phoneCall.update({
        where: { id },
        data: { status },
        include: {
          phoneCallContacts: true
        }
      });
    } catch (error) {
      if (error.code === 'P2025') return null; // Record not found
      throw error;
    }
  }

  // Get phone calls by owner
  async getPhoneCallsByOwner(owner, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [phoneCalls, totalRecords] = await Promise.all([
      prisma.phoneCall.findMany({
        where: { owner },
        skip,
        take: limit,
        include: {
          phoneCallContacts: true
        },
        orderBy: {
          callTimeFrom: 'asc'
        }
      }),
      prisma.phoneCall.count({ where: { owner } })
    ]);

    return {
      phoneCalls,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit)
    };
  }

  // Get upcoming phone calls
  async getUpcomingPhoneCalls(limit = 10) {
    return await prisma.phoneCall.findMany({
      where: {
        status: 'SCHEDULED',
        callTimeFrom: {
          gte: new Date()
        }
      },
      take: limit,
      include: {
        phoneCallContacts: true
      },
      orderBy: {
        callTimeFrom: 'asc'
      }
    });
  }
}

module.exports = new PhoneCallService();
