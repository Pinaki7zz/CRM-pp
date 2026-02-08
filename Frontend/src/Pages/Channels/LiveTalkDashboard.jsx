import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare,Search,Filter,Settings,
  User,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  Send,
  Paperclip,
  Smile,
  MoreHorizontal,
  Bell,
  BellOff,
  Circle,
  CheckCircle,
  AlertCircle,
  Archive,
  Trash2,
  Star,
  Tag,
  Minimize2,
  Maximize2
} from 'lucide-react';
import './LiveTalkDashboard.css';

const LiveTalkDashboard = () => {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      customerName: "John Smith",
      customerEmail: "john@acmecorp.com",
      company: "Acme Corp",
      status: "active", // active, waiting, closed
      priority: "high", // high, medium, low
      lastMessage: "Hi, I need help with my account setup",
      timestamp: new Date(Date.now() - 5 * 60000), // 5 minutes ago
      unread: true,
      avatar: null,
      messages: [
        { id: 1, text: "Hi, I need help with my account setup", sender: "customer", timestamp: new Date(Date.now() - 10 * 60000) },
        { id: 2, text: "Hello! I'd be happy to help you with that. What specific issue are you experiencing?", sender: "agent", timestamp: new Date(Date.now() - 8 * 60000) },
        { id: 3, text: "I can't seem to find the billing section", sender: "customer", timestamp: new Date(Date.now() - 5 * 60000) }
      ]
    },
    {
      id: 2,
      customerName: "Sarah Johnson",
      customerEmail: "sarah@techstart.io",
      company: "TechStart",
      status: "waiting",
      priority: "medium",
      lastMessage: "Thanks for the help!",
      timestamp: new Date(Date.now() - 15 * 60000), // 15 minutes ago
      unread: false,
      avatar: null,
      messages: [
        { id: 1, text: "I have a question about pricing", sender: "customer", timestamp: new Date(Date.now() - 20 * 60000) },
        { id: 2, text: "I'd be happy to help with pricing questions. What plan are you interested in?", sender: "agent", timestamp: new Date(Date.now() - 18 * 60000) },
        { id: 3, text: "Thanks for the help!", sender: "customer", timestamp: new Date(Date.now() - 15 * 60000) }
      ]
    },
    {
      id: 3,
      customerName: "Mike Wilson",
      customerEmail: "mike.wilson@gmail.com",
      company: null,
      status: "active",
      priority: "low",
      lastMessage: "Is there a mobile app available?",
      timestamp: new Date(Date.now() - 30 * 60000), // 30 minutes ago
      unread: true,
      avatar: null,
      messages: [
        { id: 1, text: "Is there a mobile app available?", sender: "customer", timestamp: new Date(Date.now() - 30 * 60000) }
      ]
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [agentStatus, setAgentStatus] = useState('online'); // online, busy, offline
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, waiting, closed
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCustomerInfo, setShowCustomerInfo] = useState(true);
  
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      sender: 'agent',
      timestamp: new Date()
    };

    // Update selected conversation
    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, message],
      lastMessage: newMessage,
      timestamp: new Date()
    };

    // Update conversations list
    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversation.id ? updatedConversation : conv
      )
    );

    setSelectedConversation(updatedConversation);
    setNewMessage('');
    
    // Simulate customer response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const customerResponse = {
          id: Date.now() + 1,
          text: "Thank you for your help!",
          sender: 'customer',
          timestamp: new Date()
        };
        
        const responseConversation = {
          ...updatedConversation,
          messages: [...updatedConversation.messages, customerResponse],
          lastMessage: customerResponse.text,
          timestamp: new Date(),
          unread: true
        };

        setConversations(prev => 
          prev.map(conv => 
            conv.id === selectedConversation.id ? responseConversation : conv
          )
        );
        
        if (selectedConversation.id === responseConversation.id) {
          setSelectedConversation(responseConversation);
        }
      }, 2000);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    // Mark as read
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversation.id ? { ...conv, unread: false } : conv
      )
    );
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || conv.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'busy': return '#f59e0b';
      case 'offline': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">Live Chat Dashboard</h1>
          <div className="agent-status-toggle">
            <Circle 
              className="status-dot" 
              style={{ color: getStatusColor(agentStatus), fill: getStatusColor(agentStatus) }}
            />
            <select 
              value={agentStatus} 
              onChange={(e) => setAgentStatus(e.target.value)}
              className="status-select"
            >
              <option value="online">Online</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
        
        <div className="header-right">
          <button className="header-btn">
            <Bell className="header-icon" />
          </button>
          <button className="header-btn">
            <Settings className="header-icon" />
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Conversations Sidebar */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-container">
              <Filter className="filter-icon" />
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="waiting">Waiting</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="conversations-list">
            {filteredConversations.map(conversation => (
              <div
                key={conversation.id}
                className={`conversation-item ${selectedConversation?.id === conversation.id ? 'selected' : ''}`}
                onClick={() => selectConversation(conversation)}
              >
                <div className="conversation-avatar">
                  <User className="avatar-icon" />
                  {conversation.unread && <div className="unread-indicator" />}
                </div>
                
                <div className="conversation-details">
                  <div className="conversation-header">
                    <span className="customer-name">{conversation.customerName}</span>
                    <span className="conversation-time">{formatTime(conversation.timestamp)}</span>
                  </div>
                  
                  <div className="conversation-meta">
                    <span className="customer-company">{conversation.company || conversation.customerEmail}</span>
                    <div className="conversation-indicators">
                      <Circle 
                        className="priority-dot" 
                        style={{ color: getPriorityColor(conversation.priority), fill: getPriorityColor(conversation.priority) }}
                      />
                      <Circle 
                        className={`status-dot ${conversation.status}`}
                        style={{ 
                          color: conversation.status === 'active' ? '#10b981' : 
                                conversation.status === 'waiting' ? '#f59e0b' : '#6b7280',
                          fill: conversation.status === 'active' ? '#10b981' : 
                                conversation.status === 'waiting' ? '#f59e0b' : '#6b7280'
                        }}
                      />
                    </div>
                  </div>
                  
                  <p className="last-message">{conversation.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="main-chat-area">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="customer-info">
                  <div className="customer-avatar">
                    <User className="avatar-icon" />
                  </div>
                  <div className="customer-details">
                    <h3 className="customer-name">{selectedConversation.customerName}</h3>
                    <p className="customer-email">{selectedConversation.customerEmail}</p>
                  </div>
                </div>
                
                <div className="chat-actions">
                  <button className="action-btn">
                    <Star className="action-icon" />
                  </button>
                  <button className="action-btn">
                    <Archive className="action-icon" />
                  </button>
                  <button className="action-btn">
                    <Tag className="action-icon" />
                  </button>
                  <button className="action-btn">
                    <MoreHorizontal className="action-icon" />
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => setShowCustomerInfo(!showCustomerInfo)}
                  >
                    {showCustomerInfo ? <Minimize2 className="action-icon" /> : <Maximize2 className="action-icon" />}
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="messages-area">
                {selectedConversation.messages.map(message => (
                  <div key={message.id} className={`message ${message.sender}`}>
                    <div className="message-avatar">
                      {message.sender === 'customer' ? (
                        <User className="avatar-icon" />
                      ) : (
                        <div className="agent-avatar">A</div>
                      )}
                    </div>
                    
                    <div className="message-content">
                      <div className="message-bubble">
                        <p>{message.text}</p>
                      </div>
                      <span className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="message customer">
                    <div className="message-avatar">
                      <User className="avatar-icon" />
                    </div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <div className="typing-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="message-input-area">
                <div className="input-actions">
                  <button className="input-action-btn">
                    <Paperclip className="action-icon" />
                  </button>
                  <button className="input-action-btn">
                    <Smile className="action-icon" />
                  </button>
                </div>
                
                <textarea
                  ref={messageInputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="message-input"
                  rows={1}
                />
                
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="send-button"
                >
                  <Send className="send-icon" />
                </button>
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <MessageSquare className="empty-icon" />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start chatting</p>
            </div>
          )}
        </div>

        {/* Customer Info Panel */}
        {showCustomerInfo && selectedConversation && (
          <div className="customer-info-panel">
            <div className="panel-header">
              <h3>Customer Details</h3>
              <button 
                className="close-panel-btn"
                onClick={() => setShowCustomerInfo(false)}
              >
                ×
              </button>
            </div>
            
            <div className="customer-profile">
              <div className="profile-avatar">
                <User className="avatar-icon" />
              </div>
              <h4>{selectedConversation.customerName}</h4>
              <p>{selectedConversation.customerEmail}</p>
            </div>
            
            <div className="customer-stats">
              <div className="stat-item">
                <span className="stat-label">Company</span>
                <span className="stat-value">{selectedConversation.company || 'Not provided'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Priority</span>
                <span className={`stat-value priority-${selectedConversation.priority}`}>
                  {selectedConversation.priority}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Status</span>
                <span className={`stat-value status-${selectedConversation.status}`}>
                  {selectedConversation.status}
                </span>
              </div>
            </div>
            
            <div className="customer-actions">
              <button className="customer-action-btn">
                <Phone className="action-icon" />
                Call
              </button>
              <button className="customer-action-btn">
                <Mail className="action-icon" />
                Email
              </button>
              <button className="customer-action-btn">
                <ExternalLink className="action-icon" />
                View Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTalkDashboard;
