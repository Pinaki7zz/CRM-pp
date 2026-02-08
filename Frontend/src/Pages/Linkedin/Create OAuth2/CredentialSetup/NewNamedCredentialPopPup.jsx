import React, { useState } from 'react';
import './NewNamedCredentialPopPup.css';

const NewNamedCredentialModal = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [formData, setFormData] = useState({
    credentialName: '',
    baseUrl: '',
    externalCredential: '',
    enabledForCallouts: false,
    generateAuthorizationHeader: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    console.log('Saving named credential:', formData);
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
      <div className="NNCPP-demo-container">
        <button onClick={openModal} className="NNCPP-open-modal-btn">
          Open New Named Credential Modal
        </button>
      </div>
    );
  }

  return (
    <div className="NNCPP-modal-overlay">
      <div className="NNCPP-modal-container">
        <div className="NNCPP-modal-header">
          <h2>New Named Credential</h2>
        </div>
        
        <div className="NNCPP-modal-content">
          <div className="NNCPP-form-row">
            <label htmlFor="credentialName">Credential Name</label>
            <input
              type="text"
              id="credentialName"
              name="credentialName"
              value={formData.credentialName}
              onChange={handleInputChange}
              className="NNCPP-form-input"
            />
          </div>

          <div className="NNCPP-form-row">
            <label htmlFor="baseUrl">Base URL</label>
            <input
              type="text"
              id="baseUrl"
              name="baseUrl"
              value={formData.baseUrl}
              onChange={handleInputChange}
              className="NNCPP-form-input"
            />
          </div>

          <div className="NNCPP-form-row">
            <div className="NNCPP-base-url-note">Choose External Credential</div>
          </div>

          <div className="NNCPP-form-row">
            <label htmlFor="externalCredential">External Credential</label>
            <select
              id="externalCredential"
              name="externalCredential"
              value={formData.externalCredential}
              onChange={handleInputChange}
              className="NNCPP-form-select"
            >
              <option value=""></option>
              <option value="oauth_credential">OAuth Credential</option>
              <option value="api_key_credential">API Key Credential</option>
              <option value="jwt_credential">JWT Credential</option>
              <option value="basic_auth_credential">Basic Auth Credential</option>
            </select>
          </div>

          <div className="NNCPP-checkbox-row">
            <label htmlFor="enabledForCallouts" className="NNCPP-checkbox-label-left">Enabled for Callouts</label>
            <input
              type="checkbox"
              id="enabledForCallouts"
              name="enabledForCallouts"
              checked={formData.enabledForCallouts}
              onChange={handleInputChange}
              className="NNCPP-form-checkbox"
            />
          </div>

          <div className="NNCPP-checkbox-row">
            <label htmlFor="generateAuthorizationHeader" className="NNCPP-checkbox-label-left">Generate Authorization Header</label>
            <input
              type="checkbox"
              id="generateAuthorizationHeader"
              name="generateAuthorizationHeader"
              checked={formData.generateAuthorizationHeader}
              onChange={handleInputChange}
              className="NNCPP-form-checkbox"
            />
          </div>
        </div>

        <div className="NNCPP-modal-footer">
          <button onClick={handleSave} className="NNCPP-save-btn">
            Save
          </button>
          <button onClick={handleCancel} className="NNCPP-cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewNamedCredentialModal;