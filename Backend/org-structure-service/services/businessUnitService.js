const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class BusinessUnitService {
  static async createBusinessUnit(data) {
    const { error } =
      require("../validations/businessUnitValidation").validateBusinessUnit(
        data
      );
    if (error)
      throw new Error(error.details.map((detail) => detail.message).join(", "));

    const existingUnit = await prisma.businessUnit.findUnique({
      where: { businessUnitCode: data.businessUnitCode },
    });
    if (existingUnit) throw new Error("Business Unit Code already exists");

    return prisma.businessUnit.create({
      data: {
        businessUnitCode: data.businessUnitCode,
        businessUnitDesc: data.businessUnitDesc,
        street1: data.street1,
        street2: data.street2,
        city: data.city,
        state: data.state,
        region: data.region,
        country: data.country,
        pinCode: data.pinCode,
      },
    });
  }

  static async updateBusinessUnitByCode(code, data) {
    const existingUnit = await prisma.businessUnit.findUnique({
      where: { businessUnitCode: code },
    });
    if (!existingUnit) throw new Error("Business Unit not found");

    const { error } =
      require("../validations/businessUnitValidation").validateBusinessUnitUpdate(
        data
      );
    if (error)
      throw new Error(error.details.map((detail) => detail.message).join(", "));

    return prisma.businessUnit.update({
      where: { businessUnitCode: code },
      data: {
        businessUnitDesc: data.businessUnitDesc,
        street1: data.street1,
        street2: data.street2,
        city: data.city,
        state: data.state,
        region: data.region,
        country: data.country,
        pinCode: data.pinCode,
      },
    });
  }

  static async getBusinessUnitByCode(code) {
    const businessUnit = await prisma.businessUnit.findUnique({
      where: { businessUnitCode: code },
    });
    if (!businessUnit) throw new Error("Business Unit not found");
    return businessUnit;
  }

  static async getAllBusinessUnits() {
    return prisma.businessUnit.findMany();
  }

  static async deleteBusinessUnitByCode(code) {
    const existingUnit = await prisma.businessUnit.findUnique({
      where: { businessUnitCode: code },
    });
    if (!existingUnit) throw new Error("Business Unit not found");
    return prisma.businessUnit.delete({ where: { businessUnitCode: code } });
  }

  static async assignChannelOffice(
    businessUnitCode,
    salesChannelId,
    salesOfficeCode
  ) {
    const businessUnit = await prisma.businessUnit.findUnique({
      where: { businessUnitCode },
    });
    if (!businessUnit) throw new Error("Business Unit not found");

    const salesChannel = await prisma.salesChannel.findUnique({
      where: { salesChannelId },
    });
    if (!salesChannel) throw new Error("Sales Channel not found");

    const salesOffice = await prisma.salesOffice.findUnique({
      where: { salesOfficeCode },
    });
    if (!salesOffice) throw new Error("Sales Office not found");

    const existingPair = await prisma.businessUnitChannelOfficePair.findUnique({
      where: {
        businessUnitCode_salesChannelId_salesOfficeCode: {
          businessUnitCode,
          salesChannelId,
          salesOfficeCode,
        },
      },
    });

    if (!existingPair) {
      return prisma.businessUnitChannelOfficePair.create({
        data: { businessUnitCode, salesChannelId, salesOfficeCode },
      });
    }
    return existingPair;
  }

  static async updateChannelOffice(businessUnitCode, assignments) {
    const businessUnit = await prisma.businessUnit.findUnique({
      where: { businessUnitCode },
    });
    if (!businessUnit) throw new Error("Business Unit not found");

    if (!Array.isArray(assignments)) {
      throw new Error("Assignments must be an array");
    }

    const validAssignments = [];
    for (const assignment of assignments) {
      const { salesChannelId, salesOfficeCode } = assignment;
      if (!salesChannelId || !salesOfficeCode) {
        console.warn(
          "Invalid assignment, missing salesChannelId or salesOfficeCode:",
          assignment
        );
        continue;
      }

      const salesChannel = await prisma.salesChannel.findUnique({
        where: { salesChannelId },
      });
      if (!salesChannel) {
        console.warn(
          `Sales Channel ${salesChannelId} not found, skipping assignment`
        );
        continue;
      }

      const salesOffice = await prisma.salesOffice.findUnique({
        where: { salesOfficeCode },
      });
      if (!salesOffice) {
        console.warn(
          `Sales Office ${salesOfficeCode} not found, skipping assignment`
        );
        continue;
      }

      validAssignments.push({ salesChannelId, salesOfficeCode });
    }

    const result = await prisma.$transaction(async (tx) => {
      if (validAssignments.length === 0 && assignments.length > 0) {
        return {
          success: true,
          message: "No valid assignments processed, existing data unchanged",
        };
      }

      const existingPairs = await tx.businessUnitChannelOfficePair.findMany({
        where: { businessUnitCode },
      });
      const existingPairKeys = existingPairs.map((pair) => ({
        salesChannelId: pair.salesChannelId,
        salesOfficeCode: pair.salesOfficeCode,
      }));

      // Only delete pairs that are being replaced by valid assignments
      const pairsToDelete = existingPairs
        .filter((pair) =>
          validAssignments.some(
            (va) =>
              va.salesChannelId === pair.salesChannelId &&
              va.salesOfficeCode === pair.salesOfficeCode
          )
        )
        .filter(
          (pair) =>
            !validAssignments.some(
              (va) =>
                va.salesChannelId === pair.salesChannelId &&
                va.salesOfficeCode === pair.salesOfficeCode &&
                va !== pair
            )
        );
      if (pairsToDelete.length > 0) {
        await tx.businessUnitChannelOfficePair.deleteMany({
          where: {
            id: { in: pairsToDelete.map((pair) => pair.id) },
          },
        });
      }

      // Create or update pairs based on valid assignments
      for (const va of validAssignments) {
        const existingPair = await tx.businessUnitChannelOfficePair.findUnique({
          where: {
            businessUnitCode_salesChannelId_salesOfficeCode: {
              businessUnitCode,
              ...va,
            },
          },
        });
        if (!existingPair) {
          await tx.businessUnitChannelOfficePair.create({
            data: { businessUnitCode, ...va },
          });
        } else {
          await tx.businessUnitChannelOfficePair.update({
            where: { id: existingPair.id },
            data: { updatedAt: new Date() },
          });
        }
      }

      return {
        success: true,
        message:
          validAssignments.length > 0
            ? "Channel office assignments updated or created"
            : "No changes made",
      };
    });

    return result;
  }

  static async getChannelOfficesByUnitCode(businessUnitCode) {
    const businessUnit = await prisma.businessUnit.findUnique({
      where: { businessUnitCode },
      include: {
        channelOfficePairs: {
          include: { salesChannel: true, salesOffice: true },
        },
      },
    });
    if (!businessUnit) throw new Error("Business Unit not found");
    return businessUnit.channelOfficePairs.map((pair) => ({
      salesChannelId: pair.salesChannel.salesChannelId,
      salesChannelName: pair.salesChannel.salesChannelName,
      salesOfficeCode: pair.salesOffice.salesOfficeCode,
      salesOfficeDesc: pair.salesOffice.salesOfficeDesc,
    }));
  }

  static async deleteChannelOfficePair(
    businessUnitCode,
    salesChannelId,
    salesOfficeCode
  ) {
    const existingPair = await prisma.businessUnitChannelOfficePair.findUnique({
      where: {
        businessUnitCode_salesChannelId_salesOfficeCode: {
          businessUnitCode,
          salesChannelId,
          salesOfficeCode,
        },
      },
    });
    if (!existingPair) throw new Error("Channel office pair not found");
    return prisma.businessUnitChannelOfficePair.delete({
      where: { id: existingPair.id },
    });
  }
}

module.exports = BusinessUnitService;
