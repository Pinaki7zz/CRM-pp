const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class MarketingOfficeService {
	static async createMarketingOffice(data) {
		const { error } =
			require("../validations/marketingOfficeValidation").validateMarketingOffice(data);
		if (error)
			throw new Error(error.details.map((detail) => detail.message).join(", "));

		const existingOffice = await prisma.marketingOffice.findUnique({
			where: { marketingOfficeId: data.marketingOfficeId },
		});
		if (existingOffice) throw new Error("Marketing Office Code already exists");

		return prisma.marketingOffice.create({
			data: {
				marketingOfficeId: data.marketingOfficeId,
				organizationName: data.organizationName,
				marketingOfficeDesc: data.marketingOfficeDesc || null,
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

	static async getAllMarketingOffices() {
		return prisma.marketingOffice.findMany();
	}

	static async getMarketingOfficeByCode(marketingOfficeId) {
		const marketingOffice = await prisma.marketingOffice.findUnique({
			where: { marketingOfficeId },
		});
		if (!marketingOffice) throw new Error("Marketing Office not found");
		return marketingOffice;
	}

	static async updateMarketingOffice(marketingOfficeId, data) {
		const existingOffice = await prisma.marketingOffice.findUnique({
			where: { marketingOfficeId },
		});
		if (!existingOffice) throw new Error("Marketing Office not found");

		const { error } =
			require("../validations/marketingOfficeValidation").validateMarketingOfficeUpdate(
				data
			);
		if (error)
			throw new Error(error.details.map((detail) => detail.message).join(", "));

		if (data.marketingOfficeId)
			throw new Error("Marketing Office Code cannot be changed");

		return prisma.marketingOffice.update({
			where: { marketingOfficeId },
			data: {
				organizationName: data.organizationName,
				marketingOfficeDesc: data.marketingOfficeDesc || null,
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

	static async deleteMarketingOffice(marketingOfficeId) {
		const existingOffice = await prisma.marketingOffice.findUnique({
			where: { marketingOfficeId },
		});
		if (!existingOffice) throw new Error("Marketing Office not found");
		return prisma.marketingOffice.delete({ where: { marketingOfficeId } });
	}

	// Relation Methods
	static async assignTeamPerson(marketingOfficeId, marketingTeamCode, marketingPersonId) {
		const marketingOffice = await prisma.marketingOffice.findUnique({
			where: { marketingOfficeId },
		});
		if (!marketingOffice) throw new Error("Marketing Office not found");

		const marketingTeam = await prisma.marketingTeam.findUnique({
			where: { marketingTeamCode },
		});
		if (!marketingTeam) throw new Error("Marketing Team not found");

		const marketingPerson = await prisma.marketingPerson.findUnique({
			where: { marketingPersonId },
		});
		if (!marketingPerson) throw new Error("Marketing Person not found");

		const existingPair = await prisma.marketingOfficeTeamPersonPair.findUnique({
			where: {
				marketingOfficeId_marketingTeamCode_marketingPersonId: {
					marketingOfficeId,
					marketingTeamCode,
					marketingPersonId,
				},
			},
		});

		if (!existingPair) {
			return prisma.marketingOfficeTeamPersonPair.create({
				data: { marketingOfficeId, marketingTeamCode, marketingPersonId },
			});
		}
		return existingPair;
	}

	static async updateTeamPerson(marketingOfficeId, marketingTeamCode, marketingPersonId) {
		// Validate inputs
		if (!marketingOfficeId || !marketingTeamCode || !marketingPersonId) {
			throw new Error(
				"Marketing office code, marketing team code, and marketing person ID are required"
			);
		}

		// Trim inputs to avoid whitespace issues
		marketingOfficeId = marketingOfficeId.trim();
		marketingTeamCode = marketingTeamCode.trim();
		marketingPersonId = marketingPersonId.trim();

		// Validate all entities exist
		const [marketingOffice, marketingTeam, marketingPerson] = await Promise.all([
			prisma.marketingOffice.findUnique({ where: { marketingOfficeId } }),
			prisma.marketingTeam.findUnique({ where: { marketingTeamCode } }),
			prisma.marketingPerson.findUnique({ where: { marketingPersonId } }),
		]);

		if (!marketingOffice) throw new Error("Marketing Office not found");
		if (!marketingTeam) throw new Error("Marketing Team not found");
		if (!marketingPerson) throw new Error("Marketing Person not found");

		// Try to find existing pair for this office and team
		const existingPair = await prisma.marketingOfficeTeamPersonPair.findFirst({
			where: {
				marketingOfficeId,
				marketingTeamCode,
			},
		});

		let assignment;
		if (existingPair) {
			// UPDATE EXISTING RECORD
			assignment = await prisma.marketingOfficeTeamPersonPair.update({
				where: { id: existingPair.id },
				data: {
					marketingPersonId, // Just update the marketing person ID
				},
				include: {
					marketingTeam: true,
					marketingPerson: true,
				},
			});
			console.log("Updated existing assignment:", assignment);
		} else {
			// CREATE NEW RECORD
			assignment = await prisma.marketingOfficeTeamPersonPair.create({
				data: {
					marketingOfficeId,
					marketingTeamCode,
					marketingPersonId,
				},
				include: {
					marketingTeam: true,
					marketingPerson: true,
				},
			});
			console.log("Created new assignment:", assignment);
		}

		return {
			id: assignment.id,
			marketingOfficeId,
			marketingTeamCode: assignment.marketingTeam.marketingTeamCode,
			marketingPersonCode: assignment.marketingPerson.marketingPersonId,
		};
	}

	static async getTeamPersonsByOfficeCode(marketingOfficeId) {
		const marketingOffice = await prisma.marketingOffice.findUnique({
			where: { marketingOfficeId },
			include: {
				teamPersonPairs: { include: { marketingTeam: true, marketingPerson: true } },
			},
		});
		if (!marketingOffice) {
			throw new Error("Marketing Office not found");
		}
		return marketingOffice.teamPersonPairs.map((pair, index) => ({
			id: pair.id || `${marketingOfficeId}-${index}`, // Ensure unique ID
			marketingOfficeId,
			marketingTeamCode: pair.marketingTeam?.marketingTeamCode || "",
			marketingPersonCode:
				pair.marketingPerson?.marketingPersonCode ||
				pair.marketingPerson?.marketingPersonId ||
				"",
		}));
	}

	static async getAllAssignments() {
		const marketingOffices = await prisma.marketingOffice.findMany({
			include: {
				teamPersonPairs: { include: { marketingTeam: true, marketingPerson: true } },
			},
		});

		const assignments = marketingOffices.flatMap((office, officeIndex) =>
			(office.teamPersonPairs || []).map((pair, pairIndex) => ({
				id: pair.id || `${office.marketingOfficeId}-${officeIndex}-${pairIndex}`, // Ensure unique ID
				marketingOfficeId: office.marketingOfficeId || "",
				marketingTeamCode: pair.marketingTeam?.marketingTeamCode || "",
				marketingPersonCode:
					pair.marketingPerson?.marketingPersonCode ||
					pair.marketingPerson?.marketingPersonId ||
					"",
			}))
		);

		return assignments;
	}

	static async deleteTeamPersonPair(
		marketingOfficeId,
		marketingTeamCode,
		marketingPersonId
	) {
		const existingPair = await prisma.marketingOfficeTeamPersonPair.findUnique({
			where: {
				marketingOfficeId_marketingTeamCode_marketingPersonId: {
					marketingOfficeId,
					marketingTeamCode,
					marketingPersonId,
				},
			},
		});
		if (!existingPair) throw new Error("Team person pair not found");
		return prisma.marketingOfficeTeamPersonPair.delete({
			where: { id: existingPair.id },
		});
	}
}

module.exports = MarketingOfficeService;
