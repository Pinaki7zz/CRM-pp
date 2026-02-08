
// import React, { useState } from 'react';
// import { useNavigate } from "react-router-dom";

// import './OAuthIntegration.css';
// const OAuthIntegration = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     providerType: 'LinkedIn',
//     providerName: '',

//     clientId: '',
//     clientSecret: '',
//     authorizeEndpoint: '',
//     tokenEndpoint: '',
//     userInfoEndpoint: '',
//     defaultScopes: ''
//   });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSave = () => {
//     console.log('Form saved:', formData);
//     // Add your save logic here
//   };

//   const handleCancel = () => {
//     console.log('Form cancelled');
//     // Add your cancel logic here
//   };

//   const handleAddNew = () => {
//     navigate("/admin/socialsetups/linkedinoauth/create/credentials");
//   };

//   return (
//     <div className="OAI-oauth-fullpage">
//       {/* Background Elements */}
//       <div className="OAI-background-elements">
//         <div className="OAI-floating-shape shape-1"></div>
//         <div className="OAI-floating-shape shape-2"></div>
//         <div className="OAI-floating-shape shape-3"></div>
//         <div className="OAI-floating-shape shape-4"></div>
//       </div>

//       {/* Navigation Bar */}
//       <nav className="OAI-oauth-nav">
//         <div className="OAI-nav-brand">
//           <span className="OAI-brand-icon">🔐</span>
//           <span className="OAI-brand-text">OAuth Manager</span>
//         </div>
//         <div className="OAI-nav-actions">
//           {/* <button className="OAI-nav-btn">Documentation</button> */}
//           <button className="OAI-nav-btn  OAI-credentials-btn"  onClick={handleAddNew}>
//             Credentials Setup
//           </button>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <div className="OAI-oauth-main">
//         {/* Left Section - Info Panel */}
//         {/* <div className="OAI-info-panel">
//           <div className="OAI-info-content">
//             <h1 className="OAI-main-title">OAuth Integration</h1>
//             <p className="OAI-main-subtitle">
//               Configure your OAuth provider settings to enable secure authentication 
//               for your application. Connect with popular providers like LinkedIn, 
//               Google, GitHub, and more.
//             </p>
//             <div className="OAI-feature-list">
//               <div className="OAI-feature-item">
//                 <div className="OAI-feature-icon">✨</div>
//                 <div className="OAI-feature-text">
//                   <h3>Secure Authentication</h3>
//                   <p>Industry-standard OAuth 2.0 protocol</p>
//                 </div>
//               </div>
//               <div className="OAI-feature-item">
//                 <div className="OAI-feature-icon">🚀</div>
//                 <div className="OAI-feature-text">
//                   <h3>Quick Setup</h3>
//                   <p>Easy configuration in just a few steps</p>
//                 </div>
//               </div>
//               <div className="OAI-feature-item">
//                 <div className="OAI-feature-icon">🔒</div>
//                 <div className="OAI-feature-text">
//                   <h3>Enterprise Ready</h3>
//                   <p>Scalable and production-ready solution</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div> */}

//         {/* Right Section - Form Panel */}
//         <div className="OAI-form-panel">
//           <div className="OAI-form-container">
//             <div className="OAI-form-header">
//               <h2 className="OAI-form-title">Provider Configuration</h2>
//               <p className="OAI-form-description">Fill in the details below to configure your OAuth provider</p>
//             </div>

//             <div className="OAI-oauth-form">
//               {/* Row 1 */}
//               <div className="OAI-form-grid">
//                 <div className="OAI-form-row">
//                   <label className="OAI-form-label">Provider Type</label>
//                   <select 
//                     name="providerType"
//                     value={formData.providerType}
//                     onChange={handleInputChange}
//                     className="OAI-form-input OAI-form-select"
//                   >
//                     <option value="LinkedIn">LinkedIn</option>
//                     <option value="Google">Google</option>
//                     <option value="GitHub">GitHub</option>
//                     <option value="Facebook">Facebook</option>
//                   </select>
//                 </div>

//                 <div className="OAI-form-row">
//                   <label className="OAI-form-label">Provider Name</label>
//                   <input
//                     type="text"
//                     name="providerName"
//                     value={formData.providerName}
//                     onChange={handleInputChange}
//                     className="OAI-form-input"
//                     placeholder="Enter provider name"
//                   />
//                 </div>
//               </div>

//               {/* Row 2 */}
//              

//                 <div className="OAI-form-row">
//                   <label className="OAI-form-label">Client ID</label>
//                   <input
//                     type="text"
//                     name="clientId"
//                     value={formData.clientId}
//                     onChange={handleInputChange}
//                     className="OAI-form-input"
//                     placeholder="Enter client ID"
//                   />
//                 </div>
//               </div>

//               {/* Client Secret - Full Width */}
//               <div className="OAI-form-row OAI-full-width">
//                 <label className="OAI-form-label">Client Secret</label>
//                 <input
//                   type="password"
//                   name="clientSecret"
//                   value={formData.clientSecret}
//                   onChange={handleInputChange}
//                   className="OAI-form-input"
//                   placeholder="Enter client secret"
//                 />
//               </div>

//               {/* Endpoints Section */}
//               <div className="OAI-section-divider">
//                 <span className="OAI-section-title">API Endpoints</span>
//               </div>

//               <div className="OAI-form-row full-width">
//                 <label className="OAI-form-label">Authorize Endpoint URL</label>
//                 <input
//                   type="url"
//                   name="authorizeEndpoint"
//                   value={formData.authorizeEndpoint}
//                   onChange={handleInputChange}
//                   className="OAI-form-input"
//                   placeholder="https://example.com/oauth/authorize"
//                 />
//               </div>

//               <div className="OAI-form-grid">
//                 <div className="OAI-form-row">
//                   <label className="OAI-form-label">Token Endpoint URL</label>
//                   <input
//                     type="url"
//                     name="tokenEndpoint"
//                     value={formData.tokenEndpoint}
//                     onChange={handleInputChange}
//                     className="OAI-form-input"
//                     placeholder="https://example.com/oauth/token"
//                   />
//                 </div>

//                 <div className="OAI-form-row">
//                   <label className="OAI-form-label">User Info Endpoint URL</label>
//                   <input
//                     type="url"
//                     name="userInfoEndpoint"
//                     value={formData.userInfoEndpoint}
//                     onChange={handleInputChange}
//                     className="OAI-form-input"
//                     placeholder="https://example.com/api/user"
//                   />
//                 </div>
//               </div>

//               <div className="OAI-form-row full-width">
//                 <label className="OAI-form-label">Default Scopes</label>
//                 <input
//                   type="text"
//                   name="defaultScopes"
//                   value={formData.defaultScopes}
//                   onChange={handleInputChange}
//                   className="OAI-form-input"
//                   placeholder="read:user profile email"
//                 />
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="OAI-oauth-actions">
//               <button 
//                 type="button" 
//                 className="OAI-btn btn-secondary"
//                 onClick={handleCancel}
//               >
//                 Cancel
//               </button>
//               <button 
//                 type="button" 
//                 className="OAI-btn btn-primary"
//                 onClick={handleSave}
//               >
//                 <span className="OAI-btn-icon">💾</span>
//                 Save Configuration
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OAuthIntegration;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './OAuthIntegration.css';
import axios from 'axios';
import { FaSpinner, FaCheck, FaTimes, FaSave, FaArrowLeft } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:3003'; // Backend API base URL

const OAuthIntegration = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const location = useLocation();
  const successMessage = location.state?.successMessage;

  // Initial form data
  const [formData, setFormData] = useState({
    providerType: 'linkedin',
    providerName: '',
    clientId: '',
    clientSecret: '',
    authorizeEndpoint: '',
    tokenEndpoint: '',
    userInfoEndpoint: '',
    defaultScopes: ''
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // LinkedIn defaults (auto-populate)
  const LINKEDIN_DEFAULTS = {
    providerType: 'linkedin',
    authorizeEndpoint: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenEndpoint: 'https://www.linkedin.com/oauth/v2/accessToken',
    userInfoEndpoint: 'https://api.linkedin.com/v2/me',
    defaultScopes: 'profile email w_member_social r_liteprofile r_emailaddress'
  };

  // Fetch existing integration for edit mode
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchIntegration(id);
    } else {
      // New integration - set LinkedIn defaults
      setFormData(prev => ({
        ...prev,
        ...LINKEDIN_DEFAULTS
      }));
    }
  }, [id]);

  // Show success message on navigation
  useEffect(() => {
    if (successMessage) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        // Clear the message from location state
        navigate(location.pathname, { replace: true, state: {} });
      }, 3000);
    }
  }, [successMessage, navigate, location]);

  const fetchIntegration = async (integrationId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/integrations/${integrationId}`);
      const integration = response.data.integration;
      
      // Transform backend data to form format
      setFormData({
        providerType: integration.providerType,
        providerName: integration.providerName,
        clientId: integration.clientId,
        clientSecret: integration.clientSecretKey || '',
        authorizeEndpoint: integration.authorizedEndpointURL || '',
        tokenEndpoint: integration.tokenEndpointURL || '',
        userInfoEndpoint: integration.userInfoEndpointURL || '',
        defaultScopes: integration.defaultScopes || ''
      });
      
      console.log(`✅ Loaded integration ${integrationId} for editing`);
    } catch (err) {
      console.error('Error fetching integration:', err);
      setError(
        err.response?.data?.error || 
        `Failed to load integration ${integrationId}. It may have been deleted.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        providerType: formData.providerType,
        providerName: formData.providerName,
        clientId: formData.clientId,
        clientSecretKey: formData.clientSecret, // Map to backend field name
        authorizedEndpointURL: formData.authorizeEndpoint,
        tokenEndpointURL: formData.tokenEndpoint,
        userInfoEndpointURL: formData.userInfoEndpoint,
        defaultScopes: formData.defaultScopes,
        callBackURL: `${window.location.origin}/linkedin-externals/callback` // Auto-generate
      };

      let response;
      if (isEditMode) {
        // Update existing integration
        response = await axios.put(`${API_BASE_URL}/integrations/${id}`, payload);
        console.log(`✅ Updated integration ${id}`);
      } else {
        // Create new integration
        response = await axios.post(`${API_BASE_URL}/integrations`, payload);
        console.log(`✅ Created new integration ${response.data.integrationId}`);
      }

      setSuccess(true);
      
      // Show success message and navigate back
      const successMsg = isEditMode 
        ? `"${formData.providerName}" integration updated successfully!`
        : `New "${formData.providerName}" integration created successfully!`;
      
      setTimeout(() => {
        navigate('/admin/socialsetups/linkedinoauth', {
          state: { successMessage: successMsg }
        });
      }, 1500);

    } catch (err) {
      console.error('Save integration error:', err);
      
      let errorMessage = 'Failed to save integration';
      if (err.response?.status === 400) {
        errorMessage = err.response.data.error || 'Invalid data provided';
      } else if (err.response?.status === 409) {
        errorMessage = 'Integration already exists. Please use a different name.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode && !window.confirm('Discard changes and go back?')) {
      return;
    }
    navigate('/admin/socialsetups/linkedinoauth');
  };

  const handleAddNew = () => {
    navigate("/admin/socialsetups/linkedinoauth/create/credentials");
  };

  // Auto-populate LinkedIn defaults when provider changes
  const handleProviderChange = (e) => {
    const providerType = e.target.value;
    setFormData(prev => {
      if (providerType === 'linkedin') {
        return {
          ...prev,
          providerType,
          ...LINKEDIN_DEFAULTS
        };
      }
      return { ...prev, providerType };
    });
  };

  // Generate callback URL based on current origin
  const generateCallbackUrl = () => {
    const origin = window.location.origin;
    return `${origin}/linkedin-externals/callback`;
  };

  // Render error message
  const renderError = () => {
    if (!error) return null;
    return (
      <div className="OAI-error-banner">
        <FaTimes className="OAI-error-icon" />
        <span className="OAI-error-message">{error}</span>
        <button 
          onClick={() => setError(null)} 
          className="OAI-error-close"
          aria-label="Close error"
        >
          ×
        </button>
      </div>
    );
  };

  // Render success message
  const renderSuccess = () => {
    if (!success) return null;
    return (
      <div className="OAI-success-banner">
        <FaCheck className="OAI-success-icon" />
        <span className="OAI-success-message">
          {isEditMode 
            ? `"${formData.providerName}" updated successfully!`
            : `New "${formData.providerName}" integration created!`
          }
        </span>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="OAI-oauth-fullpage">
        <div className="OAI-loading-container">
          <FaSpinner className="OAI-loading-spinner" />
          <p className="OAI-loading-text">
            {isEditMode ? 'Loading integration details...' : 'Preparing form...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="OAI-oauth-fullpage">
      {/* Background Elements */}
      <div className="OAI-background-elements">
        <div className="OAI-floating-shape shape-1"></div>
        <div className="OAI-floating-shape shape-2"></div>
        <div className="OAI-floating-shape shape-3"></div>
        <div className="OAI-floating-shape shape-4"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="OAI-oauth-nav">
        <div className="OAI-nav-brand">
          <span className="OAI-brand-icon">🔐</span>
          <span className="OAI-brand-text">OAuth Manager</span>
        </div>
        <div className="OAI-nav-actions">
          <button 
            className="OAI-nav-btn OAI-credentials-btn" 
            onClick={() => navigate('/admin/socialsetups/linkedinoauth')}
            title="Back to integrations list"
          >
            <FaArrowLeft /> Back
          </button>
          <button className="OAI-nav-btn OAI-credentials-btn" onClick={handleAddNew}>
            Credentials Setup
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="OAI-oauth-main">
        {/* Form Panel */}
        <div className="OAI-form-panel">
          <div className="OAI-form-container">
            <div className="OAI-form-header">
              <h2 className="OAI-form-title">
                {isEditMode ? 'Edit Integration' : 'Create New Integration'}
              </h2>
              <p className="OAI-form-description">
                {isEditMode 
                  ? `Update the configuration for "${formData.providerName}"`
                  : 'Configure your OAuth provider settings to enable secure authentication'
                }
              </p>
              {isEditMode && (
                <div className="OAI-edit-info">
                  <span className="OAI-edit-badge">Editing ID: {id}</span>
                  <span className="OAI-edit-status">
                    Status: {formData.status || 'Active'}
                  </span>
                </div>
              )}
            </div>

            {/* Success/Error Messages */}
            {renderSuccess()}
            {renderError()}

            <form onSubmit={(e) => e.preventDefault()} className="OAI-oauth-form">
              {/* Row 1: Provider Type & Name */}
              <div className="OAI-form-grid">
                <div className="OAI-form-row">
                  <label className="OAI-form-label" htmlFor="providerType">
                    Provider Type <span className="OAI-required">*</span>
                  </label>
                  <select 
                    id="providerType"
                    name="providerType"
                    value={formData.providerType}
                    onChange={handleProviderChange}
                    className="OAI-form-input"
                    disabled={isEditMode} // Don't allow changing provider type during edit
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Google">Google</option>
                    <option value="GitHub">GitHub</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                  <small className="OAI-form-hint">
                    OAuth provider (LinkedIn recommended for this integration)
                  </small>
                </div>

                <div className="OAI-form-row">
                  <label className="OAI-form-label" htmlFor="providerName">
                    Provider Name <span className="OAI-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="providerName"
                    name="providerName"
                    value={formData.providerName}
                    onChange={handleInputChange}
                    className="OAI-form-input"
                    placeholder="e.g., Company LinkedIn App"
                    required
                    maxLength={100}
                  />
                  <small className="OAI-form-hint">
                    Human-readable name for your integration
                  </small>
                </div>
              </div>

              {/* Row 2: Client Credentials */}
              <div className="OAI-form-grid">
                <div className="OAI-form-row">
                  <label className="OAI-form-label" htmlFor="clientId">
                    Client ID <span className="OAI-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="clientId"
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleInputChange}
                    className="OAI-form-input"
                    placeholder="From LinkedIn Developer Portal"
                    required
                  />
                  <small className="OAI-form-hint">
                    Your LinkedIn App Client ID
                  </small>
                </div>

                <div className="OAI-form-row">
                  <label className="OAI-form-label" htmlFor="clientSecret">
                    Client Secret <span className="OAI-required">*</span>
                  </label>
                  <div className="OAI-password-input-wrapper">
                    <input
                      type={formData.showSecret ? 'text' : 'password'}
                      id="clientSecret"
                      name="clientSecret"
                      value={formData.clientSecret}
                      onChange={handleInputChange}
                      className="OAI-form-input"
                      placeholder="From LinkedIn Developer Portal"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, showSecret: !prev.showSecret }))}
                      className="OAI-password-toggle"
                      title={formData.showSecret ? 'Hide secret' : 'Show secret'}
                    >
                      {formData.showSecret ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <small className="OAI-form-hint">
                    Keep this secret! Only visible to you
                  </small>
                </div>
              </div>

              {/* Callback URL (Auto-generated) */}
              <div className="OAI-form-row OAI-full-width">
                <label className="OAI-form-label" htmlFor="callBackURL">
                  Callback URL <span className="OAI-required">*</span>
                </label>
                <div className="OAI-callback-input-wrapper">
                  <input
                    type="text"
                    id="callBackURL"
                    name="callBackURL"
                    value={generateCallbackUrl()}
                    readOnly
                    className="OAI-form-input OAI-callback-input"
                    placeholder="Auto-generated callback URL"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generateCallbackUrl());
                      // Show copied feedback
                    }}
                    className="OAI-copy-button"
                    title="Copy callback URL"
                  >
                    📋
                  </button>
                </div>
                <small className="OAI-form-hint">
                  Add this URL to your LinkedIn app's "Authorized redirect URLs"
                </small>
              </div>

              {/* Endpoints Section */}
              <div className="OAI-section-divider">
                <span className="OAI-section-title">
                  API Endpoints {formData.providerType === 'linkedin' && '(Auto-filled for LinkedIn)'}
                </span>
              </div>

              <div className="OAI-form-grid">
                <div className="OAI-form-row">
                  <label className="OAI-form-label" htmlFor="authorizeEndpoint">
                    Authorize Endpoint URL
                  </label>
                  <input
                    type="url"
                    id="authorizeEndpoint"
                    name="authorizeEndpoint"
                    value={formData.authorizeEndpoint}
                    onChange={handleInputChange}
                    className="OAI-form-input"
                    placeholder="https://www.linkedin.com/oauth/v2/authorization"
                    disabled={formData.providerType === 'linkedin'}
                  />
                  <small className="OAI-form-hint">
                    Where users authorize your app
                  </small>
                </div>

                <div className="OAI-form-row">
                  <label className="OAI-form-label" htmlFor="tokenEndpoint">
                    Token Endpoint URL
                  </label>
                  <input
                    type="url"
                    id="tokenEndpoint"
                    name="tokenEndpoint"
                    value={formData.tokenEndpoint}
                    onChange={handleInputChange}
                    className="OAI-form-input"
                    placeholder="https://www.linkedin.com/oauth/v2/accessToken"
                    disabled={formData.providerType === 'linkedin'}
                  />
                  <small className="OAI-form-hint">
                    Where you exchange code for access token
                  </small>
                </div>
              </div>

              <div className="OAI-form-row">
                <label className="OAI-form-label" htmlFor="userInfoEndpoint">
                  User Info Endpoint URL
                </label>
                <input
                  type="url"
                  id="userInfoEndpoint"
                  name="userInfoEndpoint"
                  value={formData.userInfoEndpoint}
                  onChange={handleInputChange}
                  className="OAI-form-input"
                  placeholder="https://api.linkedin.com/v2/me"
                  disabled={formData.providerType === 'linkedin'}
                />
                <small className="OAI-form-hint">
                  Where you get user profile information
                </small>
              </div>

              <div className="OAI-form-row OAI-full-width">
                <label className="OAI-form-label" htmlFor="defaultScopes">
                  Default Scopes
                </label>
                <input
                  type="text"
                  id="defaultScopes"
                  name="defaultScopes"
                  value={formData.defaultScopes}
                  onChange={handleInputChange}
                  className="OAI-form-input"
                  placeholder="profile email w_member_social"
                  disabled={formData.providerType === 'linkedin'}
                />
                <small className="OAI-form-hint">
                  Space-separated permissions to request from users
                </small>
              </div>

              
            </form>

            {/* Action Buttons */}
            <div className="OAI-oauth-actions">
              <button 
                type="button" 
                className="OAI-btn btn-secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                {isEditMode ? 'Discard Changes' : 'Cancel'}
              </button>
              <button 
                type="button" 
                className="OAI-btn btn-primary"
                onClick={handleSave}
                disabled={isSubmitting || !formData.providerName || !formData.clientId || !formData.clientSecret}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="OAI-loading-spinner" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <FaSave className="OAI-save-icon" />
                    {isEditMode ? 'Update Integration' : 'Create Integration'}
                  </>
                )}
              </button>
            </div>

            {/* Backend Status */}
            <div className="OAI-backend-status">
              <span>🔌 Backend:</span>
              <code className="OAI-api-url">{API_BASE_URL}/integrations</code>
              <span className={`OAI-status ${isSubmitting ? 'loading' : 'connected'}`}>
                {isSubmitting ? '🔄 Saving...' : '✅ Connected'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate callback URL
// const generateCallbackUrl = () => {
//   const origin = window.location.origin;
//   return `${origin}/linkedin-externals/callback`;
// };

export default OAuthIntegration;