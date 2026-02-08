const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  validateSalesChannel,
  validateSalesChannelUpdate,
} = require("../validations/salesChannelValidation");

class SalesChannelService {
  static async createSalesChannel(data) {
    const { error } = validateSalesChannel(data);
    if (error) {
      throw new Error(error.details.map((detail) => detail.message).join(", "));
    }

    const existingChannel = await prisma.salesChannel.findUnique({
      where: { salesChannelCode: data.salesChannelCode },
    });

    if (existingChannel) {
      throw new Error("Sales Channel ID already exists");
    }

    return prisma.salesChannel.create({
      data,
    });
  }

  static async getAllSalesChannels() {
    return prisma.salesChannel.findMany();
  }

  static async getSalesChannelById(salesChannelCode) {
    return prisma.salesChannel.findUnique({
      where: { salesChannelCode },
    });
  }

  static async updateSalesChannelById(salesChannelCode, data) {
    const existingChannel = await prisma.salesChannel.findUnique({
      where: { salesChannelCode },
    });

    if (!existingChannel) {
      throw new Error("Sales Channel not found");
    }

    const { error } = validateSalesChannelUpdate(data);
    if (error) {
      throw new Error(error.details.map((detail) => detail.message).join(", "));
    }

    // Prevent changing the salesChannelCode
    if (data.salesChannelCode && data.salesChannelCode !== salesChannelCode) {
      throw new Error("Cannot change salesChannelCode through this endpoint");
    }

    return prisma.salesChannel.update({
      where: { salesChannelCode },
      data,
    });
  }

  static async deleteSalesChannelById(salesChannelCode) {
    const existingChannel = await prisma.salesChannel.findUnique({
      where: { salesChannelCode },
    });

    if (!existingChannel) {
      throw new Error("Sales Channel not found");
    }

    return prisma.salesChannel.delete({
      where: { salesChannelCode },
    });
  }
}

module.exports = SalesChannelService;
