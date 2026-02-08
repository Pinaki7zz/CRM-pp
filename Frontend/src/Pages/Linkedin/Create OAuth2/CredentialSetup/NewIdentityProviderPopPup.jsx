
import React, { useState } from 'react';
import './NewIdentityProviderPopPup.css';

const NewIdentityProvider = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [formData, setFormData] = useState({
    providerName: 'LinkedIn',
    authProtocol: '',
    authFlowType: '',
    clientId: '',
    clientSecret: '',
    authorizeEndpointUrl: '',
    tokenEndpointUrl: '',
    userInfoEndpointUrl: '',
    passClientCredentials: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    console.log('Saving identity provider:', formData);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };

  if (!isOpen) {
    return (
      <div className="NIPPP-demo-container">
        <button onClick={openModal} className="NIPPP-open-modal-btn">
          Open New Identity Provider Modal
        </button>
      </div>
    );
  }

  return (
    <div className="NIPPP-modal-overlay">
      <div className="NIPPP-modal-container">
        <div className="NIPPP-modal-header">
          <h2>New Identity Provider</h2>
        </div>
        
        <div className="NIPPP-modal-content">
          <div className="NIPPP-form-row">
            <label htmlFor="providerName">Identity Provider Name</label>
            <input
              type="text"
              id="providerName"
              name="providerName"
              value={formData.providerName}
              onChange={handleInputChange}
              className="NIPPP-form-input"
            />
          </div>

          <div className="NIPPP-form-row">
            <label htmlFor="authProtocol">Authentication Protocol</label>
            <input
              type="text"
              id="authProtocol"
              name="authProtocol"
              value={formData.authProtocol}
              onChange={handleInputChange}
              className="NIPPP-form-input"
            />
          </div>

          <div className="NIPPP-form-row">
            <label htmlFor="authFlowType">Authentication Flow Type</label>
            <input
              type="text"
              id="authFlowType"
              name="authFlowType"
              value={formData.authFlowType}
              onChange={handleInputChange}
              className="NIPPP-form-input"
            />
          </div>

          <div className="NIPPP-form-row">
            <label htmlFor="clientId">Client Id</label>
            <input
              type="text"
              id="clientId"
              name="clientId"
              value={formData.clientId}
              onChange={handleInputChange}
              className="NIPPP-form-input"
            />
          </div>

          <div className="NIPPP-form-row">
            <label htmlFor="clientSecret">Client Secret</label>
            <input
              type="text"
              id="clientSecret"
              name="clientSecret"
              value={formData.clientSecret}
              onChange={handleInputChange}
              className="NIPPP-form-input"
            />
          </div>

          <div className="NIPPP-form-row">
            <label htmlFor="authorizeEndpointUrl">Authorize Endpoint URL</label>
            <input
              type="text"
              id="authorizeEndpointUrl"
              name="authorizeEndpointUrl"
              value={formData.authorizeEndpointUrl}
              onChange={handleInputChange}
              className="NIPPP-form-input"
            />
          </div>

          <div className="NIPPP-form-row">
            <label htmlFor="tokenEndpointUrl">Token Endpoint URL</label>
            <input
              type="text"
              id="tokenEndpointUrl"
              name="tokenEndpointUrl"
              value={formData.tokenEndpointUrl}
              onChange={handleInputChange}
              className="NIPPP-form-input"
            />
          </div>

          <div className="NIPPP-form-row">
            <label htmlFor="userInfoEndpointUrl">User Info Endpoint URL</label>
            <input
              type="text"
              id="userInfoEndpointUrl"
              name="userInfoEndpointUrl"
              value={formData.userInfoEndpointUrl}
              onChange={handleInputChange}
              className="NIPPP-form-input"
            />
          </div>

          <div className="NIPPP-checkbox-row">
            <input
              type="checkbox"
              id="passClientCredentials"
              name="passClientCredentials"
              checked={formData.passClientCredentials}
              onChange={handleInputChange}
              className="NIPPP-form-checkbox"
            />
            <label htmlFor="passClientCredentials" className="NIPPP-checkbox-label">
              Pass client credentials in request body
            </label>
          </div>
        </div>

        <div className="NIPPP-modal-footer">
          <button onClick={handleSave} className="NIPPP-save-btn">
            Save
          </button>
          <button onClick={handleCancel} className="NIPPP-cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewIdentityProvider;