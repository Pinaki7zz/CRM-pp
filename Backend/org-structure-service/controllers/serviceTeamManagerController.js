const ServiceTeamManagerService = require('../services/serviceTeamManagerService');
const {
	validateServiceTeamManager,
	validateServiceTeamManagerUpdate
} = require('../validations/serviceTeamManagerValidation');

class ServiceTeamManagerController {
	static async createServiceTeamManager(req, res) {
		try {
			const { error } = validateServiceTeamManager(req.body);
			if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

			const serviceTeamManagerData = {
				...req.body,
				validFrom: new Date(req.body.validFrom).toISOString(),
				validTo: req.body.validTo ? new Date(req.body.validTo).toISOString() : null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
			const serviceTeamManager = await ServiceTeamManagerService.createServiceTeamManager(serviceTeamManagerData);
			res.status(201).json(serviceTeamManager);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: error.message });
		}
	}

	static async getAllServiceTeamManagers(req, res) {
		try {
			const serviceTeamManagers = await ServiceTeamManagerService.getAllServiceTeamManagers();
			res.status(200).json(serviceTeamManagers);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: error.message });
		}
	}

	static async getServiceTeamManagerById(req, res) {
		try {
			const serviceTeamManager = await ServiceTeamManagerService.getServiceTeamManagerById(req.params.id);
			if (!serviceTeamManager) {
				return res.status(404).json({ error: 'Service Team Manager not found' });
			}
			res.status(200).json(serviceTeamManager);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: error.message });
		}
	}

	static async updateServiceTeamManager(req, res) {
		try {
			const { error } = validateServiceTeamManagerUpdate(req.body);
			if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

			const serviceTeamManagerData = {
				...req.body,
				validFrom: new Date(req.body.validFrom).toISOString(),
				validTo: req.body.validTo ? new Date(req.body.validTo).toISOString() : null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
			const serviceTeamManager = await ServiceTeamManagerService.updateServiceTeamManager(req.params.id, serviceTeamManagerData);
			if (!serviceTeamManager) {
				return res.status(404).json({ error: 'Service Team Manager not found' });
			}
			res.status(200).json(serviceTeamManager);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: error.message });
		}
	}

	static async deleteServiceTeamManager(req, res) {
		try {
			const serviceTeamManager = await ServiceTeamManagerService.deleteServiceTeamManager(req.params.id);
			if (!serviceTeamManager) {
				return res.status(404).json({ error: 'Service Team Manager not found' });
			}
			res.status(204).json({ message: 'Service Team Manager deleted successfully' });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: error.message });
		}
	}
}

module.exports = ServiceTeamManagerController;