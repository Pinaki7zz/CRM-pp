const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class MarketingTeamEmployeeService {
	static async createMarketingTeamEmployee(data) {
		// const existingTeam = await prisma.marketingTeamEmployee.findUnique({
		// 	where: { id },
		// });

		// if (existingTeam) {
		// 	throw new Error("Marketing Team Employee Code already exists");
		// }

		return prisma.marketingTeamEmployee.create({
			data,
		});
	}

	static async getAllMarketingTeamEmployees() {
		return prisma.marketingTeamEmployee.findMany();
	}

	static async getMarketingTeamEmployeeById(id) {
		return prisma.marketingTeamEmployee.findUnique({
			where: { id },
		});
	}

	static async updateMarketingTeamEmployee(id, data) {
		const existingTeam = await prisma.marketingTeamEmployee.findUnique({
			where: { id },
		});

		if (!existingTeam) {
			throw new Error("Marketing Team Employee not found");
		}

		if (data.id) {
			delete data.id;
		}

		return prisma.marketingTeamEmployee.update({
			where: { id },
			data,
		});
	}

	static async deleteMarketingTeamEmployee(id) {
		return prisma.marketingTeamEmployee.delete({
			where: { id },
		});
	}
}

module.exports = MarketingTeamEmployeeService;
