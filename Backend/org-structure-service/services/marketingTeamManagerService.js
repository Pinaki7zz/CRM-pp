const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class MarketingTeamManagerService {
	static async createMarketingTeamManager(data) {
		// const existingTeam = await prisma.marketingTeamManager.findUnique({
		// 	where: { id: data.id },
		// });

		// if (existingTeam) {
		// 	throw new Error("Marketing Team Manager already exists");
		// }

		return prisma.marketingTeamManager.create({
			data,
		});
	}

	static async getAllMarketingTeamManagers() {
		return prisma.marketingTeamManager.findMany();
	}

	static async getMarketingTeamManagerById(id) {
		return prisma.marketingTeamManager.findUnique({
			where: { id },
		});
	}

	static async updateMarketingTeamManager(id, data) {
		const existingTeam = await prisma.marketingTeamManager.findUnique({
			where: { id },
		});

		if (!existingTeam) {
			throw new Error("Marketing Team Manager not found");
		}

		if (data.id) {
			delete data.id;
		}

		return prisma.marketingTeamManager.update({
			where: { id },
			data,
		});
	}

	static async deleteMarketingTeamManager(id) {
		return prisma.marketingTeamManager.delete({
			where: { id },
		});
	}
}

module.exports = MarketingTeamManagerService;
