const ServiceChannelService = require('../services/serviceChannelService');
const {
	validateServiceChannel,
	validateServiceChannelUpdate
} = require('../validations/serviceChannelValidation');

class ServiceChannelController {
	static async createServiceChannel(req, res) {
		try {
			const { error } = validateServiceChannel(req.body);
			if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

			const serviceChannel = await ServiceChannelService.createServiceChannel(req.body);
			res.status(201).json(serviceChannel);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	static async getAllServiceChannels(req, res) {
		try {
			const serviceChannels = await ServiceChannelService.getAllServiceChannels();
			res.json(serviceChannels);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	static async getServiceChannelById(req, res) {
		try {
			const serviceChannel = await ServiceChannelService.getServiceChannelById(req.params.serviceChannelCode);
			if (!serviceChannel) {
				return res.status(404).json({ error: 'Service Channel not found' });
			}
			res.json(serviceChannel);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	static async updateServiceChannelById(req, res) {
		try {
			const { error } = validateServiceChannelUpdate(req.body);
			if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

			const serviceChannel = await ServiceChannelService.updateServiceChannelById(req.params.serviceChannelCode, req.body);
			if (!serviceChannel) {
				return res.status(404).json({ error: 'Service Channel not found' });
			}
			res.json(serviceChannel);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	static async deleteServiceChannelById(req, res) {
		try {
			const serviceChannel = await ServiceChannelService.deleteServiceChannelById(req.params.serviceChannelCode);
			if (!serviceChannel) {
				return res.status(404).json({ error: 'Service Channel not found' });
			}
			res.json({ message: 'Service Channel deleted successfully' });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}
}

module.exports = ServiceChannelController;