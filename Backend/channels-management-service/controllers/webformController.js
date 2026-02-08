const { validationResult } = require('express-validator');
const webformService = require('../services/webformService');

class WebformController {
  
  // Create new webform
  async createWebform(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const webformData = req.body;
      const webform = await webformService.createWebform(webformData);
      
      res.status(201).json({
        success: true,
        message: 'Webform created successfully',
        data: webform
      });
    } catch (error) {
      console.error('Error creating webform:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create webform'
      });
    }
  }

  // Get all webforms
  async getAllWebforms(req, res) {
    try {
      const { module } = req.query;
      const webforms = await webformService.getAllWebforms(module);
      
      res.status(200).json({
        success: true,
        data: webforms
      });
    } catch (error) {
      console.error('Error fetching webforms:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch webforms'
      });
    }
  }

  // Get webform by URL (for public access)
  async getWebformByUrl(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const { url } = req.params;
      const webform = await webformService.getWebformByUrl(url);
      
      if (!webform) {
        return res.status(404).json({
          success: false,
          message: 'Webform not found'
        });
      }

      res.status(200).json({
        success: true,
        data: webform
      });
    } catch (error) {
      console.error('Error fetching webform:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch webform'
      });
    }
  }

  // Get webform by ID
  async getWebformById(req, res) {
    try {
      const { id } = req.params;
      const webform = await webformService.getWebformById(id);
      
      if (!webform) {
        return res.status(404).json({
          success: false,
          message: 'Webform not found'
        });
      }

      res.status(200).json({
        success: true,
        data: webform
      });
    } catch (error) {
      console.error('Error fetching webform:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch webform'
      });
    }
  }

  // Update webform
  async updateWebform(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const { id } = req.params;
      const updateData = req.body;
      
      const webform = await webformService.updateWebform(id, updateData);
      
      res.status(200).json({
        success: true,
        message: 'Webform updated successfully',
        data: webform
      });
    } catch (error) {
      console.error('Error updating webform:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update webform'
      });
    }
  }

  // Delete webform
  async deleteWebform(req, res) {
    try {
      const { id } = req.params;
      await webformService.deleteWebform(id);
      
      res.status(200).json({
        success: true,
        message: 'Webform deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting webform:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete webform'
      });
    }
  }

  // Submit webform
  async submitWebform(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const { webformId, fields } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      const submission = await webformService.submitWebform({
        webformId,
        submissionData: fields,
        ipAddress,
        userAgent
      });
      
      res.status(201).json({
        success: true,
        message: 'Form submitted successfully',
        data: submission
      });
    } catch (error) {
      console.error('Error submitting webform:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to submit form'
      });
    }
  }

  // Get submissions for a webform
  async getWebformSubmissions(req, res) {
    try {
      const { id } = req.params;
      const submissions = await webformService.getWebformSubmissions(id);
      
      res.status(200).json({
        success: true,
        data: submissions
      });
    } catch (error) {
      console.error('Error fetching submissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch submissions'
      });
    }
  }
}

module.exports = new WebformController();
