const ServiceTeamEmployeeService = require('../services/serviceTeamEmployeeService');
const {
	validateServiceTeamEmployee,
	validateServiceTeamEmployeeUpdate
} = require('../validations/serviceTeamEmployeeValidation');

class ServiceTeamEmployeeController {
	static async createServiceTeamEmployee(req, res) {
		try {
			const { error } = validateServiceTeamEmployee(req.body);
			if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

			const serviceTeamEmployeeData = {
				...req.body,
				validFrom: new Date(req.body.validFrom).toISOString(),
				validTo: req.body.validTo ? new Date(req.body.validTo).toISOString() : null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
			const serviceTeamEmployee = await ServiceTeamEmployeeService.createServiceTeamEmployee(serviceTeamEmployeeData);
			res.status(201).json(serviceTeamEmployee);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: error.message });
		}
	}

	static async getAllServiceTeamEmployees(req, res) {
		try {
			const serviceTeamEmployees = await ServiceTeamEmployeeService.getAllServiceTeamEmployees();
			res.status(200).json(serviceTeamEmployees);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: error.message });
		}
	}

	static async getServiceTeamEmployeeById(req, res) {
		try {
			const serviceTeamEmployee = await ServiceTeamEmployeeService.getServiceTeamEmployeeById(req.params.id);
			if (!serviceTeamEmployee) {
				return res.status(404).json({ error: 'Service Team Employee not found' });
			}
			res.status(200).json(serviceTeamEmployee);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: error.message });
		}
	}

	static async updateServiceTeamEmployee(req, res) {
		try {
			const { error } = validateServiceTeamEmployeeUpdate(req.body);
			if (error) throw new Error(error.details.map(detail => detail.message).join(', '));

			const serviceTeamEmployeeData = {
				...req.body,
				validFrom: new Date(req.body.validFrom).toISOString(),
				validTo: req.body.validTo ? new Date(req.body.validTo).toISOString() : null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
			const serviceTeamEmployee = await ServiceTeamEmployeeService.updateServiceTeamEmployee(req.params.id, serviceTeamEmployeeData);
			if (!serviceTeamEmployee) {
				return res.status(404).json({ error: 'Service Team Employee not found' });
			}
			res.status(200).json(serviceTeamEmployee);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: error.message });
		}
	}

	static async deleteServiceTeamEmployee(req, res) {
		try {
			const serviceTeamEmployee = await ServiceTeamEmployeeService.deleteServiceTeamEmployee(req.params.id);
			if (!serviceTeamEmployee) {
				return res.status(404).json({ error: 'Service Team Employee not found' });
			}
			res.status(204).json({ message: 'Service Team Employee deleted successfully' });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: error.message });
		}
	}
}

module.exports = ServiceTeamEmployeeController;