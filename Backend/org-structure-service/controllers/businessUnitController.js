
const BusinessUnitService = require('../services/businessUnitService');

class BusinessUnitController {
  static async createBusinessUnit(req, res) {
    try {
      const businessUnit = await BusinessUnitService.createBusinessUnit(req.body);
      res.status(201).json(businessUnit);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }

  static async updateBusinessUnitByCode(req, res) {
    try {
      const businessUnit = await BusinessUnitService.updateBusinessUnitByCode(req.params.code, req.body);
      res.json(businessUnit);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getBusinessUnitByCode(req, res) {
    try {
      const businessUnit = await BusinessUnitService.getBusinessUnitByCode(req.params.code);
      res.json(businessUnit);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async getAllBusinessUnits(req, res) {
    try {
      const businessUnits = await BusinessUnitService.getAllBusinessUnits();
      res.json(businessUnits);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteBusinessUnitByCode(req, res) {
    try {
      await BusinessUnitService.deleteBusinessUnitByCode(req.params.code);
      res.json({ message: 'Business Unit deleted successfully' });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async assignChannelOffice(req, res) {
    try {
      const { salesChannelId, salesOfficeCode } = req.body;
      const businessUnitCode = req.params.code;
      const result = await BusinessUnitService.assignChannelOffice(businessUnitCode, salesChannelId, salesOfficeCode);
      res.json({ message: 'Channel and office assigned successfully', data: result });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateChannelOffice(req, res) {
    try {
      let assignments;
      if (req.body.assignments) {
        assignments = Array.isArray(req.body.assignments) ? req.body.assignments : [req.body.assignments];
      } else if (req.body.salesChannelId && req.body.salesOfficeCode) {
        assignments = [{ salesChannelId: req.body.salesChannelId, salesOfficeCode: req.body.salesOfficeCode }];
      } else {
        throw new Error('Invalid request body: Expected assignments array or salesChannelId/salesOfficeCode object');
      }
      const businessUnitCode = req.params.code;
      const result = await BusinessUnitService.updateChannelOffice(businessUnitCode, assignments);
      res.json({ message: result.message, success: result.success });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getChannelOfficesByUnitCode(req, res) {
    try {
      const channelOffices = await BusinessUnitService.getChannelOfficesByUnitCode(req.params.code);
      res.json(channelOffices);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async deleteChannelOfficePair(req, res) {
    try {
      const { salesChannelId, salesOfficeCode } = req.body;
      const businessUnitCode = req.params.code;
      await BusinessUnitService.deleteChannelOfficePair(businessUnitCode, salesChannelId, salesOfficeCode);
      res.json({ message: 'Channel office pair deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = BusinessUnitController;