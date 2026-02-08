const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class SalesTeamService {
  static async createSalesTeam(data) {
    const existingTeam = await prisma.salesTeam.findUnique({
      where: { salesTeamCode: data.salesTeamCode },
    });

    if (existingTeam) {
      throw new Error("Sales Team Code already exists");
    }

    return prisma.salesTeam.create({
      data,
    });
  }

  static async getAllSalesTeams() {
    return prisma.salesTeam.findMany();
  }

  static async getSalesTeamById(salesTeamCode) {
    return prisma.salesTeam.findUnique({
      where: { salesTeamCode: salesTeamCode },
    });
  }

  static async updateSalesTeam(salesTeamCode, data) {
    const existingTeam = await prisma.salesTeam.findUnique({
      where: { salesTeamCode: salesTeamCode },
    });

    if (!existingTeam) {
      throw new Error("Sales Team not found");
    }

    if (data.salesTeamCode) {
      delete data.salesTeamCode;
    }

    return prisma.salesTeam.update({
      where: { salesTeamCode: salesTeamCode },
      data,
    });
  }

  static async deleteSalesTeam(salesTeamCode) {
    return prisma.salesTeam.delete({
      where: { salesTeamCode: salesTeamCode },
    });
  }
}

module.exports = SalesTeamService;
