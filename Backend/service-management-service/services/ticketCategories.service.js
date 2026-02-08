const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class TicketCategoryService {
  /**
   * Create a new Ticket Category
   */
  async createTicketCategory(data) {
    // Validate that the user exists
    // const user = await prisma.user.findUnique({
    //   where: { id: data.createdById },
    // });

    // if (!user) {
    //   throw new Error('User not found');
    // }

    // Check if ticketCategoryId already exists
    const existingCategory = await prisma.ticketCategory.findUnique({
      where: { ticketCategoryId: data.ticketCategoryId },
    });

    if (existingCategory) {
      throw new Error('Ticket Category ID already exists');
    }

    const ticketCategory = await prisma.ticketCategory.create({
      data: {
        catalogName: data.catalogName,
        ticketCategoryId: data.ticketCategoryId,
        status: data.status || 'In Preparation',
        validFrom: data.validFrom,
        validTo: data.validTo,
        createdById: data.createdById,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        changedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return this.formatResponse(ticketCategory);
  }

  /**
   * Get Ticket Category by ID
   */
  async getTicketCategoryById(id) {
    const ticketCategory = await prisma.ticketCategory.findUnique({
      where: { id, isDeleted: false },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        changedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!ticketCategory) {
      throw new Error('Ticket Category not found');
    }

    return this.formatResponse(ticketCategory);
  }

  /**
   * Get all Ticket Categories
   */
  async getAllTicketCategories(skip = 0, take = 10, filters = {}) {
    const where = { isDeleted: false };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.catalogName) {
      where.catalogName = { contains: filters.catalogName, mode: 'insensitive' };
    }

    if (filters?.ticketCategoryId) {
      where.ticketCategoryId = {
        contains: filters.ticketCategoryId,
        mode: 'insensitive',
      };
    }

    const [ticketCategories, total] = await Promise.all([
      prisma.ticketCategory.findMany({
        where,
        skip,
        take,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          changedBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.ticketCategory.count({ where }),
    ]);

    return {
      data: ticketCategories.map((sc) => this.formatResponse(sc)),
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  /**
   * Update Ticket Category
   */
  async updateTicketCategory(id, data) {
    // Verify Ticket Category exists
    const existingCategory = await prisma.ticketCategory.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existingCategory) {
      throw new Error('Ticket Category not found');
    }

    // Validate changed by user exists
    if (data.changedById) {
      const user = await prisma.user.findUnique({
        where: { id: data.changedById },
      });

      if (!user) {
        throw new Error('User not found');
      }
    }

    const updateData = {
      changedById: data.changedById,
      changedOnDateTime: new Date(),
    };

    if (data.catalogName) {
      updateData.catalogName = data.catalogName;
    }
    if (data.status) {
      updateData.status = data.status;
    }
    if (data.validFrom) {
      updateData.validFrom = data.validFrom;
    }
    if (data.validTo !== undefined) {
      updateData.validTo = data.validTo;
    }

    const ticketCategory = await prisma.ticketCategory.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        changedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return this.formatResponse(ticketCategory);
  }

  /**
   * Delete Ticket Category (soft delete)
   */
  async deleteTicketCategory(id) {
    const existingCategory = await prisma.ticketCategory.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existingCategory) {
      throw new Error('Ticket Category not found');
    }

    await prisma.ticketCategory.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  /**
   * Search Ticket Categories
   */
  async searchTicketCategories(searchTerm) {
    const results = await prisma.ticketCategory.findMany({
      where: {
        isDeleted: false,
        OR: [
          { catalogName: { contains: searchTerm, mode: 'insensitive' } },
          { ticketCategoryId: { contains: searchTerm, mode: 'insensitive' } },
          { catalogId: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        changedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      take: 10,
    });

    return results.map((sc) => this.formatResponse(sc));
  }

  /**
   * Format response data
   */
  formatResponse(ticketCategory) {
    return {
      id: ticketCategory.id,
      catalogName: ticketCategory.catalogName,
      catalogId: ticketCategory.catalogId,
      ticketCategoryId: ticketCategory.ticketCategoryId,
      status: ticketCategory.status,
      validFrom: ticketCategory.validFrom,
      validTo: ticketCategory.validTo,
      createdById: ticketCategory.createdById,
      createdBy: ticketCategory.createdBy,
      createdOnDate: ticketCategory.createdOnDate,
      createdOnDateTime: ticketCategory.createdOnDateTime,
      changedById: ticketCategory.changedById,
      changedBy: ticketCategory.changedBy,
      changedOnDateTime: ticketCategory.changedOnDateTime,
    };
  }
}

module.exports = new TicketCategoryService();
