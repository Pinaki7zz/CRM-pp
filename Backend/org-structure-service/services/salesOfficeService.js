const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class SalesOfficeService {
  static async createSalesOffice(data) {
    const { error } =
      require("../validations/salesOfficeValidation").validateSalesOffice(data);
    if (error)
      throw new Error(error.details.map((detail) => detail.message).join(", "));

    const existingOffice = await prisma.salesOffice.findUnique({
      where: { salesOfficeId: data.salesOfficeId },
    });
    if (existingOffice) throw new Error("ID already exists");

    return prisma.salesOffice.create({
      data: {
        salesOfficeId: data.salesOfficeId,
        organizationName: data.organizationName,
        salesOfficeDesc: data.salesOfficeDesc || null,
        street1: data.street1,
        street2: data.street2 || null,
        city: data.city,
        state: data.state,
        region: data.region || null,
        country: data.country,
        pinCode: data.pinCode,
        validFrom: new Date(data.validFrom).toISOString(),
        validTo: new Date(data.validTo).toISOString(),
        company: data.company,
        parentUnit: data.parentUnit || null,
      },
    });
  }

  static async getAllSalesOffices() {
    return prisma.salesOffice.findMany();
  }

  static async getSalesOfficeByCode(salesOfficeId) {
    const salesOffice = await prisma.salesOffice.findUnique({
      where: { salesOfficeId },
    });
    if (!salesOffice) throw new Error("Sales Office not found");
    return salesOffice;
  }

  static async updateSalesOffice(salesOfficeId, data) {
    const existingOffice = await prisma.salesOffice.findUnique({
      where: { salesOfficeId },
    });
    if (!existingOffice) throw new Error("Sales Office not found");

    const { error } =
      require("../validations/salesOfficeValidation").validateSalesOfficeUpdate(
        data
      );
    if (error)
      throw new Error(error.details.map((detail) => detail.message).join(", "));

    if (data.salesOfficeId)
      throw new Error("ID cannot be changed");

    return prisma.salesOffice.update({
      where: { salesOfficeId },
      data: {
        organizationName: data.organizationName,
        salesOfficeDesc: data.salesOfficeDesc || null,
        street1: data.street1,
        street2: data.street2 || null,
        city: data.city,
        state: data.state,
        region: data.region || null,
        country: data.country,
        pinCode: data.pinCode,
        validFrom: new Date(data.validFrom).toISOString(),
        validTo: new Date(data.validTo).toISOString(),
        company: data.company,
        parentUnit: data.parentUnit || null,
      },
    });
  }

  static async deleteSalesOffice(salesOfficeId) {
    const existingOffice = await prisma.salesOffice.findUnique({
      where: { salesOfficeId },
    });
    if (!existingOffice) throw new Error("Sales Office not found");
    return prisma.salesOffice.delete({ where: { salesOfficeId } });
  }

  // Relation Methods
  static async assignTeamPerson(salesOfficeId, salesTeamCode, salesPersonId) {
    const salesOffice = await prisma.salesOffice.findUnique({
      where: { salesOfficeId },
    });
    if (!salesOffice) throw new Error("Sales Office not found");

    const salesTeam = await prisma.salesTeam.findUnique({
      where: { salesTeamCode },
    });
    if (!salesTeam) throw new Error("Sales Team not found");

    const salesPerson = await prisma.salesPerson.findUnique({
      where: { salesPersonId },
    });
    if (!salesPerson) throw new Error("Sales Person not found");

    const existingPair = await prisma.salesOfficeTeamPersonPair.findUnique({
      where: {
        salesOfficeId_salesTeamCode_salesPersonId: {
          salesOfficeId,
          salesTeamCode,
          salesPersonId,
        },
      },
    });

    if (!existingPair) {
      return prisma.salesOfficeTeamPersonPair.create({
        data: { salesOfficeId, salesTeamCode, salesPersonId },
      });
    }
    return existingPair;
  }

  static async updateTeamPerson(salesOfficeId, salesTeamCode, salesPersonId) {
    // Validate inputs
    if (!salesOfficeId || !salesTeamCode || !salesPersonId) {
      throw new Error(
        "Sales office code, sales team code, and sales person ID are required"
      );
    }

    // Trim inputs to avoid whitespace issues
    salesOfficeId = salesOfficeId.trim();
    salesTeamCode = salesTeamCode.trim();
    salesPersonId = salesPersonId.trim();

    // Validate all entities exist
    const [salesOffice, salesTeam, salesPerson] = await Promise.all([
      prisma.salesOffice.findUnique({ where: { salesOfficeId } }),
      prisma.salesTeam.findUnique({ where: { salesTeamCode } }),
      prisma.salesPerson.findUnique({ where: { salesPersonId } }),
    ]);

    if (!salesOffice) throw new Error("Sales Office not found");
    if (!salesTeam) throw new Error("Sales Team not found");
    if (!salesPerson) throw new Error("Sales Person not found");

    // Try to find existing pair for this office and team
    const existingPair = await prisma.salesOfficeTeamPersonPair.findFirst({
      where: {
        salesOfficeId,
        salesTeamCode,
      },
    });

    let assignment;
    if (existingPair) {
      // UPDATE EXISTING RECORD
      assignment = await prisma.salesOfficeTeamPersonPair.update({
        where: { id: existingPair.id },
        data: {
          salesPersonId, // Just update the sales person ID
        },
        include: {
          salesTeam: true,
          salesPerson: true,
        },
      });
      console.log("Updated existing assignment:", assignment);
    } else {
      // CREATE NEW RECORD
      assignment = await prisma.salesOfficeTeamPersonPair.create({
        data: {
          salesOfficeId,
          salesTeamCode,
          salesPersonId,
        },
        include: {
          salesTeam: true,
          salesPerson: true,
        },
      });
      console.log("Created new assignment:", assignment);
    }

    return {
      id: assignment.id,
      salesOfficeId,
      salesTeamCode: assignment.salesTeam.salesTeamCode,
      salesPersonCode: assignment.salesPerson.salesPersonId,
    };
  }

  static async getTeamPersonsByOfficeCode(salesOfficeId) {
    const salesOffice = await prisma.salesOffice.findUnique({
      where: { salesOfficeId },
      include: {
        teamPersonPairs: { include: { salesTeam: true, salesPerson: true } },
      },
    });
    if (!salesOffice) {
      throw new Error("Sales Office not found");
    }
    return salesOffice.teamPersonPairs.map((pair, index) => ({
      id: pair.id || `${salesOfficeId}-${index}`, // Ensure unique ID
      salesOfficeId,
      salesTeamCode: pair.salesTeam?.salesTeamCode || "",
      salesPersonCode:
        pair.salesPerson?.salesPersonCode ||
        pair.salesPerson?.salesPersonId ||
        "",
    }));
  }

  static async getAllAssignments() {
    const salesOffices = await prisma.salesOffice.findMany({
      include: {
        teamPersonPairs: { include: { salesTeam: true, salesPerson: true } },
      },
    });

    const assignments = salesOffices.flatMap((office, officeIndex) =>
      (office.teamPersonPairs || []).map((pair, pairIndex) => ({
        id: pair.id || `${office.salesOfficeId}-${officeIndex}-${pairIndex}`, // Ensure unique ID
        salesOfficeId: office.salesOfficeId || "",
        salesTeamCode: pair.salesTeam?.salesTeamCode || "",
        salesPersonCode:
          pair.salesPerson?.salesPersonCode ||
          pair.salesPerson?.salesPersonId ||
          "",
      }))
    );

    return assignments;
  }

  static async deleteTeamPersonPair(
    salesOfficeId,
    salesTeamCode,
    salesPersonId
  ) {
    const existingPair = await prisma.salesOfficeTeamPersonPair.findUnique({
      where: {
        salesOfficeId_salesTeamCode_salesPersonId: {
          salesOfficeId,
          salesTeamCode,
          salesPersonId,
        },
      },
    });
    if (!existingPair) throw new Error("Team person pair not found");
    return prisma.salesOfficeTeamPersonPair.delete({
      where: { id: existingPair.id },
    });
  }
}

module.exports = SalesOfficeService;
