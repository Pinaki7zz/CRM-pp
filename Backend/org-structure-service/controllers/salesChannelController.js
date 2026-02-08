const SalesChannelService = require('../services/salesChannelService');
const {
  validateSalesChannel,
  validateSalesChannelUpdate
} = require('../validations/salesChannelValidation');

class SalesChannelController {
  static async createSalesChannel(req, res) {
    try {
      const { error } = validateSalesChannel(req.body);
      if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

      const salesChannel = await SalesChannelService.createSalesChannel(req.body);
      res.status(201).json(salesChannel);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAllSalesChannels(req, res) {
    try {
      const salesChannels = await SalesChannelService.getAllSalesChannels();
      res.json(salesChannels);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getSalesChannelById(req, res) {
    try {
      const salesChannel = await SalesChannelService.getSalesChannelById(req.params.salesChannelCode);
      if (!salesChannel) {
        return res.status(404).json({ error: 'Sales Channel not found' });
      }
      res.json(salesChannel);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateSalesChannelById(req, res) {
    try {
      const { error } = validateSalesChannelUpdate(req.body);
      if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

      const salesChannel = await SalesChannelService.updateSalesChannelById(req.params.salesChannelCode, req.body);
      if (!salesChannel) {
        return res.status(404).json({ error: 'Sales Channel not found' });
      }
      res.json(salesChannel);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteSalesChannelById(req, res) {
    try {
      const salesChannel = await SalesChannelService.deleteSalesChannelById(req.params.salesChannelCode);
      if (!salesChannel) {
        return res.status(404).json({ error: 'Sales Channel not found' });
      }
      res.json({ message: 'Sales Channel deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = SalesChannelController;