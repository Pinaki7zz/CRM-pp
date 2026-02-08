const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class SalesTeamManagerService {
	static async createSalesTeamManager(data) {
		// const existingTeam = await prisma.salesTeamManager.findUnique({
		// 	where: { id },
		// });

		// if (existingTeam) {
		// 	throw new Error("Sales Team Manager Code already exists");
		// }

		return prisma.salesTeamManager.create({
			data,
		});
	}

	static async getAllSalesTeamManagers() {
		return prisma.salesTeamManager.findMany();
	}

	static async getSalesTeamManagerById(id) {
		return prisma.salesTeamManager.findUnique({
			where: { id },
		});
	}

	static async updateSalesTeamManager(id, data) {
		const existingTeam = await prisma.salesTeamManager.findUnique({
			where: { id },
		});

		if (!existingTeam) {
			throw new Error("Sales Team Manager not found");
		}

		if (data.id) {
			delete data.id;
		}

		return prisma.salesTeamManager.update({
			where: { id },
			data,
		});
	}

	static async deleteSalesTeamManager(id) {
		return prisma.salesTeamManager.delete({
			where: { id },
		});
	}
}

module.exports = SalesTeamManagerService;
