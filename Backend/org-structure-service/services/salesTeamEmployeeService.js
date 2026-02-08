const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class SalesTeamEmployeeService {
	static async createSalesTeamEmployee(data) {
		// const existingTeam = await prisma.salesTeamEmployee.findUnique({
		// 	where: { id },
		// });

		// if (existingTeam) {
		// 	throw new Error("Sales Team Employee Code already exists");
		// }

		return prisma.salesTeamEmployee.create({
			data,
		});
	}

	static async getAllSalesTeamEmployees() {
		return prisma.salesTeamEmployee.findMany();
	}

	static async getSalesTeamEmployeeById(id) {
		return prisma.salesTeamEmployee.findUnique({
			where: { id },
		});
	}

	static async updateSalesTeamEmployee(id, data) {
		const existingTeam = await prisma.salesTeamEmployee.findUnique({
			where: { id },
		});

		if (!existingTeam) {
			throw new Error("Sales Team Employee not found");
		}

		if (data.id) {
			delete data.id;
		}

		return prisma.salesTeamEmployee.update({
			where: { id },
			data,
		});
	}

	static async deleteSalesTeamEmployee(id) {
		return prisma.salesTeamEmployee.delete({
			where: { id },
		});
	}
}

module.exports = SalesTeamEmployeeService;
