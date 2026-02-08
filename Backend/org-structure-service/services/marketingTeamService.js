const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class MarketingTeamService {
	static async createMarketingTeam(data) {
		const existingTeam = await prisma.marketingTeam.findUnique({
			where: { marketingTeamCode: data.marketingTeamCode },
		});

		if (existingTeam) {
			throw new Error("Marketing Team Code already exists");
		}

		return prisma.marketingTeam.create({
			data,
		});
	}

	static async getAllMarketingTeams() {
		return prisma.marketingTeam.findMany();
	}

	static async getMarketingTeamById(marketingTeamCode) {
		return prisma.marketingTeam.findUnique({
			where: { marketingTeamCode: marketingTeamCode },
		});
	}

	static async updateMarketingTeam(marketingTeamCode, data) {
		const existingTeam = await prisma.marketingTeam.findUnique({
			where: { marketingTeamCode: marketingTeamCode },
		});

		if (!existingTeam) {
			throw new Error("Marketing Team not found");
		}

		if (data.marketingTeamCode) {
			delete data.marketingTeamCode;
		}

		return prisma.marketingTeam.update({
			where: { marketingTeamCode: marketingTeamCode },
			data,
		});
	}

	static async deleteMarketingTeam(marketingTeamCode) {
		return prisma.marketingTeam.delete({
			where: { marketingTeamCode: marketingTeamCode },
		});
	}
}

module.exports = MarketingTeamService;
