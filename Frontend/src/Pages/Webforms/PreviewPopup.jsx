import React from "react";
import "./PreviewPopup.css";

const PreviewPopup = ({ formName, formFields, onClose }) => {
  return (
    <div className="preview-popup-overlay">
      <div className="preview-popup-container">
        <div className="preview-popup-header">
          <h2>Form Preview</h2>
          <button onClick={onClose} className="preview-close-btn">×</button>
        </div>
        
        <div className="preview-popup-content">
          <div className="preview-form">
            <h3 style={{ marginBottom: '24px', color: '#333' }}>{formName}</h3>
            
            {formFields.map((field, index) => (
              <div key={index} className="preview-form-field">
                <label>
                  {field.label}
                  {field.required && <span style={{ color: 'red' }}> *</span>}
                </label>
                {field.label === "Email Opt Out" ? (
                  <input type="checkbox" disabled />
                ) : field.label === "Description" ? (
                  <textarea rows={4} disabled style={{ width: '100%' }} />
                ) : (
                  <input type="text" disabled />
                )}
              </div>
            ))}
            
            <div className="preview-form-buttons">
              <button className="preview-submit-btn" disabled>Submit</button>
              <button className="preview-reset-btn" disabled>Reset</button>
            </div>
          </div>
        </div>
        
        <div className="preview-popup-footer">
          <button onClick={onClose} className="preview-done-btn">Done</button>
        </div>
      </div>
    </div>
  );
};

export default PreviewPopup;
