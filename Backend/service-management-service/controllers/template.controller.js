const multer = require('multer');
const templateService = require('../services/template.service');
const { validateCreateTemplate } = require('../utils/validators');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.createTemplate = [
  upload.single('file'),
  
  async (req, res) => {
    try {
      console.log('🔍 FULL Request body:', req.body);
      console.log('🔍 createdBy from frontend:', req.body.createdBy);
      console.log('🔍 Request file:', req.file);

      const errors = validateCreateTemplate(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Prepare data for service
      const templateData = {
        name: req.body.name,
        object: req.body.object,
        language: req.body.language,
        templateType: req.body.templateType,
        usage: req.body.usage,
        subject: req.body.subject || null,
        content: req.body.content || null,
        fileName: req.file ? req.file.originalname : null,
        fileData: req.file ? req.file.buffer : null,
        createdBy: req.body.createdBy || 'System'  // Add explicit logging here
      };

      console.log('🔍 Data being sent to service:', templateData);
      console.log('🔍 Specifically createdBy:', templateData.createdBy);

      const template = await templateService.createTemplate(templateData);
      
      console.log('🔍 Template returned from service:', template);
      console.log('🔍 Final createdBy in template:', template.createdBy);
      
      res.status(201).json({
        success: true,
        message: 'Template created successfully',
        data: template
      });
    } catch (error) {
      console.error('Create template error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal Server Error' 
      });
    }
  }
];

// controllers/template.controller.js

exports.getTemplates = async (req, res) => {
  try {
    console.log('Getting templates...'); // Debug log
    
    const templates = await templateService.getTemplates();
    console.log('Found templates:', templates.length); // Debug log
    
    res.json({
      success: true,
      data: templates  // 🔥 This is what was missing!
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal Server Error' 
    });
  }
};


exports.getTemplateById = async (req, res) => {
  try {
    const template = await templateService.getTemplateById(parseInt(req.params.id));
    
    if (!template) {
      return res.status(404).json({ 
        success: false,
        error: 'Template not found' 
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Get template by ID error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal Server Error' 
    });
  }
};



exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting template with id:', id);
    
    const deleted = await templateService.deleteTemplate(id);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false,
        error: 'Template not found' 
      });
    }

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal Server Error' 
    });
  }
};

exports.updateTemplate = [
  upload.single('file'),
  
  async (req, res) => {
    try {
      const { id } = req.params;
      console.log('🔍 Updating template ID:', id);
      console.log('🔍 Request body:', req.body);

      const templateData = {
        name: req.body.name,
        object: req.body.object,
        language: req.body.language,
        templateType: req.body.templateType,
        usage: req.body.usage,
        subject: req.body.subject || null,
        content: req.body.content || null, // 🔥 Rich text content
        fileName: req.file ? req.file.originalname : req.body.fileName,
        fileData: req.file ? req.file.buffer : null,
      };

      const updatedTemplate = await templateService.updateTemplate(id, templateData);
      
      if (!updatedTemplate) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      res.json({
        success: true,
        message: 'Template updated successfully',
        data: updatedTemplate
      });
    } catch (error) {
      console.error('Update template error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal Server Error' 
      });
    }
  }
];