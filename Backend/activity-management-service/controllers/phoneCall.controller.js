const phoneCallService = require('../services/phoneCall.service');
const { validationResult } = require('express-validator');

class PhoneCallController {
  // Get all phone calls
  async getAllPhoneCalls(req, res) {
    try {
      const { page = 1, limit = 10, status, callFor, owner } = req.query;
      const filters = { status, callFor, owner };
      
      const result = await phoneCallService.getAllPhoneCalls(
        parseInt(page), 
        parseInt(limit), 
        filters
      );
      
      res.status(200).json({
        success: true,
        data: result.phoneCalls,
        pagination: {
          currentPage: parseInt(page),
          totalPages: result.totalPages,
          totalRecords: result.totalRecords
        }
      });
    } catch (error) {
      console.error('Error in getAllPhoneCalls:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching phone calls',
        error: error.message
      });
    }
  }

  // Get phone call by ID
  async getPhoneCallById(req, res) {
    try {
      const { id } = req.params;
      const phoneCall = await phoneCallService.getPhoneCallById(id);
      
      if (!phoneCall) {
        return res.status(404).json({
          success: false,
          message: 'Phone call not found'
        });
      }

      res.status(200).json({
        success: true,
        data: phoneCall
      });
    } catch (error) {
      console.error('Error in getPhoneCallById:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching phone call',
        error: error.message
      });
    }
  }

  // Create new phone call
  async createPhoneCall(req, res) {
    try {
      console.log('Create phone call request body:', req.body);
      
      const phoneCallData = req.body;
      const newPhoneCall = await phoneCallService.createPhoneCall(phoneCallData);

      res.status(201).json({
        success: true,
        message: 'Phone call created successfully',
        data: newPhoneCall
      });
    } catch (error) {
      console.error('Error in createPhoneCall:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating phone call',
        error: error.message
      });
    }
  }

  // Update phone call
  async updatePhoneCall(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const updatedPhoneCall = await phoneCallService.updatePhoneCall(id, updateData);

      if (!updatedPhoneCall) {
        return res.status(404).json({
          success: false,
          message: 'Phone call not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Phone call updated successfully',
        data: updatedPhoneCall
      });
    } catch (error) {
      console.error('Error in updatePhoneCall:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating phone call',
        error: error.message
      });
    }
  }

  // Delete phone call
  async deletePhoneCall(req, res) {
    try {
      const { id } = req.params;
      const deleted = await phoneCallService.deletePhoneCall(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Phone call not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Phone call deleted successfully'
      });
    } catch (error) {
      console.error('Error in deletePhoneCall:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting phone call',
        error: error.message
      });
    }
  }

  // Update phone call status
  async updatePhoneCallStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedPhoneCall = await phoneCallService.updatePhoneCallStatus(id, status);

      if (!updatedPhoneCall) {
        return res.status(404).json({
          success: false,
          message: 'Phone call not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Phone call status updated successfully',
        data: updatedPhoneCall
      });
    } catch (error) {
      console.error('Error in updatePhoneCallStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating phone call status',
        error: error.message
      });
    }
  }
}

module.exports = new PhoneCallController();
