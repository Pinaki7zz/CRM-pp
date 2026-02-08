import React, { useState } from 'react';
import TicketCategories from '../../components/TicketCategories';
//import '../styles/global.css';
import './Ticket_Categories.css';

export default function Ticket_Categories() {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    catalogName: 'IT Support',
    catalogId: '',
    status: 'In Preparation',
    serviceCategoryId: 'IT-SUP-001',
    serviceCategoryDate: '2024-01-01',
    createdOn: '2024-01-01',
    createdBy: 'Admin',
    changedBy: '',
    changedOn: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log('Form saved:', formData);
  };
  return (
    // <main className="app-container">
    <div className="ticket-category-container">
      {/* Header */}
      <div className="ticket-category-form-header">
        <h1 className="ticket-category-form-title">Ticket Category</h1>
        <div className="ticket-category-header-actions">
          <button className="ticket-category-btn btn-secondary">Cancel</button>
          <button className="ticket-category-btn btn-primary" onClick={handleSave}>
            Save
          </button>
          <button className="ticket-category-btn btn-tertiary">More ↓</button>
        </div>
      </div>

      {/* Metadata Bar */}
      <div className="metadata-bar">
        <div className="metadata-item">
          <span className="metadata-label">Start:</span>
          <span className="metadata-value">Jan 01, 2024</span>
        </div>
        <div className="metadata-item">
          <span className="metadata-label">Valid From:</span>
          <span className="metadata-value">★ Jan 01, 2024</span>
        </div>
        <div className="metadata-item">
          <span className="metadata-label">Valid To:</span>
          <span className="metadata-value">★ —</span>
        </div>
        <div className="metadata-item">
          <span className="metadata-label">Created Date:</span>
          <span className="metadata-value">Jan 012024</span>
        </div>
        <div className="metadata-item">
          <span className="metadata-label">Created By:</span>
          <span className="metadata-value">Admin</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="ticket-category-tabs">
        <button
          className={`tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`tab ${activeTab === 'layout' ? 'active' : ''}`}
          onClick={() => setActiveTab('layout')}
        >
          Service Catalogue
        </button>
      </div>

      {/* Form Content */}
      <div className="form-content">
        {activeTab === 'general' && (
          <>
            {/* General Information Section */}
            <section className="form-section">
              <h2 className="section-title">General Information</h2>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="catalogName" className="form-label">
                    Catalog Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="catalogName"
                    name="catalogName"
                    value={formData.catalogName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter catalog name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="catalogId" className="form-label">
                    Catalog ID
                  </label>
                  <input
                    type="text"
                    id="catalogId"
                    name="catalogId"
                    value={formData.catalogId}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Auto-generated if left blank"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option>In Preparation</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="serviceCategoryId" className="form-label">
                  Ticket Category ID
                </label>
                <div className="input-with-date">
                  <input
                    type="text"
                    id="serviceCategoryId"
                    name="serviceCategoryId"
                    value={formData.serviceCategoryId}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                  <div className="button-group">
                    <button className="icon-btn">📅</button>
                    <button className="icon-btn">−</button>
                  </div>
                  <input
                    type="date"
                    name="serviceCategoryDate"
                    value={formData.serviceCategoryDate}
                    onChange={handleInputChange}
                    className="form-input date-input"
                  />
                  <button className="icon-btn">📅</button>
                </div>
              </div>
              <div className="form-grid two-col">
                <div className="form-group">
                  <label htmlFor="createdBy" className="form-label">
                    Created By
                  </label>
                  <input
                    type="text"
                    id="createdBy"
                    name="createdBy"
                    value={formData.createdBy}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled
                  />
                </div>


                <div className="form-group">
                  <label htmlFor="createdByDate" className="form-label">
                    Created On
                  </label>
                  <input
                    type="text"
                    id="createdByDate"
                    className="form-input"
                    value="Jan 01, 2024, 10:00 AM"
                    disabled
                  />
                </div>
              </div>
            </section>

            {/* Additional Information Section */}
            <section className="form-section">
              <h2 className="section-title">Additional Information</h2>

              <div className="form-grid two-col">

                <div className="form-group">
                  <label htmlFor="changedBy" className="form-label">
                    Changed By
                  </label>
                  <select
                    id="changedBy"
                    name="changedBy"
                    value={formData.changedBy}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select user</option>
                    <option>Admin</option>
                    <option>User 1</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="changedOn" className="form-label">
                    Changed On
                  </label>
                  <input
                    type="text"
                    id="changedOn"
                    className="form-input"
                    value="—"
                    disabled
                  />
                </div>
              </div>
            </section>

            {/* Service Category Section */}
            {/* <section className="form-section">
              <h2 className="section-title">Ticket Category</h2>
            </section> */}
          </>
        )}






        {activeTab === 'layout' && (
          <>
            {/* General Information Section */}
            <section className="form-section">
              <div className='ticket-category-service-catalgue-head-btn'>
                <button className="ticket-category-btn btn-primary" onClick={handleSave}>
                  Cancel
                </button>
                <button className="ticket-category-btn btn-primary" onClick={handleSave}>
                  Save
                </button>
                <button className="ticket-category-btn btn-primary" onClick={handleSave}>
                  Add Service Category
                </button>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="catalogName" className="form-label">
                    Catalog Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="catalogName"
                    name="catalogName"
                    value={formData.catalogName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter catalog name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="catalogId" className="form-label">
                    Catalog ID
                  </label>
                  <input
                    type="text"
                    id="catalogId"
                    name="catalogId"
                    value={formData.catalogId}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Auto-generated if left blank"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option>In Preparation</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="serviceCategoryId" className="form-label">
                  Ticket Category ID
                </label>
                <div className="input-with-date">
                  <input
                    type="text"
                    id="serviceCategoryId"
                    name="serviceCategoryId"
                    value={formData.serviceCategoryId}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                  <div className="button-group">
                    <button className="icon-btn">📅</button>
                    <button className="icon-btn">−</button>
                  </div>
                  <input
                    type="date"
                    name="serviceCategoryDate"
                    value={formData.serviceCategoryDate}
                    onChange={handleInputChange}
                    className="form-input date-input"
                  />
                  <button className="icon-btn">📅</button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="createdOn" className="form-label">
                  Created On
                </label>
                <div className="date-input-group">
                  <button className="icon-btn">📅</button>
                  <input
                    type="date"
                    id="createdOn"
                    name="createdOn"
                    value={formData.createdOn}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                  <button className="icon-btn">📅</button>
                </div>
              </div>
            </section>

            {/* Additional Information Section */}
            <section className="form-section">
              <h2 className="section-title">Additional Information</h2>

              <div className="form-grid two-col">
                <div className="form-group">
                  <label htmlFor="createdBy" className="form-label">
                    Created By
                  </label>
                  <input
                    type="text"
                    id="createdBy"
                    name="createdBy"
                    value={formData.createdBy}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="createdByDate" className="form-label">
                    Created On
                  </label>
                  <input
                    type="text"
                    id="createdByDate"
                    className="form-input"
                    value="Jan 01, 2024, 10:00 AM"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="changedBy" className="form-label">
                    Changed By
                  </label>
                  <select
                    id="changedBy"
                    name="changedBy"
                    value={formData.changedBy}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select user</option>
                    <option>Admin</option>
                    <option>User 1</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="changedOn" className="form-label">
                    Changed On
                  </label>
                  <input
                    type="text"
                    id="changedOn"
                    className="form-input"
                    value="—"
                    disabled
                  />
                </div>
              </div>
            </section>

            {/* Service Category Section */}
            {/* <section className="form-section">
              <h2 className="section-title">Ticket Category</h2>
            </section> */}
          </>
        )}







        {/* {activeTab === 'layout' && (
          <div className="empty-section">
            <p>Service Layout content goes here</p>
          </div>
        )} */}
      </div>
    </div>
    // </main>
  );
}
