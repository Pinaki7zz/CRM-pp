const MarketingTeamEmployeeService = require('../services/marketingTeamEmployeeService');
const {
	validateMarketingTeamEmployee,
	validateMarketingTeamEmployeeUpdate
} = require('../validations/marketingTeamEmployeeValidation');

class MarketingTeamEmployeeController {
	static async createMarketingTeamEmployee(req, res) {
		try {
			const { error } = validateMarketingTeamEmployee(req.body);
			if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

			const marketingTeamEmployeeData = {
				...req.body,
				validFrom: new Date(req.body.validFrom).toISOString(),
				validTo: req.body.validTo ? new Date(req.body.validTo).toISOString() : null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
			const marketingTeamEmployee = await MarketingTeamEmployeeService.createMarketingTeamEmployee(marketingTeamEmployeeData);
			res.status(201).json(marketingTeamEmployee);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: error.message });
		}
	}

	static async getAllMarketingTeamEmployees(req, res) {
		try {
			const marketingTeamEmployees = await MarketingTeamEmployeeService.getAllMarketingTeamEmployees();
			res.status(200).json(marketingTeamEmployees);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: error.message });
		}
	}

	static async getMarketingTeamEmployeeById(req, res) {
		try {
			const marketingTeamEmployee = await MarketingTeamEmployeeService.getMarketingTeamEmployeeById(req.params.id);
			if (!marketingTeamEmployee) {
				return res.status(404).json({ error: 'Marketing Team Employee not found' });
			}
			res.status(200).json(marketingTeamEmployee);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: error.message });
		}
	}

	static async updateMarketingTeamEmployee(req, res) {
		try {
			const { error } = validateMarketingTeamEmployeeUpdate(req.body);
			if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

			const marketingTeamEmployeeData = {
				...req.body,
				validFrom: new Date(req.body.validFrom).toISOString(),
				validTo: req.body.validTo ? new Date(req.body.validTo).toISOString() : null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
			const marketingTeamEmployee = await MarketingTeamEmployeeService.updateMarketingTeamEmployee(req.params.id, marketingTeamEmployeeData);
			if (!marketingTeamEmployee) {
				return res.status(404).json({ error: 'Marketing Team Employee not found' });
			}
			res.status(200).json(marketingTeamEmployee);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: error.message });
		}
	}

	static async deleteMarketingTeamEmployee(req, res) {
		try {
			const marketingTeamEmployee = await MarketingTeamEmployeeService.deleteMarketingTeamEmployee(req.params.id);
			if (!marketingTeamEmployee) {
				return res.status(404).json({ error: 'Marketing Team Employee not found' });
			}
			res.status(204).json({ message: 'Marketing Team Employee deleted successfully' });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: error.message });
		}
	}
}

module.exports = MarketingTeamEmployeeController;