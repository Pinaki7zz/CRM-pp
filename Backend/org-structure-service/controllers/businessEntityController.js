const BusinessEntityService = require("../services/businessEntityService");

class BusinessEntityController {
  static async createBusinessEntity(req, res) {
    try {
      const businessEntity = await BusinessEntityService.createBusinessEntity(
        req.body
      );
      res.status(201).json(businessEntity);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateBusinessEntityByCode(req, res) {
    try {
      const businessEntity =
        await BusinessEntityService.updateBusinessEntityByCode(
          req.params.code,
          req.body
        );
      res.json(businessEntity);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getBusinessEntityByCode(req, res) {
    try {
      const businessEntity =
        await BusinessEntityService.getBusinessEntityByCode(req.params.code);
      res.json(businessEntity);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async getAllBusinessEntities(req, res) {
    try {
      const businessEntities =
        await BusinessEntityService.getAllBusinessEntities();
      res.json(businessEntities);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteBusinessEntityByCode(req, res) {
    try {
      await BusinessEntityService.deleteBusinessEntityByCode(req.params.code);
      res.json({ message: "Business Entity deleted successfully" });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async assignUnits(req, res) {
    try {
      const { businessUnitCode, factoryUnitCode } = req.body;
      const businessEntityCode = req.params.code;
      const result = await BusinessEntityService.assignUnits(
        businessEntityCode,
        businessUnitCode,
        factoryUnitCode
      );
      res.json({ message: "Units assigned successfully", data: result });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateUnits(req, res) {
    try {
      const { businessUnitCode, factoryUnitCode } = req.body;
      const businessEntityCode = req.params.code;
      const result = await BusinessEntityService.updateUnits(
        businessEntityCode,
        businessUnitCode,
        factoryUnitCode
      );
      res.json({ message: "Units updated successfully", data: result });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getUnitsByEntityCode(req, res) {
    try {
      const units = await BusinessEntityService.getUnitsByEntityCode(
        req.params.code
      );
      res.json(units);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async deleteUnitPair(req, res) {
    try {
      const { businessUnitCode, factoryUnitCode } = req.body;
      const businessEntityCode = req.params.code;
      await BusinessEntityService.deleteUnitPair(
        businessEntityCode,
        businessUnitCode,
        factoryUnitCode
      );
      res.json({ message: "Unit pair deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = BusinessEntityController;
