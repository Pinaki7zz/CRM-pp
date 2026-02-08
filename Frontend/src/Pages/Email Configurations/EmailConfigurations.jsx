import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import mail from "../../assets/mail.png";
import './EmailConfigurations.css';
import EmailDomainConfiguration from './EmailDomainConfiguration';

const EmailConfig = () => {
  const [showDomainSetupPage, setShowDomainSetupPage] = useState(false);

  const mainContent = showDomainSetupPage 
    ? <EmailDomainConfiguration />
    : (
      // Initial Email Domain Setup content
      <div className="config-section">
        <div className="config-header">
          <h1>Email Domain Setup</h1>
          <button className="help-button">
            <HelpCircle size={20} />
            Help
          </button>
        </div>
        <div className="feature-cards">
          <div className="feature-card">
            <div className="card-icon">
              <img src={mail} alt="Send and receive" />
            </div>
            <h3>Seamlessly send and receive emails within CRM records for centralized communication</h3>
          </div>
        </div>
        <div className="get-started-section">
          <button className="get-started-button" onClick={() => setShowDomainSetupPage(true)}>
            Get Started
          </button>
        </div>
      </div>
    );

  return (
    <div className="email-config-container">
      <div className="email-tabs">
        <div className="tab active">
          Email
        </div>
      </div>
      {mainContent}
    </div>
  );
};

export default EmailConfig;
