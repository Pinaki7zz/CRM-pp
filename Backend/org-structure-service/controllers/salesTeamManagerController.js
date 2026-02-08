const SalesTeamManagerService = require('../services/salesTeamManagerService');
const {
	validateSalesTeamManager,
	validateSalesTeamManagerUpdate
} = require('../validations/salesTeamManagerValidation');

class SalesTeamManagerController {
	static async createSalesTeamManager(req, res) {
		try {
			const { error } = validateSalesTeamManager(req.body);
			if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

			const salesTeamManagerData = {
				...req.body,
				validFrom: new Date(req.body.validFrom).toISOString(),
				validTo: req.body.validTo ? new Date(req.body.validTo).toISOString() : null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
			const salesTeamManager = await SalesTeamManagerService.createSalesTeamManager(salesTeamManagerData);
			res.status(201).json(salesTeamManager);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: error.message });
		}
	}

	static async getAllSalesTeamManagers(req, res) {
		try {
			const salesTeamManagers = await SalesTeamManagerService.getAllSalesTeamManagers();
			res.status(200).json(salesTeamManagers);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: error.message });
		}
	}

	static async getSalesTeamManagerById(req, res) {
		try {
			const salesTeamManager = await SalesTeamManagerService.getSalesTeamManagerById(req.params.id);
			if (!salesTeamManager) {
				return res.status(404).json({ error: 'Sales Team Manager not found' });
			}
			res.status(200).json(salesTeamManager);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: error.message });
		}
	}

	static async updateSalesTeamManager(req, res) {
		try {
			const { error } = validateSalesTeamManagerUpdate(req.body);
			if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

			const salesTeamManagerData = {
				...req.body,
				validFrom: new Date(req.body.validFrom).toISOString(),
				validTo: req.body.validTo ? new Date(req.body.validTo).toISOString() : null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
			const salesTeamManager = await SalesTeamManagerService.updateSalesTeamManager(req.params.id, salesTeamManagerData);
			if (!salesTeamManager) {
				return res.status(404).json({ error: 'Sales Team Manager not found' });
			}
			res.status(200).json(salesTeamManager);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: error.message });
		}
	}

	static async deleteSalesTeamManager(req, res) {
		try {
			const salesTeamManager = await SalesTeamManagerService.deleteSalesTeamManager(req.params.id);
			if (!salesTeamManager) {
				return res.status(404).json({ error: 'Sales Team Manager not found' });
			}
			res.status(204).json({ message: 'Sales Team Manager deleted successfully' });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: error.message });
		}
	}
}

module.exports = SalesTeamManagerController;