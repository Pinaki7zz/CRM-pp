import React from 'react';
import { 
  User, 
  Bot, 
  Clock, 
  Check, 
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import './ChatMessage.css';

const ChatMessage = ({ 
  message,
  isAgent = false,
  showAvatar = true,
  showTimestamp = true,
  showStatus = false,
  agentName = "Agent",
  customerName = "Customer",
  compact = false
}) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <Clock className="status-icon sending" />;
      case 'delivered':
        return <Check className="status-icon delivered" />;
      case 'read':
        return <CheckCheck className="status-icon read" />;
      case 'failed':
        return <AlertCircle className="status-icon failed" />;
      default:
        return null;
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={`chat-message ${isAgent ? 'agent' : 'customer'} ${compact ? 'compact' : ''}`}>
      {/* Avatar */}
      {showAvatar && (
        <div className="message-avatar">
          {isAgent ? (
            message.agentAvatar ? (
              <img src={message.agentAvatar} alt={agentName} className="avatar-image" />
            ) : (
              <div className="agent-avatar">
                {getInitials(agentName)}
              </div>
            )
          ) : (
            message.customerAvatar ? (
              <img src={message.customerAvatar} alt={customerName} className="avatar-image" />
            ) : (
              <div className="customer-avatar">
                <User className="avatar-icon" />
              </div>
            )
          )}
        </div>
      )}

      {/* Message Content */}
      <div className="message-content">
        {/* Message Header (optional) */}
        {!compact && showAvatar && (
          <div className="message-header">
            <span className="sender-name">
              {isAgent ? agentName : customerName}
            </span>
            {showTimestamp && (
              <span className="message-timestamp">
                {formatTime(message.timestamp)}
              </span>
            )}
          </div>
        )}

        {/* Message Bubble */}
        <div className="message-bubble">
          {/* Message Text */}
          <div className="message-text">
            {message.type === 'text' && <p>{message.text}</p>}
            {message.type === 'image' && (
              <div className="message-image">
                <img src={message.imageUrl} alt="Shared image" />
              </div>
            )}
            {message.type === 'file' && (
              <div className="message-file">
                <div className="file-icon">📄</div>
                <div className="file-details">
                  <span className="file-name">{message.fileName}</span>
                  <span className="file-size">{message.fileSize}</span>
                </div>
              </div>
            )}
          </div>

          {/* Message Footer */}
          <div className="message-footer">
            {compact && showTimestamp && (
              <span className="message-time">
                {formatTime(message.timestamp)}
              </span>
            )}
            
            {showStatus && message.status && (
              <div className="message-status">
                {getStatusIcon(message.status)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
