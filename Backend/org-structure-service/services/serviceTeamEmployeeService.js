const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ServiceTeamEmployeeService {
	static async createServiceTeamEmployee(data) {
		// const existingTeam = await prisma.serviceTeamEmployee.findUnique({
		// 	where: { id },
		// });

		// if (existingTeam) {
		// 	throw new Error("Service Team Employee Code already exists");
		// }

		return prisma.serviceTeamEmployee.create({
			data,
		});
	}

	static async getAllServiceTeamEmployees() {
		return prisma.serviceTeamEmployee.findMany();
	}

	static async getServiceTeamEmployeeById(id) {
		return prisma.serviceTeamEmployee.findUnique({
			where: { id },
		});
	}

	static async updateServiceTeamEmployee(id, data) {
		const existingTeam = await prisma.serviceTeamEmployee.findUnique({
			where: { id },
		});

		if (!existingTeam) {
			throw new Error("Service Team Employee not found");
		}

		if (data.id) {
			delete data.id;
		}

		return prisma.serviceTeamEmployee.update({
			where: { id },
			data,
		});
	}

	static async deleteServiceTeamEmployee(id) {
		return prisma.serviceTeamEmployee.delete({
			where: { id },
		});
	}
}

module.exports = ServiceTeamEmployeeService;
