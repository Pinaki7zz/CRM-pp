const SalesTeamService = require('../services/salesTeamService');
const { 
  validateSalesTeam,
  validateSalesTeamUpdate 
} = require('../validations/salesTeamValidation');

class SalesTeamController {
  static async createSalesTeam(req, res) {
    try {
      const { error } = validateSalesTeam(req.body);
      if (error) throw new Error(error.details.map(detail => detail.message).join(', '));
      
      const salesTeam = await SalesTeamService.createSalesTeam(req.body);
      res.status(201).json(salesTeam);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAllSalesTeams(req, res) {
    try {
      const salesTeams = await SalesTeamService.getAllSalesTeams();
      res.json(salesTeams);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getSalesTeamById(req, res) {
    try {
      const salesTeam = await SalesTeamService.getSalesTeamById(req.params.id);
      if (!salesTeam) {
        return res.status(404).json({ error: 'Sales Team not found' });
      }
      res.json(salesTeam);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateSalesTeam(req, res) {
    try {
      const { error } = validateSalesTeamUpdate(req.body);
      if (error) throw new Error(error.details.map(detail => detail.message).join(', '));
      
      const salesTeam = await SalesTeamService.updateSalesTeam(req.params.id, req.body);
      if (!salesTeam) {
        return res.status(404).json({ error: 'Sales Team not found' });
      }
      res.json(salesTeam);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteSalesTeam(req, res) {
    try {
      const salesTeam = await SalesTeamService.deleteSalesTeam(req.params.id);
      if (!salesTeam) {
        return res.status(404).json({ error: 'Sales Team not found' });
      }
      res.json({ message: 'Sales Team deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = SalesTeamController;