const SalesOfficeService = require("../services/salesOfficeService");

class SalesOfficeController {
  static async createSalesOffice(req, res) {
    try {
      const { error } =
        require("../validations/salesOfficeValidation").validateSalesOffice(
          req.body
        );
      if (error)
        throw new Error(
          error.details.map((detail) => detail.message).join(", ")
        );

      const salesOffice = await SalesOfficeService.createSalesOffice(req.body);
      res.status(201).json(salesOffice);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAllSalesOffices(req, res) {
    try {
      const salesOffices = await SalesOfficeService.getAllSalesOffices();
      res.json(salesOffices);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getSalesOfficeByCode(req, res) {
    try {
      const salesOffice = await SalesOfficeService.getSalesOfficeByCode(
        req.params.code
      );
      if (!salesOffice) {
        return res.status(404).json({ error: "Sales Office not found" });
      }
      res.json(salesOffice);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateSalesOffice(req, res) {
    try {
      const { error } =
        require("../validations/salesOfficeValidation").validateSalesOfficeUpdate(
          req.body
        );
      if (error)
        throw new Error(
          error.details.map((detail) => detail.message).join(", ")
        );

      const salesOffice = await SalesOfficeService.updateSalesOffice(
        req.params.code,
        req.body
      );
      if (!salesOffice) {
        return res.status(404).json({ error: "Sales Office not found" });
      }
      res.json(salesOffice);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteSalesOffice(req, res) {
    try {
      await SalesOfficeService.deleteSalesOffice(req.params.code);
      res.json({ message: "Sales Office deleted successfully" });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Relation Methods
  static async assignTeamPerson(req, res) {
    try {
      const { salesTeamCode, salesPersonId } = req.body;
      const salesOfficeId = req.params.code;
      const result = await SalesOfficeService.assignTeamPerson(
        salesOfficeId,
        salesTeamCode,
        salesPersonId
      );
      res.json({ message: "Team person assigned successfully", data: result });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateTeamPerson(req, res) {
    try {
      const { salesTeamCode, salesPersonId } = req.body;
      const salesOfficeId = req.params.code;

      if (!salesOfficeId || !salesTeamCode || !salesPersonId) {
        return res.status(400).json({
          error:
            "Sales office code, sales team code, and sales person ID are required",
        });
      }

      const result = await SalesOfficeService.updateTeamPerson(
        salesOfficeId,
        salesTeamCode,
        salesPersonId
      );
      res.status(200).json({
        message: "Team person assignment saved successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in updateTeamPerson:", error);
      res
        .status(
          error.message === "Sales Office not found" ||
            error.message === "Team person pair not found"
            ? 404
            : 400
        )
        .json({
          error: error.message || "Failed to save assignment",
        });
    }
  }

  static async getTeamPersonsByOfficeCode(req, res) {
    try {
      const { code } = req.params;
      if (!code) {
        return res.status(400).json({ error: "Sales office code is required" });
      }
      const teamPersons = await SalesOfficeService.getTeamPersonsByOfficeCode(
        code
      );
      res.status(200).json(teamPersons);
    } catch (error) {
      console.error("Error in getTeamPersonsByOfficeCode:", error);
      res.status(error.message === "Sales Office not found" ? 404 : 500).json({
        error: error.message || "Failed to fetch assignments for sales office",
      });
    }
  }

  static async getAllAssignments(req, res) {
    try {
      const salesOffices = await SalesOfficeService.getAllAssignments();
      res.status(200).json(salesOffices);
    } catch (error) {
      console.error("Error in getAllAssignments:", error);
      res.status(500).json({ error: "Failed to fetch assignments" });
    }
  }

  static async deleteTeamPersonPair(req, res) {
    try {
      const { salesTeamCode, salesPersonId } = req.body;
      const salesOfficeId = req.params.code;
      await SalesOfficeService.deleteTeamPersonPair(
        salesOfficeId,
        salesTeamCode,
        salesPersonId
      );
      res.json({ message: "Team person pair deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = SalesOfficeController;
