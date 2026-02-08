const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ServiceTeamManagerService {
	static async createServiceTeamManager(data) {
		// const existingTeam = await prisma.serviceTeamManager.findUnique({
		// 	where: { id: data.id },
		// });

		// if (existingTeam) {
		// 	throw new Error("Service Team Manager Code already exists");
		// }

		return prisma.serviceTeamManager.create({
			data,
		});
	}

	static async getAllServiceTeamManagers() {
		return prisma.serviceTeamManager.findMany();
	}

	static async getServiceTeamManagerById(id) {
		return prisma.serviceTeamManager.findUnique({
			where: { id },
		});
	}

	static async updateServiceTeamManager(id, data) {
		const existingTeam = await prisma.serviceTeamManager.findUnique({
			where: { id },
		});

		if (!existingTeam) {
			throw new Error("Service Team Manager not found");
		}

		if (data.id) {
			delete data.id;
		}

		return prisma.serviceTeamManager.update({
			where: { id },
			data,
		});
	}

	static async deleteServiceTeamManager(id) {
		return prisma.serviceTeamManager.delete({
			where: { id },
		});
	}
}

module.exports = ServiceTeamManagerService;
