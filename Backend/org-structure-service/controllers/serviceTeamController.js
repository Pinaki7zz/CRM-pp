const ServiceTeamService = require('../services/serviceTeamService');
const {
	validateServiceTeam,
	validateServiceTeamUpdate
} = require('../validations/serviceTeamValidation');

class ServiceTeamController {
	static async createServiceTeam(req, res) {
		try {
			const { error } = validateServiceTeam(req.body);
			if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

			const serviceTeam = await ServiceTeamService.createServiceTeam(req.body);
			res.status(201).json(serviceTeam);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	static async getAllServiceTeams(req, res) {
		try {
			const serviceTeams = await ServiceTeamService.getAllServiceTeams();
			res.json(serviceTeams);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	static async getServiceTeamById(req, res) {
		try {
			const serviceTeam = await ServiceTeamService.getServiceTeamById(req.params.id);
			if (!serviceTeam) {
				return res.status(404).json({ error: 'Service Team not found' });
			}
			res.json(serviceTeam);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	static async updateServiceTeam(req, res) {
		try {
			const { error } = validateServiceTeamUpdate(req.body);
			if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

			const serviceTeam = await ServiceTeamService.updateServiceTeam(req.params.id, req.body);
			if (!serviceTeam) {
				return res.status(404).json({ error: 'Service Team not found' });
			}
			res.json(serviceTeam);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	static async deleteServiceTeam(req, res) {
		try {
			const serviceTeam = await ServiceTeamService.deleteServiceTeam(req.params.id);
			if (!serviceTeam) {
				return res.status(404).json({ error: 'Service Team not found' });
			}
			res.json({ message: 'Service Team deleted successfully' });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}
}

module.exports = ServiceTeamController;