const MarketingTeamManagerService = require('../services/marketingTeamManagerService');
const {
	validateMarketingTeamManager,
	validateMarketingTeamManagerUpdate
} = require('../validations/marketingTeamManagerValidation');

class MarketingTeamManagerController {
	static async createMarketingTeamManager(req, res) {
		try {
			const { error } = validateMarketingTeamManager(req.body);
			if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

			const marketingTeamManagerData = {
				...req.body,
				validFrom: new Date(req.body.validFrom).toISOString(),
				validTo: req.body.validTo ? new Date(req.body.validTo).toISOString() : null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
			const marketingTeamManager = await MarketingTeamManagerService.createMarketingTeamManager(marketingTeamManagerData);
			res.status(201).json(marketingTeamManager);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: error.message });
		}
	}

	static async getAllMarketingTeamManagers(req, res) {
		try {
			const marketingTeamManagers = await MarketingTeamManagerService.getAllMarketingTeamManagers();
			res.status(200).json(marketingTeamManagers);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: error.message });
		}
	}

	static async getMarketingTeamManagerById(req, res) {
		try {
			const marketingTeamManager = await MarketingTeamManagerService.getMarketingTeamManagerById(req.params.id);
			if (!marketingTeamManager) {
				return res.status(404).json({ error: 'Marketing Team Manager not found' });
			}
			res.status(200).json(marketingTeamManager);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: error.message });
		}
	}

	static async updateMarketingTeamManager(req, res) {
		try {
			const { error } = validateMarketingTeamManagerUpdate(req.body);
			if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

			const marketingTeamManagerData = {
				...req.body,
				validFrom: new Date(req.body.validFrom).toISOString(),
				validTo: req.body.validTo ? new Date(req.body.validTo).toISOString() : null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
			const marketingTeamManager = await MarketingTeamManagerService.updateMarketingTeamManager(req.params.id, marketingTeamManagerData);
			if (!marketingTeamManager) {
				return res.status(404).json({ error: 'Marketing Team Manager not found' });
			}
			res.status(200).json(marketingTeamManager);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: error.message });
		}
	}

	static async deleteMarketingTeamManager(req, res) {
		try {
			const marketingTeamManager = await MarketingTeamManagerService.deleteMarketingTeamManager(req.params.id);
			if (!marketingTeamManager) {
				return res.status(404).json({ error: 'Marketing Team Manager not found' });
			}
			res.status(204).json({ message: 'Marketing Team Manager deleted successfully' });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: error.message });
		}
	}
}

module.exports = MarketingTeamManagerController;