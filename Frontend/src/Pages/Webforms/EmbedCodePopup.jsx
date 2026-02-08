import React, { useState } from "react";
import "./EmbedCodePopup.css";

const EmbedCodePopup = ({ embedCode, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="embed-popup-overlay">
      <div className="embed-popup-container">
        <div className="embed-popup-header">
          <h2>Embed Code Generated</h2>
          <button onClick={onClose} className="embed-close-btn">×</button>
        </div>
        
        <div className="embed-popup-content">
          <p style={{ marginBottom: '16px', color: '#6b7280' }}>
            Copy this code and paste it into your website&apos;s HTML where you want the form to appear.
          </p>
          
          <div className="embed-code-container">
            <pre className="embed-code">{embedCode}</pre>
          </div>
          
          <button onClick={handleCopy} className="copy-btn">
            {copied ? '✓ Copied!' : 'Copy Code'}
          </button>
        </div>
        
        <div className="embed-popup-footer">
          <button onClick={onClose} className="done-btn">Done</button>
        </div>
      </div>
    </div>
  );
};

export default EmbedCodePopup;
