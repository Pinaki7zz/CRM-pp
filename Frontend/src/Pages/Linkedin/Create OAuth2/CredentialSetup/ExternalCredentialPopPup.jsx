import React, { useState } from 'react';
import './ExternalCredentialPopPup.css';
import { useNavigate } from 'react-router-dom';

const ExternalCredentialModal = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    externalCredentialName: '',
    authenticationProtocol: '',
    authenticationFlowType: '',
    identityProvider: '',
    scope: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving external credential:', formData);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  // const openModal = () => {
  //   setIsOpen(true);
  // };

  const handleAddNew = () => {
    navigate("/admin/socialsetups/linkedinoauth/create/credentials/external");
  };

  if (!isOpen) {
    return (
      <div className="ECPP-demo-container">
        <button className="ECPP-open-modal-btn" onClick={handleAddNew}>
          Open New External Credential Modal
        </button>
      </div>
    );
  }

  return (
    <div className="ECPP-modal-overlay">
      <div className="ECPP-modal-container">
        <div className="ECPP-modal-header">
          <h2>New External Credential</h2>
        </div>
        
        <div className="ECPP-modal-content">
          <div className="ECPP-form-row">
            <label htmlFor="externalCredentialName">External Credential name</label>
            <input
              type="text"
              id="externalCredentialName"
              name="externalCredentialName"
              value={formData.externalCredentialName}
              onChange={handleInputChange}
              className="ECPP-form-input"
            />
          </div>

          <div className="ECPP-form-row">
            <label htmlFor="authenticationProtocol">Authentication protocol</label>
            <input
              type="text"
              id="authenticationProtocol"
              name="authenticationProtocol"
              value={formData.authenticationProtocol}
              onChange={handleInputChange}
              className="ECPP-form-input"
            />
          </div>

          <div className="ECPP-form-row">
            <label htmlFor="authenticationFlowType">Authentication Flow Type</label>
            <select
              id="authenticationFlowType"
              name="authenticationFlowType"
              value={formData.authenticationFlowType}
              onChange={handleInputChange}
              className="ECPP-form-select"
            >
              <option value=""></option>
              <option value="authorization_code">Authorization Code</option>
              <option value="client_credentials">Client Credentials</option>
              <option value="password">Password</option>
              <option value="implicit">Implicit</option>
            </select>
          </div>

          <div className="ECPP-form-row">
            <label htmlFor="identityProvider">Identity Provider</label>
            <select
              id="identityProvider"
              name="identityProvider"
              value={formData.identityProvider}
              onChange={handleInputChange}
              className="ECPP-form-select"
            >
              <option value=""></option>
              <option value="linkedin">LinkedIn</option>
              <option value="google">Google</option>
              <option value="microsoft">Microsoft</option>
              <option value="github">GitHub</option>
            </select>
          </div>

          <div className="ECPP-form-row">
            <label htmlFor="scope">Scope</label>
            <input
              type="text"
              id="scope"
              name="scope"
              value={formData.scope}
              onChange={handleInputChange}
              className="ECPP-form-input"
            />
          </div>
        </div>

        <div className="ECPP-modal-footer">
          <button onClick={handleSave} className="ECPP-save-btn">
            Save
          </button>
          <button onClick={handleCancel} className="ECPP-cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExternalCredentialModal;