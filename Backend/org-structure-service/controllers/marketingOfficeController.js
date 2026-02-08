const MarketingOfficeService = require("../services/marketingOfficeService");

class MarketingOfficeController {
	static async createMarketingOffice(req, res) {
		try {
			const { error } =
				require("../validations/marketingOfficeValidation").validateMarketingOffice(
					req.body
				);
			if (error)
				throw new Error(
					error.details.map((detail) => detail.message).join(", ")
				);

			const marketingOffice = await MarketingOfficeService.createMarketingOffice(req.body);
			res.status(201).json(marketingOffice);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	static async getAllMarketingOffices(req, res) {
		try {
			const marketingOffices = await MarketingOfficeService.getAllMarketingOffices();
			res.json(marketingOffices);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	static async getMarketingOfficeByCode(req, res) {
		try {
			const marketingOffice = await MarketingOfficeService.getMarketingOfficeByCode(
				req.params.code
			);
			if (!marketingOffice) {
				return res.status(404).json({ error: "Marketing Office not found" });
			}
			res.json(marketingOffice);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	static async updateMarketingOffice(req, res) {
		try {
			const { error } =
				require("../validations/marketingOfficeValidation").validateMarketingOfficeUpdate(
					req.body
				);
			if (error)
				throw new Error(
					error.details.map((detail) => detail.message).join(", ")
				);

			const marketingOffice = await MarketingOfficeService.updateMarketingOffice(
				req.params.code,
				req.body
			);
			if (!marketingOffice) {
				return res.status(404).json({ error: "Marketing Office not found" });
			}
			res.json(marketingOffice);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	static async deleteMarketingOffice(req, res) {
		try {
			await MarketingOfficeService.deleteMarketingOffice(req.params.code);
			res.json({ message: "Marketing Office deleted successfully" });
		} catch (error) {
			res.status(404).json({ error: error.message });
		}
	}

	// Relation Methods
	static async assignTeamPerson(req, res) {
		try {
			const { marketingTeamCode, marketingPersonId } = req.body;
			const marketingOfficeCode = req.params.code;
			const result = await MarketingOfficeService.assignTeamPerson(
				marketingOfficeCode,
				marketingTeamCode,
				marketingPersonId
			);
			res.json({ message: "Team person assigned successfully", data: result });
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	static async updateTeamPerson(req, res) {
		try {
			const { marketingTeamCode, marketingPersonId } = req.body;
			const marketingOfficeCode = req.params.code;
			console.log(
				"naksjcbkjasbckjbaskjcbaskjbcjask===================================>"
			);

			if (!marketingOfficeCode || !marketingTeamCode || !marketingPersonId) {
				return res.status(400).json({
					error:
						"Marketing office code, marketing team code, and marketing person ID are required",
				});
			}

			const result = await MarketingOfficeService.updateTeamPerson(
				marketingOfficeCode,
				marketingTeamCode,
				marketingPersonId
			);
			res.status(200).json({
				message: "Team person assignment saved successfully",
				data: result,
			});
		} catch (error) {
			console.error("Error in updateTeamPerson:", error);
			res
				.status(
					error.message === "Marketing Office not found" ||
						error.message === "Team person pair not found"
						? 404
						: 400
				)
				.json({
					error: error.message || "Failed to save assignment",
				});
		}
	}

	static async getTeamPersonsByOfficeCode(req, res) {
		try {
			const { code } = req.params;
			if (!code) {
				return res.status(400).json({ error: "Marketing office code is required" });
			}
			const teamPersons = await MarketingOfficeService.getTeamPersonsByOfficeCode(
				code
			);
			res.status(200).json(teamPersons);
		} catch (error) {
			console.error("Error in getTeamPersonsByOfficeCode:", error);
			res.status(error.message === "Marketing Office not found" ? 404 : 500).json({
				error: error.message || "Failed to fetch assignments for marketing office",
			});
		}
	}

	static async getAllAssignments(req, res) {
		try {
			const marketingOffices = await MarketingOfficeService.getAllAssignments();
			res.status(200).json(marketingOffices);
		} catch (error) {
			console.error("Error in getAllAssignments:", error);
			res.status(500).json({ error: "Failed to fetch assignments" });
		}
	}

	static async deleteTeamPersonPair(req, res) {
		try {
			const { marketingTeamCode, marketingPersonId } = req.body;
			const marketingOfficeCode = req.params.code;
			await MarketingOfficeService.deleteTeamPersonPair(
				marketingOfficeCode,
				marketingTeamCode,
				marketingPersonId
			);
			res.json({ message: "Team person pair deleted successfully" });
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}
}

module.exports = MarketingOfficeController;
