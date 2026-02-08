import React, { useState } from 'react';
import './EmailChannels.css';
import EmailAddressGrid from './EmailAddressGrid';
import CreateEmailChannelForm from './CreateEmailChannelForm';

const EmailChannels = () => {
  const [showCreateChannelForm, setShowCreateChannelForm] = useState(false);

  const handleNewClick = () => {
    console.log('New button clicked, showing create form');
    setShowCreateChannelForm(true);
  };

  const handleCancelCreate = () => {
    console.log('Cancel create, showing grid');
    setShowCreateChannelForm(false);
  };

  return (
    <div className="email-channels-container">
      <div className="email-tabs">
        <div className="tab active">Email Address</div>
      </div>
      {showCreateChannelForm ? (
        <CreateEmailChannelForm onCancel={handleCancelCreate} />
      ) : (
        <EmailAddressGrid onNew={handleNewClick} />
      )}
    </div>
  );
};

export default EmailChannels;
