const MarketingChannelService = require('../services/marketingChannelService');
const {
	validateMarketingChannel,
	validateMarketingChannelUpdate
} = require('../validations/marketingChannelValidation');

class MarketingChannelController {
	static async createMarketingChannel(req, res) {
		try {
			console.log(req.body)
			const { error } = validateMarketingChannel(req.body);
			if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

			const marketingChannel = await MarketingChannelService.createMarketingChannel(req.body);
			res.status(201).json(marketingChannel);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: error.message });
		}
	}

	static async getAllMarketingChannels(req, res) {
		try {
			const marketingChannels = await MarketingChannelService.getAllMarketingChannels();
			res.json(marketingChannels);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	static async getMarketingChannelById(req, res) {
		try {
			const marketingChannel = await MarketingChannelService.getMarketingChannelById(req.params.marketingChannelCode);
			if (!marketingChannel) {
				return res.status(404).json({ error: 'Marketing Channel not found' });
			}
			res.json(marketingChannel);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	static async updateMarketingChannelById(req, res) {
		try {
			const { error } = validateMarketingChannelUpdate(req.body);
			if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

			const marketingChannel = await MarketingChannelService.updateMarketingChannelById(req.params.marketingChannelCode, req.body);
			if (!marketingChannel) {
				return res.status(404).json({ error: 'Marketing Channel not found' });
			}
			res.json(marketingChannel);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	static async deleteMarketingChannelById(req, res) {
		try {
			const marketingChannel = await MarketingChannelService.deleteMarketingChannelById(req.params.marketingChannelCode);
			if (!marketingChannel) {
				return res.status(404).json({ error: 'Marketing Channel not found' });
			}
			res.json({ message: 'Marketing Channel deleted successfully' });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}
}

module.exports = MarketingChannelController;