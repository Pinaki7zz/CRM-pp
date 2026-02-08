const ServiceOfficeService = require("../services/serviceOfficeService");

class ServiceOfficeController {
	static async createServiceOffice(req, res) {
		try {
			const { error } =
				require("../validations/serviceOfficeValidation").validateServiceOffice(
					req.body
				);
			if (error)
				throw new Error(
					error.details.map((detail) => detail.message).join(", ")
				);

			const serviceOffice = await ServiceOfficeService.createServiceOffice(req.body);
			res.status(201).json(serviceOffice);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	static async getAllServiceOffices(req, res) {
		try {
			const serviceOffices = await ServiceOfficeService.getAllServiceOffices();
			res.json(serviceOffices);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	static async getServiceOfficeByCode(req, res) {
		try {
			const serviceOffice = await ServiceOfficeService.getServiceOfficeByCode(
				req.params.code
			);
			if (!serviceOffice) {
				return res.status(404).json({ error: "Service Office not found" });
			}
			res.json(serviceOffice);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	static async updateServiceOffice(req, res) {
		try {
			const { error } =
				require("../validations/serviceOfficeValidation").validateServiceOfficeUpdate(
					req.body
				);
			if (error)
				throw new Error(
					error.details.map((detail) => detail.message).join(", ")
				);

			const serviceOffice = await ServiceOfficeService.updateServiceOffice(
				req.params.code,
				req.body
			);
			if (!serviceOffice) {
				return res.status(404).json({ error: "Service Office not found" });
			}
			res.json(serviceOffice);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	static async deleteServiceOffice(req, res) {
		try {
			await ServiceOfficeService.deleteServiceOffice(req.params.code);
			res.json({ message: "Service Office deleted successfully" });
		} catch (error) {
			res.status(404).json({ error: error.message });
		}
	}

	// Relation Methods
	static async assignTeamPerson(req, res) {
		try {
			const { serviceTeamCode, servicePersonId } = req.body;
			const serviceOfficeCode = req.params.code;
			const result = await ServiceOfficeService.assignTeamPerson(
				serviceOfficeCode,
				serviceTeamCode,
				servicePersonId
			);
			res.json({ message: "Team person assigned successfully", data: result });
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	static async updateTeamPerson(req, res) {
		try {
			const { serviceTeamCode, servicePersonId } = req.body;
			const serviceOfficeCode = req.params.code;
			console.log(
				"naksjcbkjasbckjbaskjcbaskjbcjask===================================>"
			);

			if (!serviceOfficeCode || !serviceTeamCode || !servicePersonId) {
				return res.status(400).json({
					error:
						"Service office code, service team code, and service person ID are required",
				});
			}

			const result = await ServiceOfficeService.updateTeamPerson(
				serviceOfficeCode,
				serviceTeamCode,
				servicePersonId
			);
			res.status(200).json({
				message: "Team person assignment saved successfully",
				data: result,
			});
		} catch (error) {
			console.error("Error in updateTeamPerson:", error);
			res
				.status(
					error.message === "Service Office not found" ||
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
				return res.status(400).json({ error: "Service office code is required" });
			}
			const teamPersons = await ServiceOfficeService.getTeamPersonsByOfficeCode(
				code
			);
			res.status(200).json(teamPersons);
		} catch (error) {
			console.error("Error in getTeamPersonsByOfficeCode:", error);
			res.status(error.message === "Service Office not found" ? 404 : 500).json({
				error: error.message || "Failed to fetch assignments for service office",
			});
		}
	}

	static async getAllAssignments(req, res) {
		try {
			const serviceOffices = await ServiceOfficeService.getAllAssignments();
			res.status(200).json(serviceOffices);
		} catch (error) {
			console.error("Error in getAllAssignments:", error);
			res.status(500).json({ error: "Failed to fetch assignments" });
		}
	}

	static async deleteTeamPersonPair(req, res) {
		try {
			const { serviceTeamCode, servicePersonId } = req.body;
			const serviceOfficeCode = req.params.code;
			await ServiceOfficeService.deleteTeamPersonPair(
				serviceOfficeCode,
				serviceTeamCode,
				servicePersonId
			);
			res.json({ message: "Team person pair deleted successfully" });
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}
}

module.exports = ServiceOfficeController;
