import React, { useState } from "react";
import "./SelectWebform.css";

const SelectWebform = ({ onCancel, onShowLeadsForm, onShowContactsForm, onShowCasesForm }) => {
  const [formName, setFormName] = useState("");
  const [module, setModule] = useState("");

  const handleCreate = () => {
    if (formName && module) {
      if (module === "Leads") {
        onShowLeadsForm(formName); // Pass form name
      } else if (module === "Contacts") {
        onShowContactsForm(formName); // Pass form name
      } else if (module === "Cases") {
        onShowCasesForm(formName); // Pass form name
      }
    } else {
      alert("Please fill all fields.");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h2 className="popup-title-w">New Form</h2>
        <div className="form-group">
          <label>Form Name</label>
          <input
            type="text"
            placeholder="Enter Form Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="module">Module</label>
          <select
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className="dropdown"
          >
            <option value="" disabled>
              Select Module
            </option>
            <option value="Leads">Leads</option>
            <option value="Contacts">Contacts</option>
            <option value="Cases">Cases</option>
          </select>
        </div>
        <div className="button-group">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`create-btn${formName && module ? " active" : ""}`}
            onClick={handleCreate}
            disabled={!(formName && module)}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectWebform;
