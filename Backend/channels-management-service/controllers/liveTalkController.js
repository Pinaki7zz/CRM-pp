const liveTalkService = require('../services/liveTalkService');

// Helper function for handling errors
const handleError = (res, error, defaultMessage = 'An error occurred') => {
  console.error('Controller Error:', error);
  
  const statusCode = error.message.includes('not found') ? 404 :
                    error.message.includes('already exists') ? 409 :
                    error.message.includes('required') ? 400 : 500;
  
  res.status(statusCode).json({
    success: false,
    message: error.message || defaultMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Create new chatflow
const createChatflow = async (req, res) => {
  try {
    const chatflow = await liveTalkService.createChatflow(req.validatedBody);
    
    res.status(201).json({
      success: true,
      message: 'Chatflow created successfully',
      data: chatflow
    });
  } catch (error) {
    handleError(res, error, 'Failed to create chatflow');
  }
};

// Get all chatflows
const getChatflows = async (req, res) => {
  try {
    const result = await liveTalkService.listChatflows(req.validatedQuery);
    
    res.json({
      success: true,
      message: 'Chatflows retrieved successfully',
      data: result.data,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: (result.offset + result.limit) < result.total
      }
    });
  } catch (error) {
    handleError(res, error, 'Failed to retrieve chatflows');
  }
};

// Get single chatflow by ID
const getChatflowById = async (req, res) => {
  try {
    const { id } = req.validatedParams;
    const chatflow = await liveTalkService.getChatflowById(id);
    
    res.json({
      success: true,
      message: 'Chatflow retrieved successfully',
      data: chatflow
    });
  } catch (error) {
    handleError(res, error, 'Failed to retrieve chatflow');
  }
};

// Update chatflow
const updateChatflow = async (req, res) => {
  try {
    const { id } = req.validatedParams;
    const chatflow = await liveTalkService.updateChatflow(id, req.validatedBody);
    
    res.json({
      success: true,
      message: 'Chatflow updated successfully',
      data: chatflow
    });
  } catch (error) {
    handleError(res, error, 'Failed to update chatflow');
  }
};

// Update chatflow status (activate/deactivate)
const updateChatflowStatus = async (req, res) => {
  try {
    const { id } = req.validatedParams;
    const { isActive } = req.validatedBody;
    
    const chatflow = await liveTalkService.updateChatflowStatus(id, isActive);
    
    res.json({
      success: true,
      message: `Chatflow ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: chatflow
    });
  } catch (error) {
    handleError(res, error, 'Failed to update chatflow status');
  }
};

// Delete chatflow
const deleteChatflow = async (req, res) => {
  try {
    const { id } = req.validatedParams;
    const result = await liveTalkService.deleteChatflow(id);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    handleError(res, error, 'Failed to delete chatflow');
  }
};

// Get widget configuration (public endpoint for embed code)
const getWidgetConfig = async (req, res) => {
  try {
    const { chatflowId } = req.query;
    
    if (!chatflowId) {
      return res.status(400).json({
        success: false,
        message: 'Chatflow ID is required'
      });
    }
    
    const chatflow = await liveTalkService.getChatflowById(chatflowId);
    
    if (!chatflow.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Chatflow is not active'
      });
    }
    
    // Return only necessary config for widget
    const widgetConfig = {
      id: chatflow.id,
      chatId: chatflow.chatId,
      name: chatflow.name,
      companyName: chatflow.companyName,
      welcomeMessage: chatflow.welcomeMessage,
      accentColor: chatflow.accentColor,
      chatPlacement: chatflow.chatPlacement,
      showAvatar: chatflow.showAvatar,
      enableKnowledgeBase: chatflow.enableKnowledgeBase,
      requireConsent: chatflow.requireConsent,
      emailCaptureWhen: chatflow.emailCaptureWhen,
      emailCaptureMessage: chatflow.emailCaptureMessage,
      websiteUrl: chatflow.websiteUrl,
      language: chatflow.language
    };
    
    res.json({
      success: true,
      message: 'Widget configuration retrieved successfully',
      data: widgetConfig
    });
  } catch (error) {
    handleError(res, error, 'Failed to retrieve widget configuration');
  }
};

// Assign conversation based on message content
const assignConversation = async (req, res) => {
  try {
    const { conversationId, customerMessage } = req.body;
    
    if (!conversationId || !customerMessage) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID and customer message are required'
      });
    }
    
    const result = await liveTalkService.assignConversationWithKeywords(conversationId, customerMessage);
    
    if (result) {
      res.json({
        success: true,
        message: `Conversation assigned to ${result.assignedAgent.name} (${result.assignedTeam} team)`,
        data: {
          conversation: result.conversation,
          assignedAgent: {
            id: result.assignedAgent.id,
            name: result.assignedAgent.name,
            email: result.assignedAgent.email
          },
          assignedTeam: result.assignedTeam,
          assignmentMethod: result.assignmentMethod
        }
      });
    } else {
      res.json({
        success: true,
        message: 'No agents available for assignment',
        data: null
      });
    }
  } catch (error) {
    handleError(res, error, 'Failed to assign conversation');
  }
};

module.exports = {
  createChatflow,
  getChatflows,
  getChatflowById,
  updateChatflow,
  updateChatflowStatus,
  deleteChatflow,
  getWidgetConfig,
  assignConversation
};
