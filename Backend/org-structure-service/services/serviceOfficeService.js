const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ServiceOfficeService {
	static async createServiceOffice(data) {
		const { error } =
			require("../validations/serviceOfficeValidation").validateServiceOffice(data);
		if (error)
			throw new Error(error.details.map((detail) => detail.message).join(", "));

		const existingOffice = await prisma.serviceOffice.findUnique({
			where: { serviceOfficeId: data.serviceOfficeId },
		});
		if (existingOffice) throw new Error("Service Office Code already exists");

		return prisma.serviceOffice.create({
			data: {
				serviceOfficeId: data.serviceOfficeId,
				organizationName: data.organizationName,
				serviceOfficeDesc: data.serviceOfficeDesc || null,
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

	static async getAllServiceOffices() {
		return prisma.serviceOffice.findMany();
	}

	static async getServiceOfficeByCode(serviceOfficeId) {
		const serviceOffice = await prisma.serviceOffice.findUnique({
			where: { serviceOfficeId },
		});
		if (!serviceOffice) throw new Error("Service Office not found");
		return serviceOffice;
	}

	static async updateServiceOffice(serviceOfficeId, data) {
		const existingOffice = await prisma.serviceOffice.findUnique({
			where: { serviceOfficeId },
		});
		if (!existingOffice) throw new Error("Service Office not found");

		const { error } =
			require("../validations/serviceOfficeValidation").validateServiceOfficeUpdate(
				data
			);
		if (error)
			throw new Error(error.details.map((detail) => detail.message).join(", "));

		if (data.serviceOfficeId)
			throw new Error("Service Office Code cannot be changed");

		return prisma.serviceOffice.update({
			where: { serviceOfficeId },
			data: {
				organizationName: data.organizationName,
				serviceOfficeDesc: data.serviceOfficeDesc || null,
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

	static async deleteServiceOffice(serviceOfficeId) {
		const existingOffice = await prisma.serviceOffice.findUnique({
			where: { serviceOfficeId },
		});
		if (!existingOffice) throw new Error("Service Office not found");
		return prisma.serviceOffice.delete({ where: { serviceOfficeId } });
	}

	// Relation Methods
	static async assignTeamPerson(serviceOfficeId, serviceTeamCode, servicePersonId) {
		const serviceOffice = await prisma.serviceOffice.findUnique({
			where: { serviceOfficeId },
		});
		if (!serviceOffice) throw new Error("Service Office not found");

		const serviceTeam = await prisma.serviceTeam.findUnique({
			where: { serviceTeamCode },
		});
		if (!serviceTeam) throw new Error("Service Team not found");

		const servicePerson = await prisma.servicePerson.findUnique({
			where: { servicePersonId },
		});
		if (!servicePerson) throw new Error("Service Person not found");

		const existingPair = await prisma.serviceOfficeTeamPersonPair.findUnique({
			where: {
				serviceOfficeId_serviceTeamCode_servicePersonId: {
					serviceOfficeId,
					serviceTeamCode,
					servicePersonId,
				},
			},
		});

		if (!existingPair) {
			return prisma.serviceOfficeTeamPersonPair.create({
				data: { serviceOfficeId, serviceTeamCode, servicePersonId },
			});
		}
		return existingPair;
	}

	static async updateTeamPerson(serviceOfficeId, serviceTeamCode, servicePersonId) {
		// Validate inputs
		if (!serviceOfficeId || !serviceTeamCode || !servicePersonId) {
			throw new Error(
				"Service office code, service team code, and service person ID are required"
			);
		}

		// Trim inputs to avoid whitespace issues
		serviceOfficeId = serviceOfficeId.trim();
		serviceTeamCode = serviceTeamCode.trim();
		servicePersonId = servicePersonId.trim();

		// Validate all entities exist
		const [serviceOffice, serviceTeam, servicePerson] = await Promise.all([
			prisma.serviceOffice.findUnique({ where: { serviceOfficeId } }),
			prisma.serviceTeam.findUnique({ where: { serviceTeamCode } }),
			prisma.servicePerson.findUnique({ where: { servicePersonId } }),
		]);

		if (!serviceOffice) throw new Error("Service Office not found");
		if (!serviceTeam) throw new Error("Service Team not found");
		if (!servicePerson) throw new Error("Service Person not found");

		// Try to find existing pair for this office and team
		const existingPair = await prisma.serviceOfficeTeamPersonPair.findFirst({
			where: {
				serviceOfficeId,
				serviceTeamCode,
			},
		});

		let assignment;
		if (existingPair) {
			// UPDATE EXISTING RECORD
			assignment = await prisma.serviceOfficeTeamPersonPair.update({
				where: { id: existingPair.id },
				data: {
					servicePersonId, // Just update the service person ID
				},
				include: {
					serviceTeam: true,
					servicePerson: true,
				},
			});
			console.log("Updated existing assignment:", assignment);
		} else {
			// CREATE NEW RECORD
			assignment = await prisma.serviceOfficeTeamPersonPair.create({
				data: {
					serviceOfficeId,
					serviceTeamCode,
					servicePersonId,
				},
				include: {
					serviceTeam: true,
					servicePerson: true,
				},
			});
			console.log("Created new assignment:", assignment);
		}

		return {
			id: assignment.id,
			serviceOfficeId,
			serviceTeamCode: assignment.serviceTeam.serviceTeamCode,
			servicePersonCode: assignment.servicePerson.servicePersonId,
		};
	}

	static async getTeamPersonsByOfficeCode(serviceOfficeId) {
		const serviceOffice = await prisma.serviceOffice.findUnique({
			where: { serviceOfficeId },
			include: {
				teamPersonPairs: { include: { serviceTeam: true, servicePerson: true } },
			},
		});
		if (!serviceOffice) {
			throw new Error("Service Office not found");
		}
		return serviceOffice.teamPersonPairs.map((pair, index) => ({
			id: pair.id || `${serviceOfficeId}-${index}`, // Ensure unique ID
			serviceOfficeId,
			serviceTeamCode: pair.serviceTeam?.serviceTeamCode || "",
			servicePersonCode:
				pair.servicePerson?.servicePersonCode ||
				pair.servicePerson?.servicePersonId ||
				"",
		}));
	}

	static async getAllAssignments() {
		const serviceOffices = await prisma.serviceOffice.findMany({
			include: {
				teamPersonPairs: { include: { serviceTeam: true, servicePerson: true } },
			},
		});

		const assignments = serviceOffices.flatMap((office, officeIndex) =>
			(office.teamPersonPairs || []).map((pair, pairIndex) => ({
				id: pair.id || `${office.serviceOfficeId}-${officeIndex}-${pairIndex}`, // Ensure unique ID
				serviceOfficeId: office.serviceOfficeId || "",
				serviceTeamCode: pair.serviceTeam?.serviceTeamCode || "",
				servicePersonCode:
					pair.servicePerson?.servicePersonCode ||
					pair.servicePerson?.servicePersonId ||
					"",
			}))
		);

		return assignments;
	}

	static async deleteTeamPersonPair(
		serviceOfficeId,
		serviceTeamCode,
		servicePersonId
	) {
		const existingPair = await prisma.serviceOfficeTeamPersonPair.findUnique({
			where: {
				serviceOfficeId_serviceTeamCode_servicePersonId: {
					serviceOfficeId,
					serviceTeamCode,
					servicePersonId,
				},
			},
		});
		if (!existingPair) throw new Error("Team person pair not found");
		return prisma.serviceOfficeTeamPersonPair.delete({
			where: { id: existingPair.id },
		});
	}
}

module.exports = ServiceOfficeService;
