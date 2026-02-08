const MarketingTeamService = require('../services/marketingTeamService');
const {
	validateMarketingTeam,
	validateMarketingTeamUpdate
} = require('../validations/marketingTeamValidation');

class MarketingTeamController {
	static async createMarketingTeam(req, res) {
		try {
			const { error } = validateMarketingTeam(req.body);
			if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

			const marketingTeam = await MarketingTeamService.createMarketingTeam(req.body);
			res.status(201).json(marketingTeam);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	static async getAllMarketingTeams(req, res) {
		try {
			const marketingTeams = await MarketingTeamService.getAllMarketingTeams();
			res.json(marketingTeams);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	static async getMarketingTeamById(req, res) {
		try {
			const marketingTeam = await MarketingTeamService.getMarketingTeamById(req.params.id);
			if (!marketingTeam) {
				return res.status(404).json({ error: 'Marketing Team not found' });
			}
			res.json(marketingTeam);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	static async updateMarketingTeam(req, res) {
		try {
			const { error } = validateMarketingTeamUpdate(req.body);
			if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

			const marketingTeam = await MarketingTeamService.updateMarketingTeam(req.params.id, req.body);
			if (!marketingTeam) {
				return res.status(404).json({ error: 'Marketing Team not found' });
			}
			res.json(marketingTeam);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	static async deleteMarketingTeam(req, res) {
		try {
			const marketingTeam = await MarketingTeamService.deleteMarketingTeam(req.params.id);
			if (!marketingTeam) {
				return res.status(404).json({ error: 'Marketing Team not found' });
			}
			res.json({ message: 'Marketing Team deleted successfully' });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}
}

module.exports = MarketingTeamController;