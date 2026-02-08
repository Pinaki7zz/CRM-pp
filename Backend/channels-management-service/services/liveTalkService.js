const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class LiveTalkService {
  // Create new chatflow
  async createChatflow(data) {
    try {
      // Validate required fields
      if (!data.chatId) {
        throw new Error('Chat ID is required');
      }
      if (!data.name) {
        throw new Error('Chatflow name is required');
      }
      if (!data.companyName) {
        throw new Error('Company name is required');
      }

      // Check if chatId already exists
      const existingChatflow = await prisma.chatflow.findUnique({
        where: { chatId: data.chatId }
      });

      if (existingChatflow) {
        throw new Error('Chat ID already exists. Please choose a different one.');
      }

      // Validate and prepare keywordTeamPairs
      let keywordTeamPairsJson = null;
      if (data.keywordTeamPairs && Array.isArray(data.keywordTeamPairs)) {
        // Filter out empty pairs
        const validPairs = data.keywordTeamPairs.filter(pair =>
          pair.keyword && pair.keyword.trim() !== '' &&
          pair.team && pair.team.trim() !== ''
        );
        if (validPairs.length > 0) {
          keywordTeamPairsJson = validPairs;
        }
      }

      // Prepare data for database
      const chatflowData = {
        chatId: data.chatId,
        name: data.name,
        companyName: data.companyName,
        ownerUserId: data.ownerUserId,
        welcomeMessage: data.welcomeMessage || "Hi! How can we help you today?",
        showAvatar: data.showAvatar !== undefined ? data.showAvatar : true,
        enableKnowledgeBase: data.enableKnowledgeBase || false,
        autoAssignConversations: data.autoAssignConversations || false,
        keywordTeamPairs: keywordTeamPairsJson,
        fallbackTeam: data.fallbackTeam || null,
        emailCaptureWhen: data.emailCaptureWhen || 'never',
        emailCaptureMessage: data.emailCaptureMessage || 'Please provide your email to continue',
        websiteUrl: data.websiteUrl || null,
        showOnAllPages: data.showOnAllPages !== undefined ? data.showOnAllPages : true,
        specificPages: data.specificPages || null,
        excludePages: data.excludePages || null,
        accentColor: data.accentColor || '#3b82f6',
        chatPlacement: data.chatPlacement || 'bottom-right',
        chatAvatar: data.chatAvatar || null,
        requireConsent: data.requireConsent || false,
        enableFeedback: data.enableFeedback || false,
        autoAssignment: data.autoAssignment !== undefined ? data.autoAssignment : true,
        language: data.language || 'english',
        isActive: data.isActive || false
      };

      // Create chatflow
      const chatflow = await prisma.chatflow.create({
        data: chatflowData
      });

      // Generate and save embed code
      const embedCode = this.generateEmbedCode(chatflow.id, chatflow.chatId, {
        name: chatflow.name,
        companyName: chatflow.companyName,
        welcomeMessage: chatflow.welcomeMessage,
        accentColor: chatflow.accentColor,
        chatPlacement: chatflow.chatPlacement,
        showAvatar: chatflow.showAvatar,
        websiteUrl: chatflow.websiteUrl
      });

      // Update chatflow with embed code
      const updatedChatflow = await prisma.chatflow.update({
        where: { id: chatflow.id },
        data: { embedCode }
      });

      return {
        ...updatedChatflow,
        keywordTeamPairs: updatedChatflow.keywordTeamPairs || []
      };
    } catch (error) {
      console.error('Error creating chatflow:', error);
      throw error;
    }
  }

  // Update existing chatflow
  async updateChatflow(id, data) {
    try {
      // Check if chatflow exists
      const existingChatflow = await prisma.chatflow.findUnique({
        where: { id }
      });

      if (!existingChatflow) {
        throw new Error('Chatflow not found');
      }

      // ✅ Remove fields that cannot be updated (chatId is unique and immutable)
      const {
        chatId,
        id: updateId,
        createdAt,
        updatedAt,
        ...updateData
      } = data;

      // Validate and prepare keywordTeamPairs if provided
      let keywordTeamPairsJson = undefined;
      if (updateData.keywordTeamPairs !== undefined) {
        if (Array.isArray(updateData.keywordTeamPairs)) {
          const validPairs = updateData.keywordTeamPairs.filter(pair =>
            pair.keyword && pair.keyword.trim() !== '' &&
            pair.team && pair.team.trim() !== ''
          );
          keywordTeamPairsJson = validPairs.length > 0 ? validPairs : null;
        } else {
          keywordTeamPairsJson = null;
        }
      }

      // Prepare final update data
      const finalUpdateData = { ...updateData };
      if (keywordTeamPairsJson !== undefined) {
        finalUpdateData.keywordTeamPairs = keywordTeamPairsJson;
      }

      // Update chatflow
      const updatedChatflow = await prisma.chatflow.update({
        where: { id },
        data: finalUpdateData
      });

      // Regenerate embed code if relevant fields changed
      const embedRelevantFields = [
        'name', 'companyName', 'welcomeMessage',
        'accentColor', 'chatPlacement', 'showAvatar', 'websiteUrl'
      ];

      if (embedRelevantFields.some(field => field in updateData)) {
        const embedCode = this.generateEmbedCode(updatedChatflow.id, existingChatflow.chatId, {
          name: updatedChatflow.name,
          companyName: updatedChatflow.companyName,
          welcomeMessage: updatedChatflow.welcomeMessage,
          accentColor: updatedChatflow.accentColor,
          chatPlacement: updatedChatflow.chatPlacement,
          showAvatar: updatedChatflow.showAvatar,
          websiteUrl: updatedChatflow.websiteUrl
        });

        await prisma.chatflow.update({
          where: { id },
          data: { embedCode }
        });

        updatedChatflow.embedCode = embedCode;
      }

      return {
        ...updatedChatflow,
        keywordTeamPairs: updatedChatflow.keywordTeamPairs || []
      };
    } catch (error) {
      console.error('Error updating chatflow:', error);
      throw error;
    }
  }

  // Get chatflow by ID
  async getChatflowById(id) {
    try {
      const chatflow = await prisma.chatflow.findUnique({
        where: { id },
        include: {
          conversations: {
            select: { id: true, status: true, createdAt: true }
          }
        }
      });

      if (!chatflow) {
        throw new Error('Chatflow not found');
      }

      return {
        ...chatflow,
        keywordTeamPairs: chatflow.keywordTeamPairs || [],
        conversations: chatflow.conversations
      };
    } catch (error) {
      console.error('Error fetching chatflow:', error);
      throw error;
    }
  }

  // List all chatflows with filtering
  async listChatflows(filters = {}) {
    try {
      const { ownerUserId, isActive, limit = 50, offset = 0 } = filters;

      const where = {};
      if (ownerUserId) where.ownerUserId = ownerUserId;
      if (isActive !== undefined) where.isActive = isActive;

      const chatflows = await prisma.chatflow.findMany({
        where,
        include: {
          conversations: {
            select: { id: true, status: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      });

      const total = await prisma.chatflow.count({ where });

      return {
        data: chatflows.map(chatflow => ({
          ...chatflow,
          keywordTeamPairs: chatflow.keywordTeamPairs || [],
          conversations: chatflow.conversations
        })),
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };
    } catch (error) {
      console.error('Error listing chatflows:', error);
      throw error;
    }
  }

  // Update chatflow status
  async updateChatflowStatus(id, isActive) {
    try {
      const chatflow = await prisma.chatflow.findUnique({
        where: { id }
      });

      if (!chatflow) {
        throw new Error('Chatflow not found');
      }

      const updatedChatflow = await prisma.chatflow.update({
        where: { id },
        data: { isActive }
      });

      return {
        ...updatedChatflow,
        keywordTeamPairs: updatedChatflow.keywordTeamPairs || []
      };
    } catch (error) {
      console.error('Error updating chatflow status:', error);
      throw error;
    }
  }

  // Delete chatflow
  async deleteChatflow(id) {
    try {
      const chatflow = await prisma.chatflow.findUnique({
        where: { id }
      });

      if (!chatflow) {
        throw new Error('Chatflow not found');
      }

      await prisma.chatflow.delete({
        where: { id }
      });

      return { message: 'Chatflow deleted successfully' };
    } catch (error) {
      console.error('Error deleting chatflow:', error);
      throw error;
    }
  }

  // Generate embed code
  generateEmbedCode(chatflowId, chatId, config) {
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4008/api/live-talk';

    const embedConfig = {
      name: config.name,
      companyName: config.companyName,
      welcomeMessage: config.welcomeMessage,
      accentColor: config.accentColor,
      chatPlacement: config.chatPlacement,
      showAvatar: config.showAvatar,
      websiteUrl: config.websiteUrl
    };

    return `<!-- LiveTalk Chat Widget -->
<script>
  (function() {
    var ltWidget = document.createElement('script');
    ltWidget.async = true;
    ltWidget.src = '${API_BASE_URL}/widget.js';
    ltWidget.setAttribute('data-chatflow-id', '${chatflowId}');
    ltWidget.setAttribute('data-chat-id', '${chatId}');
    ltWidget.setAttribute('data-config', '${Buffer.from(JSON.stringify(embedConfig)).toString('base64')}');
    document.head.appendChild(ltWidget);
  })();
</script>
<!-- End LiveTalk Chat Widget -->`;
  }

  // Assign conversation based on keywords
  async assignConversationWithKeywords(conversationId, customerMessage) {
    try {
      const conversation = await prisma.chat.findUnique({
        where: { id: conversationId },
        include: { chatflow: true }
      });

      if (!conversation?.chatflow?.autoAssignConversations) {
        return null;
      }

      // Get keyword-team pairs
      const keywordTeamPairs = conversation.chatflow.keywordTeamPairs || [];
      const fallbackTeam = conversation.chatflow.fallbackTeam;

      // Find matching team based on keywords
      const selectedTeam = this.selectTeamByKeywords(customerMessage, keywordTeamPairs, fallbackTeam);

      // Find best available agent in selected team
      const assignedAgent = await this.findBestAvailableAgent(selectedTeam);

      if (assignedAgent) {
        const updatedConversation = await prisma.chat.update({
          where: { id: conversationId },
          data: {
            agentId: assignedAgent.id,
            department: selectedTeam,
            lastMessageAt: new Date()
          }
        });

        return {
          conversation: updatedConversation,
          assignedAgent,
          assignedTeam: selectedTeam,
          assignmentMethod: 'keyword-based'
        };
      }

      return null;
    } catch (error) {
      console.error('Error assigning conversation:', error);
      throw error;
    }
  }

  // Select team based on keywords
  selectTeamByKeywords(message, keywordTeamPairs, fallbackTeam) {
    if (!Array.isArray(keywordTeamPairs)) {
      return fallbackTeam || 'general';
    }

    const lowerMessage = message.toLowerCase();

    for (const pair of keywordTeamPairs) {
      if (pair.keyword && pair.team) {
        const keywords = pair.keyword.toLowerCase().split(',').map(k => k.trim());

        for (const keyword of keywords) {
          if (lowerMessage.includes(keyword)) {
            return pair.team;
          }
        }
      }
    }

    return fallbackTeam || 'general';
  }

  // Find best available agent (simplified version)
  async findBestAvailableAgent(teamName) {
    try {
      const availableAgents = await prisma.user.findMany({
        where: {
          isActive: true,
          status: { in: ['online', 'busy'] }
        },
        include: {
          agentChats: {
            where: { status: 'active' },
            select: { id: true }
          }
        }
      });

      if (availableAgents.length === 0) {
        return null;
      }

      // Find agent with least active chats
      const agentWithLeastLoad = availableAgents.reduce((prev, current) => {
        const prevLoad = prev.agentChats?.length || 0;
        const currentLoad = current.agentChats?.length || 0;
        return currentLoad < prevLoad ? current : prev;
      });

      // Check capacity (max 3 concurrent chats)
      const maxConcurrentChats = 3;
      if ((agentWithLeastLoad.agentChats?.length || 0) < maxConcurrentChats) {
        return agentWithLeastLoad;
      }

      return null;
    } catch (error) {
      console.error('Error finding available agent:', error);
      return null;
    }
  }
}

module.exports = new LiveTalkService();
