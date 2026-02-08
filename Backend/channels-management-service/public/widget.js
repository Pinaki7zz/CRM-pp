// Backend-CM/public/widget.js - CONNECTED TO REAL BACKEND DATA
(function () {
  console.log('🚀 LiveTalk widget initializing with backend integration...');

  // Get configuration from script attributes
  const currentScript = document.currentScript || document.querySelector('script[data-chatflow-id]');
  const chatflowId = currentScript?.getAttribute('data-chatflow-id') || 'unknown';
  const chatId = currentScript?.getAttribute('data-chat-id') || 'unknown';
  const configData = currentScript?.getAttribute('data-config') || '';

  // Default config (fallback)
  let config = {
    accentColor: '#2563eb',
    companyName: 'Support',
    welcomeMessage: 'Hi! How can we help you today?',
    showAvatar: true,
    chatAvatar: null
  };

  // Parse embedded config first
  try {
    if (configData) {
      const embeddedConfig = JSON.parse(atob(configData));
      config = { ...config, ...embeddedConfig };
    }
  } catch (e) {
    console.warn('Embedded config parse failed, will fetch from backend');
  }

  // Chat state management
  let isOpen = false;
  let messages = [];
  let conversationId = null;
  let chatContainer = null;
  let chatButton = null;

  // API helper functions
  async function fetchChatflowConfig() {
    try {
      const response = await fetch(`http://localhost:4008/api/live-talk/chatflows/${chatflowId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Update config with backend data
          config = {
            ...config,
            accentColor: data.data.accentColor || config.accentColor,
            companyName: data.data.companyName || config.companyName,
            welcomeMessage: data.data.welcomeMessage || config.welcomeMessage,
            showAvatar: data.data.showAvatar !== undefined ? data.data.showAvatar : config.showAvatar,
            chatAvatar: data.data.chatAvatar || config.chatAvatar,
            name: data.data.name || config.name
          };
          console.log('✅ Chatflow config loaded from backend:', config);
          return true;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch chatflow config:', error);
    }
    return false;
  }

  async function fetchConversationHistory() {
    try {
      // First, try to get existing conversation
      const response = await fetch(`http://localhost:4008/api/live-talk/conversations?chatflowId=${chatflowId}&chatId=${chatId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          conversationId = data.data[0].id;

          // Fetch messages for this conversation
          const messagesResponse = await fetch(`http://localhost:4008/api/live-talk/conversations/${conversationId}/messages`);
          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            if (messagesData.success && messagesData.data) {
              messages = messagesData.data.map(msg => ({
                id: msg.id,
                text: msg.content,
                sender: msg.senderType, // 'customer' or 'agent'
                timestamp: new Date(msg.createdAt)
              }));
              console.log('✅ Loaded conversation history:', messages.length, 'messages');
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to fetch conversation history:', error);
    }
  }

  async function createConversation() {
    try {
      const response = await fetch(`http://localhost:4008/api/live-talk/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatflowId: chatflowId,
          chatId: chatId,
          customerInfo: {
            ipAddress: '127.0.0.1', // You can get real IP with a service
            userAgent: navigator.userAgent
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          conversationId = data.data.id;
          console.log('✅ New conversation created:', conversationId);
        }
      }
    } catch (error) {
      console.warn('Failed to create conversation:', error);
    }
  }

  async function sendMessageToBackend(messageText) {
    try {
      if (!conversationId) {
        await createConversation();
      }

      const response = await fetch(`http://localhost:4008/api/live-talk/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: messageText,
          senderType: 'customer',
          messageType: 'text'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Message sent to backend');
        return data;
      }
    } catch (error) {
      console.warn('Failed to send message to backend:', error);
    }
  }

  function createWidget() {
    console.log('Creating full chat widget with backend integration...');

    // Remove existing widget
    const existing = document.getElementById('livetalk-widget');
    if (existing) existing.remove();

    // Create main container
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'livetalk-widget';
    widgetContainer.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      z-index: 999999 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
    `;

    // Create chat button
    chatButton = document.createElement('div');
    chatButton.style.cssText = `
      width: 60px !important;
      height: 60px !important;
      background-color: ${config.accentColor} !important;
      border-radius: 50% !important;
      cursor: pointer !important;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: transform 0.2s ease !important;
      opacity: 1 !important;
      visibility: visible !important;
      pointer-events: auto !important;
    `;

    chatButton.innerHTML = config.chatAvatar || `
      <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
    `;

    // Create chat container (initially hidden)
    chatContainer = document.createElement('div');
    chatContainer.style.cssText = `
      position: absolute !important;
      bottom: 80px !important;
      right: 0 !important;
      width: 350px !important;
      height: 500px !important;
      background: white !important;
      border-radius: 12px !important;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2) !important;
      display: none !important;
      flex-direction: column !important;
      overflow: hidden !important;
      border: 2px solid ${config.accentColor} !important;
    `;

    // Chat header
    const chatHeader = document.createElement('div');
    chatHeader.style.cssText = `
      background: ${config.accentColor} !important;
      color: white !important;
      padding: 16px !important;
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
    `;

    chatHeader.innerHTML = `
      <div>
        <div style="font-weight: bold; font-size: 16px;">${config.companyName || 'Support Chat'}</div>
        <div style="font-size: 12px; opacity: 0.9;">Online • ${config.name || 'Live Chat'}</div>
      </div>
      <button id="close-chat" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px; padding: 4px;">×</button>
    `;

    // Messages area
    const messagesArea = document.createElement('div');
    messagesArea.id = 'messages-area';
    messagesArea.style.cssText = `
      flex: 1 !important;
      padding: 16px !important;
      overflow-y: auto !important;
      background: #f8f9fa !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 12px !important;
    `;

    // Input area
    const inputArea = document.createElement('div');
    inputArea.style.cssText = `
      padding: 16px !important;
      border-top: 1px solid #e0e0e0 !important;
      display: flex !important;
      gap: 8px !important;
      background: white !important;
    `;

    const messageInput = document.createElement('input');
    messageInput.type = 'text';
    messageInput.placeholder = 'Type your message...';
    messageInput.style.cssText = `
      flex: 1 !important;
      padding: 12px !important;
      border: 1px solid #e0e0e0 !important;
      border-radius: 6px !important;
      outline: none !important;
      font-family: inherit !important;
    `;

    messageInput.onfocus = () => {
      messageInput.style.borderColor = config.accentColor;
    };

    messageInput.onblur = () => {
      messageInput.style.borderColor = '#e0e0e0';
    };

    const sendButton = document.createElement('button');
    sendButton.innerHTML = `
      <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
        <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
      </svg>
    `;
    sendButton.style.cssText = `
      background: ${config.accentColor} !important;
      color: white !important;
      border: none !important;
      padding: 12px 14px !important;
      border-radius: 6px !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    `;

    // Assemble chat container
    inputArea.appendChild(messageInput);
    inputArea.appendChild(sendButton);
    chatContainer.appendChild(chatHeader);
    chatContainer.appendChild(messagesArea);
    chatContainer.appendChild(inputArea);

    // Assemble main widget
    widgetContainer.appendChild(chatButton);
    widgetContainer.appendChild(chatContainer);
    document.body.appendChild(widgetContainer);

    // Load initial messages
    renderMessages();

    // Event handlers
    chatButton.onclick = toggleChat;

    document.getElementById('close-chat').onclick = () => {
      isOpen = false;
      chatContainer.style.display = 'none';
    };

    sendButton.onclick = sendMessage;
    messageInput.onkeypress = (e) => {
      if (e.key === 'Enter') sendMessage();
    };

    // Hover effects
    chatButton.onmouseenter = () => chatButton.style.transform = 'scale(1.1)';
    chatButton.onmouseleave = () => chatButton.style.transform = 'scale(1)';

    console.log('✅ Full chat widget created with backend integration');
  }

  function toggleChat() {
    isOpen = !isOpen;
    chatContainer.style.display = isOpen ? 'flex' : 'none';

    if (isOpen) {
      // Focus input when chat opens
      const input = chatContainer.querySelector('input');
      setTimeout(() => input.focus(), 100);
    }
  }

  function addMessage(text, sender = 'customer', skipBackend = false) {
    const messagesArea = document.getElementById('messages-area');
    if (!messagesArea) return;

    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      display: flex !important;
      ${sender === 'agent' ? 'justify-content: flex-start' : 'justify-content: flex-end'} !important;
      margin-bottom: 4px !important;
    `;

    const messageBubble = document.createElement('div');
    messageBubble.style.cssText = `
      max-width: 75% !important;
      padding: 10px 14px !important;
      border-radius: 18px !important;
      word-wrap: break-word !important;
      font-size: 14px !important;
      line-height: 1.4 !important;
      ${sender === 'agent' ?
        `background: white !important; 
         border: 1px solid #e0e0e0 !important; 
         color: #333 !important;
         border-bottom-left-radius: 6px !important;` :
        `background: ${config.accentColor} !important; 
         color: white !important;
         border-bottom-right-radius: 6px !important;`
      }
    `;
    messageBubble.textContent = text;

    messageDiv.appendChild(messageBubble);
    messagesArea.appendChild(messageDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;

    // Add to local messages array
    messages.push({
      id: Date.now(),
      text: text,
      sender: sender,
      timestamp: new Date()
    });
  }

  function renderMessages() {
    const messagesArea = document.getElementById('messages-area');
    if (!messagesArea) return;

    messagesArea.innerHTML = '';

    // Add welcome message if no existing messages
    if (messages.length === 0) {
      addMessage(config.welcomeMessage || 'Hi! How can we help you today?', 'agent', true);
    } else {
      // Render existing messages
      messages.forEach(msg => {
        addMessage(msg.text, msg.sender, true);
      });
    }
  }

  async function sendMessage() {
    const input = chatContainer.querySelector('input');
    const message = input.value.trim();

    if (!message) return;

    // Add user message to UI
    addMessage(message, 'customer', true);
    input.value = '';

    // Send to backend
    await sendMessageToBackend(message);

    // Simulate agent response for now (replace with real agent/AI response)
    setTimeout(() => {
      const responses = [
        "Thanks for your message! An agent will be with you shortly.",
        "I understand your question. Let me help you with that.",
        "Thank you for reaching out. How else can I assist you today?",
        "Great question! Let me get that information for you.",
        "I'm here to help. Could you provide a bit more detail?"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addMessage(randomResponse, 'agent', true);
    }, 1500);
  }

  // Initialize widget with backend data
  async function initializeWidget() {
    console.log('Initializing widget with backend data...');

    // Fetch chatflow configuration from backend
    await fetchChatflowConfig();

    // Fetch conversation history
    await fetchConversationHistory();

    // Create the widget UI
    createWidget();
  }

  // Initialize when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
  } else {
    initializeWidget();
  }

  console.log('Backend-integrated widget initialization complete');
})();
