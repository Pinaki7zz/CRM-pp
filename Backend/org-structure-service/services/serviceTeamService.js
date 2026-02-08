const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ServiceTeamService {
	static async createServiceTeam(data) {
		const existingTeam = await prisma.serviceTeam.findUnique({
			where: { serviceTeamCode: data.serviceTeamCode },
		});

		if (existingTeam) {
			throw new Error("Service Team Code already exists");
		}

		return prisma.serviceTeam.create({
			data,
		});
	}

	static async getAllServiceTeams() {
		return prisma.serviceTeam.findMany();
	}

	static async getServiceTeamById(serviceTeamCode) {
		return prisma.serviceTeam.findUnique({
			where: { serviceTeamCode: serviceTeamCode },
		});
	}

	static async updateServiceTeam(serviceTeamCode, data) {
		const existingTeam = await prisma.serviceTeam.findUnique({
			where: { serviceTeamCode: serviceTeamCode },
		});

		if (!existingTeam) {
			throw new Error("Service Team not found");
		}

		if (data.serviceTeamCode) {
			delete data.serviceTeamCode;
		}

		return prisma.serviceTeam.update({
			where: { serviceTeamCode: serviceTeamCode },
			data,
		});
	}

	static async deleteServiceTeam(serviceTeamCode) {
		return prisma.serviceTeam.delete({
			where: { serviceTeamCode: serviceTeamCode },
		});
	}
}

module.exports = ServiceTeamService;
