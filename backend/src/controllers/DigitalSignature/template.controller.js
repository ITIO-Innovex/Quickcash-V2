const Template = require('../../models/DigitalSignature/template.modal');

// Save template
exports.saveTemplate = async (req, res) => {
  try {
    const { templateName, templateUrl, fileSize, mimeType } = req.body;

    console.log('Template save request:', { templateName, templateUrl, fileSize, mimeType });

    if (!templateName || !templateUrl || !fileSize || !mimeType) {
      console.log('Missing required fields:', { templateName: !!templateName, templateUrl: !!templateUrl, fileSize: !!fileSize, mimeType: !!mimeType });
      return res.status(400).json({ 
        status: 400,
        error: 'Template name, URL, file size, and MIME type are required' 
      });
    }

    if (!req.userId) {
      console.log('No userId found in request');
      return res.status(401).json({ 
        status: 401,
        error: 'User ID not found. Please authenticate.' 
      });
    }

    console.log('Creating template with userId:', req.userId);

    const newTemplate = new Template({
      templateName,
      templateUrl,
      fileSize,
      mimeType,
      createdBy: req.userId, // From the authenticated user
      tenantId: req.user?.tenantId || req.userId // Use tenantId if available, otherwise use user id
    });
    
    const savedTemplate = await newTemplate.save();
    console.log('Template saved successfully:', savedTemplate._id);

    return res.status(201).json({ 
      status: 201,
      message: 'Template saved successfully', 
      template: savedTemplate 
    });
  } catch (error) {
    console.error('Template save error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        status: 400,
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        status: 400,
        error: 'Template with this name already exists'
      });
    }
    
    return res.status(500).json({ 
      status: 500,
      error: 'Failed to save template',
      details: error.message 
    });
  }
};

// Get all templates
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
    return res.status(200).json({ templates });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }

    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    await Template.findByIdAndDelete(templateId);

    return res.status(200).json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Template delete error:', error);
    return res.status(500).json({ error: 'Failed to delete template' });
  }
};
