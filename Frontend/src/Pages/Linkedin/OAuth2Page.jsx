
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './OAuth2Page.css';
// import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'; // Importing icons from react-icons

// const OAuth2Page = () => {
//   const navigate = useNavigate();
//   const [providers, setProviders] = useState([
//     {
//       id: 1,
//       providerType: 'LinkedIn',
//       providerName: 'Manish',
//     },
//   ]);
//   const [isLoading, setIsLoading] = useState(false); // Added loading state

//   const handleAddNew = () => {
//     setIsLoading(true);
//     // Simulate async operation (e.g., navigating to create page)
//     setTimeout(() => {
//       navigate('/admin/socialsetups/linkedinoauth/create');
//       setIsLoading(false);
//     }, 500);
//   };

//   const handleEdit = (providerId) => {
//     alert(`Edit provider with ID: ${providerId}`);
//   };

//   const handleDelete = (providerId) => {
//     if (window.confirm('Are you sure you want to delete this provider?')) {
//       const newProviders = providers.filter((provider) => provider.id !== providerId);
//       setProviders(newProviders);
//       alert(`Deleted provider with ID: ${providerId}`);
//     }
//   };

//   return (
//     <div className="OA2P-oauth2-container">
//       <div className="OA2P-header-section">
//         <h1 className="OA2P-header-title">OAuth 2.0</h1>
//         <button
//           className="OA2P-new-button"
//           onClick={handleAddNew}
//           disabled={isLoading}
//           aria-label="Add New Provider"
//         >
//           <FaPlus className="OA2P-icon" />
//           {isLoading ? 'Loading...' : 'Add New'}
//         </button>
//       </div>

//       <div className="OA2P-note-section">
//         <span className="OA2P-note-icon">ℹ️</span> Obtain Client ID and Client Secret from the LinkedIn Developer Portal for authentication.
//       </div>

//       <div className="OA2P-table-section">
//         <table className="OA2P-provider-table">
//           <thead>
//             <tr>
//               <th>Actions</th>
//               <th>Provider Name</th>
//               <th>Provider Type</th>
//             </tr>
//           </thead>
//           <tbody>
//             {providers.map((provider) => (
//               <tr key={provider.id} className="OA2P-table-row">
//                 <td className="OA2P-action-cell">
//                   <button
//                     onClick={() => handleEdit(provider.id)}
//                     className="OA2P-action-button OA2P-edit-button"
//                     aria-label={`Edit ${provider.providerType}`}
//                   >
//                     <FaEdit className="OA2P-icon" /> Edit
//                   </button>
//                   <button
//                     onClick={() => handleDelete(provider.id)}
//                     className="OA2P-action-button OA2P-delete-button"
//                     aria-label={`Delete ${provider.providerType}`}
//                   >
//                     <FaTrash className="OA2P-icon" /> Delete
//                   </button>
//                 </td>
//                 <td>{provider.providerName}</td>
//                 <td>{provider.providerType}</td>
//               </tr>
//             ))}
//             {providers.length === 0 && (
//               <tr>
//                 <td colSpan="3" className="OA2P-no-data-cell">
//                   No LinkedIn providers configured. Click "Add New" to set up a provider.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default OAuth2Page;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OAuth2Page.css';
import { FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import axios from 'axios'; // Add axios for API calls

const API_BASE_URL = 'http://localhost:3003'; // Backend API base URL

const OAuth2Page = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch providers from backend on component mount
  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setIsFetching(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/integrations`);
      
      // Transform backend data to match frontend structure
      const transformedProviders = response.data.integrations.map(integration => ({
        id: integration.id,
        providerType: integration.providerType,
        providerName: integration.providerName,
        clientId: integration.clientId,
        callBackURL: integration.callBackURL,
        defaultScopes: integration.defaultScopes,
        createdAt: integration.createdAt,
        // Additional backend data for edit form
        authorizedEndpointURL: integration.authorizedEndpointURL,
        tokenEndpointURL: integration.tokenEndpointURL,
        userInfoEndpointURL: integration.userInfoEndpointURL,
      }));
      
      setProviders(transformedProviders);
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError(
        err.response?.data?.error || 
        err.message || 
        'Failed to fetch LinkedIn integrations. Please check if the backend server is running.'
      );
    } finally {
      setIsFetching(false);
    }
  };

  const handleAddNew = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Navigate to create page
      navigate('/admin/socialsetups/linkedinoauth/create');
    } catch (err) {
      setError('Failed to navigate to create page');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (providerId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch the specific provider details for editing
      const response = await axios.get(`${API_BASE_URL}/integrations/${providerId}`);
      const providerData = response.data.integration;
      
      // Navigate to edit page with provider data
      navigate(`/admin/socialsetups/linkedinoauth/edit/${providerId}`, {
        state: { 
          provider: providerData,
          fromList: true 
        }
      });
    } catch (err) {
      console.error('Error fetching provider for edit:', err);
      setError(
        err.response?.data?.error || 
        'Failed to load provider details for editing'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (providerId) => {
    if (!window.confirm('Are you sure you want to delete this LinkedIn integration? This action cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Delete from backend
      await axios.delete(`${API_BASE_URL}/integrations/${providerId}`);
      
      // Update local state
      setProviders(prev => prev.filter(provider => provider.id !== providerId));
      
      alert(`LinkedIn integration "${providerId}" deleted successfully`);
    } catch (err) {
      console.error('Error deleting provider:', err);
      setError(
        err.response?.data?.error || 
        'Failed to delete LinkedIn integration. Please try again.'
      );
      alert('Failed to delete integration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchProviders();
  };

  // Handle backend errors display
  const renderError = () => {
    if (!error) return null;
    
    return (
      <div className="OA2P-error-banner">
        <span className="OA2P-error-icon">⚠️</span>
        <span className="OA2P-error-message">{error}</span>
        <button 
          onClick={() => setError(null)} 
          className="OA2P-error-close"
          aria-label="Close error message"
        >
          ×
        </button>
      </div>
    );
  };

  // Handle loading states
  if (isFetching) {
    return (
      <div className="OA2P-oauth2-container">
        <div className="OA2P-loading-container">
          <FaSpinner className="OA2P-loading-spinner" />
          <p>Loading LinkedIn integrations...</p>
          <p className="OA2P-loading-subtext">
            Connecting to backend at {API_BASE_URL}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="OA2P-oauth2-container">
      {/* Error Banner */}
      {renderError()}

      {/* Header Section */}
      <div className="OA2P-header-section">
        <div className="OA2P-header-left">
          <h1 className="OA2P-header-title">OAuth 2.0 Integrations</h1>
          <p className="OA2P-header-subtitle">
            Manage your LinkedIn OAuth 2.0 configurations
            {providers.length > 0 && ` • ${providers.length} integration${providers.length !== 1 ? 's' : ''} active`}
          </p>
        </div>
        
        <div className="OA2P-header-right">
          <button
            onClick={handleRefresh}
            className="OA2P-refresh-button"
            disabled={isLoading || isFetching}
            title="Refresh integrations from backend"
          >
            🔄 Refresh
          </button>
          <button
            className="OA2P-new-button"
            onClick={handleAddNew}
            disabled={isLoading}
            aria-label="Add New LinkedIn Integration"
          >
            <FaPlus className="OA2P-icon" />
            {isLoading ? <FaSpinner className="OA2P-loading-icon" /> : 'Add New'}
          </button>
        </div>
      </div>

      {/* Note Section */}
      <div className="OA2P-note-section">
        <span className="OA2P-note-icon">ℹ️</span>
        <span className="OA2P-note-text">
          Obtain Client ID and Client Secret from the{' '}
          <a 
            href="https://www.linkedin.com/developers/apps" 
            target="_blank" 
            rel="noopener noreferrer"
            className="OA2P-note-link"
          >
            LinkedIn Developer Portal
          </a>{' '}
          for authentication. All configurations are stored securely in your backend.
        </span>
      </div>

      {/* Table Section */}
      <div className="OA2P-table-section">
        {providers.length === 0 ? (
          <div className="OA2P-empty-state">
            <div className="OA2P-empty-icon">🔗</div>
            <h3 className="OA2P-empty-title">No LinkedIn Integrations</h3>
            <p className="OA2P-empty-subtitle">
              Get started by adding your first LinkedIn OAuth 2.0 integration.
            </p>
            <button 
              className="OA2P-empty-action" 
              onClick={handleAddNew}
              disabled={isLoading}
            >
              <FaPlus className="OA2P-icon" />
              Create First Integration
            </button>
            <p className="OA2P-empty-hint">
              Backend API: <code>POST {API_BASE_URL}/integrations</code>
            </p>
          </div>
        ) : (
          <>
            <div className="OA2P-table-header">
              <h3 className="OA2P-table-title">
                Active Integrations ({providers.length})
              </h3>
              <div className="OA2P-table-controls">
                <span className="OA2P-table-info">
                  Last synced: {new Date().toLocaleTimeString()}
                </span>
                <button 
                  onClick={handleRefresh} 
                  disabled={isLoading || isFetching}
                  className="OA2P-table-refresh"
                  title="Refresh from backend"
                >
                  {isFetching ? <FaSpinner className="OA2P-loading-icon" /> : '🔄'}
                </button>
              </div>
            </div>

            <div className="OA2P-table-wrapper">
              <table className="OA2P-provider-table">
                <thead>
                  <tr>
                    <th className="OA2P-action-header">Actions</th>
                    <th>Provider Name</th>
                    <th>Provider Type</th>
                    <th>Client ID</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((provider) => (
                    <tr key={provider.id} className="OA2P-table-row">
                      <td className="OA2P-action-cell">
                        <div className="OA2P-action-buttons">
                          <button
                            onClick={() => handleEdit(provider.id)}
                            className="OA2P-action-button OA2P-edit-button"
                            disabled={isLoading}
                            title={`Edit ${provider.providerName}`}
                          >
                            <FaEdit className="OA2P-icon" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(provider.id)}
                            className="OA2P-action-button OA2P-delete-button"
                            disabled={isLoading}
                            title={`Delete ${provider.providerName}`}
                          >
                            <FaTrash className="OA2P-icon" />
                            Delete
                          </button>
                        </div>
                      </td>
                      <td className="OA2P-provider-cell">
                        <div>
                          <div className="OA2P-provider-name">{provider.providerName}</div>
                          <div className="OA2P-provider-id">ID: {provider.id}</div>
                        </div>
                      </td>
                      <td className="OA2P-type-cell">
                        <span className={`OA2P-type-badge OA2P-type-${provider.providerType.toLowerCase()}`}>
                          {provider.providerType}
                        </span>
                      </td>
                      <td className="OA2P-client-cell">
                        <code className="OA2P-client-id">
                          {provider.clientId?.substring(0, 8)}...
                        </code>
                        <div className="OA2P-client-copy" title="Copy Client ID">
                          📋
                        </div>
                      </td>
                      <td className="OA2P-status-cell">
                        <span className={`OA2P-status-badge OA2P-status-active`}>
                          Active
                        </span>
                      </td>
                      <td className="OA2P-date-cell">
                        {new Date(provider.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Footer with API info */}
      {/* <div className="OA2P-footer">
        <div className="OA2P-api-info">
          <span>🔌 Backend API:</span>
           <code className="OA2P-api-url">{API_BASE_URL}/integrations</code> 
           <span className="OA2P-api-status">
            {isFetching ? '🔄 Syncing...' : '✅ Connected'}
          </span> *
        </div>
      </div> */}
    </div>
  );
};

export default OAuth2Page;