import React, { useState } from 'react';
import './NewPrincipalPopPup.css';

const NewPrincipalModal = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [formData, setFormData] = useState({
    principalName: '',
    principalType: 'Database Account',
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
    console.log('Saving principal:', formData);
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
      <div className="NPPP-demo-container">
        <button onClick={openModal} className="NPPP-open-modal-btn">
          Open New Principal Modal
        </button>
      </div>
    );
  }

  return (
    <div className="NPPP-modal-overlay">
      <div className="NPPP-modal-container">
        <div className="NPPP-modal-header">
          <h2>New Principal</h2>
        </div>
        
        <div className="NPPP-modal-content">
          <div className="NPPP-form-row">
            <label htmlFor="principalName">Principal Name</label>
            <input
              type="text"
              id="principalName"
              name="principalName"
              value={formData.principalName}
              onChange={handleInputChange}
              className="NPPP-form-input"
            />
          </div>

          <div className="NPPP-form-row">
            <label htmlFor="principalType">Principal Type</label>
            <select
              id="principalType"
              name="principalType"
              value={formData.principalType}
              onChange={handleInputChange}
              className="NPPP-form-select"
            >
              <option value="Database Account">Database Account</option>
              <option value="User Account">User Account</option>
              <option value="Service Account">Service Account</option>
              <option value="Application Account">Application Account</option>
              <option value="System Account">System Account</option>
            </select>
          </div>

          <div className="NPPP-form-row">
            <label htmlFor="scope">Scope</label>
            <input
              type="text"
              id="scope"
              name="scope"
              value={formData.scope}
              onChange={handleInputChange}
              className="NPPP-form-input"
            />
          </div>
        </div>

        <div className="NPPP-modal-footer">
          <button onClick={handleSave} className="NPPP-save-btn">
            Save
          </button>
          <button onClick={handleCancel} className="NPPP-cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPrincipalModal;