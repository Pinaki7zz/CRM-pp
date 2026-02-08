const SalesTeamEmployeeService = require('../services/salesTeamEmployeeService');
const {
	validateSalesTeamEmployee,
	validateSalesTeamEmployeeUpdate
} = require('../validations/salesTeamEmployeeValidation');

class SalesTeamEmployeeController {
	static async createSalesTeamEmployee(req, res) {
		try {
			const { error } = validateSalesTeamEmployee(req.body);
			if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

			const salesTeamEmployeeData = {
				...req.body,
				validFrom: new Date(req.body.validFrom).toISOString(),
				validTo: req.body.validTo ? new Date(req.body.validTo).toISOString() : null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
			const salesTeamEmployee = await SalesTeamEmployeeService.createSalesTeamEmployee(salesTeamEmployeeData);
			res.status(201).json(salesTeamEmployee);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: error.message });
		}
	}

	static async getAllSalesTeamEmployees(req, res) {
		try {
			const salesTeamEmployees = await SalesTeamEmployeeService.getAllSalesTeamEmployees();
			res.status(200).json(salesTeamEmployees);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: error.message });
		}
	}

	static async getSalesTeamEmployeeById(req, res) {
		try {
			const salesTeamEmployee = await SalesTeamEmployeeService.getSalesTeamEmployeeById(req.params.id);
			if (!salesTeamEmployee) {
				return res.status(404).json({ error: 'Sales Team Employee not found' });
			}
			res.status(200).json(salesTeamEmployee);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: error.message });
		}
	}

	static async updateSalesTeamEmployee(req, res) {
		try {
			const { error } = validateSalesTeamEmployeeUpdate(req.body);
			if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

			const salesTeamEmployeeData = {
				...req.body,
				validFrom: new Date(req.body.validFrom).toISOString(),
				validTo: req.body.validTo ? new Date(req.body.validTo).toISOString() : null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
			const salesTeamEmployee = await SalesTeamEmployeeService.updateSalesTeamEmployee(req.params.id, salesTeamEmployeeData);
			if (!salesTeamEmployee) {
				return res.status(404).json({ error: 'Sales Team Employee not found' });
			}
			res.status(200).json(salesTeamEmployee);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: error.message });
		}
	}

	static async deleteSalesTeamEmployee(req, res) {
		try {
			const salesTeamEmployee = await SalesTeamEmployeeService.deleteSalesTeamEmployee(req.params.id);
			if (!salesTeamEmployee) {
				return res.status(404).json({ error: 'Sales Team Employee not found' });
			}
			res.status(204).json({ message: 'Sales Team Employee deleted successfully' });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: error.message });
		}
	}
}

module.exports = SalesTeamEmployeeController;