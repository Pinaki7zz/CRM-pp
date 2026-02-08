
// import useCredentials from './UseCredentials';
// import './CreateCredentialSetupPage.css';
// import NewIdentityProvider from './NewIdentityProviderPopPup';
// import NewExternalCredential from './ExternalCredentialPopPup';
// import NewPrincipal from './NewPrincipalPopPup';
// import NewNamedCredential from './NewNamedCredentialPopPup';

// const CreateCredentialSetup = () => {
//   const {
//     identityProviders,
//     externalCredentials,
//     namedCredentials,
//     principals,
//     addCredential,
//     deleteCredential,
//     modal,
//     openModal,
//     closeModal
//   } = useCredentials();

//   return (
//     <div className="CCSP-credential-setup-container">
//       <h2>Credentials Setup</h2>

//       {/* External Authentication (Identity Provider) Section */}
//       <div className="CCSP-setup-section">
//         <div className="CCSP-section-header">
//           <h3>External Authentication (Identity Provider)</h3>
//           <button className="CCSP-add-button" onClick={() => openModal('identityProvider')}>Add Identity Provider</button>
//         </div>
//         <div className="CCSP-credentials-list">
//           {identityProviders.map(provider => (
//             <div className="CCSP-credential-row" key={provider.id}>
//               <span>{provider.name}</span>
//               <span>{provider.protocol}</span>
//               <div className="CCSP-credential-actions">
//                 <span>Actions ▾</span>
//                 <div className="CCSP-actions-dropdown">
//                   <a href="#" onClick={() => deleteCredential('identityProviders', provider.id)}>Delete</a>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* External Credentials Section */}
//       {/* <div className="CCSP-setup-section">
//         <div className="CCSP-section-header">
//           <h3>External Credentials</h3>
//           <button className="CCSP-add-button" onClick={() => openModal('externalCredential')}>Add External Credentials</button>
//           <button className="CCSP-add-button" onClick={() => openModal('principal')}>Add Principal</button>
//         </div>
//         <div className="CCSP-credentials-list">
//           {externalCredentials.map(credential => (
//             <div className="CCSP-credential-row" key={credential.id}>
//               <span>{credential.name}</span>
//               <span>{credential.protocol}</span>
//               <div className="CCSP-credential-actions">
//                 <span>Actions ▾</span>
//                 <div className="CCSP-actions-dropdown">
//                   <a href="#" onClick={() => deleteCredential('externalCredentials', credential.id)}>Delete</a>
//                 </div>
//               </div>
//             </div>
//           ))}
//           <h4>Principals:</h4>
//           {principals.map(principal => (
//             <div className="CCSP-credential-row" key={principal.id}>
//               <span>{principal.name}</span>
//               <span>{principal.type}</span>
//               <div className="CCSP-credential-actions">
//                 <span>Actions ▾</span>
//                 <div className="CCSP-actions-dropdown">
//                   <a href="#" onClick={() => deleteCredential('principals', principal.id)}>Delete</a>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div> */}

//       <div className="CCSP-setup-section">
//   {/* External Credentials Section */}
//   <div className="CCSP-section-header">
//     <h3>External Credentials</h3>
//     <button 
//       className="CCSP-add-button" 
//       onClick={() => openModal('externalCredential')}
//     >
//       Add External Credential
//     </button>
//   </div>
//   <div className="CCSP-credentials-list">
//     {externalCredentials.map(credential => (
//       <div className="CCSP-credential-row" key={credential.id}>
//         <span>{credential.name}</span>
//         <span>{credential.protocol}</span>
//         <div className="CCSP-credential-actions">
//           <span>Actions ▾</span>
//           <div className="CCSP-actions-dropdown">
//             <a 
//               href="#" 
//               onClick={() => deleteCredential('externalCredentials', credential.id)}
//             >
//               Delete
//             </a>
//           </div>
//         </div>
//       </div>
//     ))}
//   </div>
// </div>

// <div className="CCSP-setup-section">
//   {/* Principals Section */}
//   <div className="CCSP-section-header">
//     <h3>Principals</h3>
//     <button 
//       className="CCSP-add-button" 
//       onClick={() => openModal('principal')}
//     >
//       Add Principal
//     </button>
//   </div>
//   <div className="CCSP-credentials-list">
//     {principals.map(principal => (
//       <div className="CCSP-credential-row" key={principal.id}>
//         <span>{principal.name}</span>
//         <span>{principal.type}</span>
//         <div className="CCSP-credential-actions">
//           <span>Actions ▾</span>
//           <div className="CCSP-actions-dropdown">
//             <a 
//               href="#" 
//               onClick={() => deleteCredential('principals', principal.id)}
//             >
//               Delete
//             </a>
//           </div>
//         </div>
//       </div>
//     ))}
//   </div>
// </div>


//     {/* credital name */}

//       {/* Named Credentials Section */}
//       <div className="CCSP-setup-section">
//         <div className="CCSP-section-header">
//           <h3>Named Credentials</h3>
//           <button className="CCSP-add-button" onClick={() => openModal('namedCredential')}>Add Named Credentials</button>
//         </div>
//         <div className="CCSP-credentials-list">
//           {namedCredentials.map(named => (
//             <div className="CCSP-credential-row" key={named.id}>
//               <span>{named.name}</span>
//               <span>{named.baseURL}</span>
//               <div className="CCSP-credential-actions">
//                 <span>Actions ▾</span>
//                 <div className="CCSP-actions-dropdown">
//                   <a href="#" onClick={() => deleteCredential('namedCredentials', named.id)}>Delete</a>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Modals */}
//       {modal.type === 'identityProvider' && <NewIdentityProvider onSave={(data) => addCredential('identityProviders', data)} onClose={closeModal} />}
//       {modal.type === 'externalCredential' && <NewExternalCredential onSave={(data) => addCredential('externalCredentials', data)} onClose={closeModal} />}
//       {modal.type === 'principal' && <NewPrincipal onSave={(data) => addCredential('principals', data)} onClose={closeModal} />}
//       {modal.type === 'namedCredential' && <NewNamedCredential onSave={(data) => addCredential('namedCredentials', data)} onClose={closeModal} />} 
//     </div>
//   );
// };

// export default CreateCredentialSetup;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateCredentialSetupPage.css';
import axios from 'axios';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSpinner, 
  FaCheckCircle, 
  FaExclamationTriangle 
} from 'react-icons/fa';
import NewIdentityProvider from './NewIdentityProviderPopPup';
import NewExternalCredential from './ExternalCredentialPopPup';
import NewPrincipal from './NewPrincipalPopPup';
import NewNamedCredential from './NewNamedCredentialPopPup';

const API_BASE_URL = 'http://localhost:3003';

const CreateCredentialSetup = () => {
  const navigate = useNavigate();

  // State for all credential types
  const [identityProviders, setIdentityProviders] = useState([]);
  const [externalCredentials, setExternalCredentials] = useState([]);
  const [principals, setPrincipals] = useState([]);
  const [namedCredentials, setNamedCredentials] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState({
    identityProviders: true,
    externalCredentials: true,
    principals: true,
    namedCredentials: true
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state
  const [modal, setModal] = useState({ type: null, data: null });

  // Fetch all data on mount
  useEffect(() => {
    fetchAllCredentials();
  }, []);

  const fetchAllCredentials = async () => {
    try {
      setError(null);
      
      // Fetch Identity Providers
      const [identityRes, externalRes, principalRes, namedRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/add-identity-providers`),
        axios.get(`${API_BASE_URL}/add-external-bodies`),
        axios.get(`${API_BASE_URL}/add-principals`),
        axios.get(`${API_BASE_URL}/add-named-credentials`)
      ]);

      setIdentityProviders(identityRes.data.addIdentityProviders || []);
      setExternalCredentials(externalRes.data.addExternalBodies || []);
      setPrincipals(principalRes.data.addPrincipals || []);
      setNamedCredentials(namedRes.data.addNamedCredentials || []);
    } catch (err) {
      console.error('Error fetching credentials:', err);
      setError(
        err.response?.data?.error || 
        'Failed to fetch credential configurations. Please check backend connection.'
      );
    } finally {
      setLoading({
        identityProviders: false,
        externalCredentials: false,
        principals: false,
        namedCredentials: false
      });
    }
  };

  const openModal = (type, existingData = null) => {
    setModal({ type, data: existingData });
  };

  const closeModal = () => {
    setModal({ type: null, data: null });
    fetchAllCredentials(); // Refresh data after modal close
  };

  const addCredential = async (type, data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      let response;
      const endpointMap = {
        identityProviders: '/add-identity-providers',
        externalCredentials: '/add-external-bodies',
        principals: '/add-principals',
        namedCredentials: '/add-named-credentials'
      };

      // Transform data based on type
      let payload = data;
      if (type === 'namedCredentials') {
        payload = {
          ...data,
          enabledForCallouts: data.enabledForCallouts || true,
          generateAuthorizationHeader: data.generateAuthorizationHeader || false
        };
      }

      response = await axios.post(`${API_BASE_URL}${endpointMap[type]}`, payload);
      
      console.log(`${type} created:`, response.data);
      closeModal(); // Close modal and refresh
      showSuccess(`${type.replace(/([A-Z])/g, ' $1').trim()} created successfully!`);
      
    } catch (err) {
      console.error(`Error creating ${type}:`, err);
      setError(
        err.response?.data?.error || 
        `Failed to create ${type}. Please check your input and try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCredential = async (type, credentialId, data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const endpointMap = {
        identityProviders: '/add-identity-providers',
        externalCredentials: '/add-external-bodies',
        principals: '/add-principals',
        namedCredentials: '/add-named-credentials'
      };

      let payload = data;
      if (type === 'namedCredentials') {
        payload = {
          ...data,
          enabledForCallouts: data.enabledForCallouts || true,
          generateAuthorizationHeader: data.generateAuthorizationHeader || false
        };
      }

      const response = await axios.put(`${API_BASE_URL}${endpointMap[type]}/${credentialId}`, payload);
      
      console.log(`${type} updated:`, response.data);
      closeModal();
      showSuccess(`${type.replace(/([A-Z])/g, ' $1').trim()} updated successfully!`);
      
    } catch (err) {
      console.error(`Error updating ${type}:`, err);
      setError(
        err.response?.data?.error || 
        `Failed to update ${type}. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCredential = async (type, credentialId) => {
    if (!window.confirm(`Are you sure you want to delete this ${type.replace(/([A-Z])/g, ' $1').trim()}?`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const endpointMap = {
        identityProviders: '/add-identity-providers',
        externalCredentials: '/add-external-bodies',
        principals: '/add-principals',
        namedCredentials: '/add-named-credentials'
      };

      await axios.delete(`${API_BASE_URL}${endpointMap[type]}/${credentialId}`);
      
      console.log(`${type} deleted: ${credentialId}`);
      showSuccess(`${type.replace(/([A-Z])/g, ' $1').trim()} deleted successfully!`);
      fetchAllCredentials(); // Refresh list
      
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
      setError(
        err.response?.data?.error || 
        `Failed to delete ${type}. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSuccess = (message) => {
    setError(null);
    // You can add toast notification here
    alert(message);
  };

  const renderError = () => {
    if (!error) return null;
    return (
      <div className="CCSP-error-banner">
        <FaExclamationTriangle className="CCSP-error-icon" />
        <span>{error}</span>
        <button 
          onClick={() => setError(null)} 
          className="CCSP-error-close"
        >
          ×
        </button>
      </div>
    );
  };

  const renderLoading = (section) => {
    if (!loading[section]) return null;
    return (
      <div className="CCSP-loading-row">
        <div className="CCSP-loading-cell">
          <FaSpinner className="CCSP-loading-spinner" />
          <span>Loading {section}...</span>
        </div>
      </div>
    );
  };

  const renderSection = (title, credentials, type, fields, addButtonText, modalType) => (
    <div className="CCSP-setup-section">
      <div className="CCSP-section-header">
        <h3>{title}</h3>
        <button 
          className="CCSP-add-button" 
          onClick={() => openModal(modalType)}
          disabled={isSubmitting}
        >
          <FaPlus className="CCSP-add-icon" />
          {addButtonText}
        </button>
      </div>
      
      <div className="CCSP-table-container">
        {renderLoading(type)}
        {credentials.length === 0 && !loading[type] && (
          <div className="CCSP-empty-state">
            <FaPlus className="CCSP-empty-icon" />
            <p>No {type.replace(/([A-Z])/g, ' $1').toLowerCase()} configured yet.</p>
            <p className="CCSP-empty-hint">Click "Add {addButtonText}" to get started.</p>
          </div>
        )}
        {credentials.length > 0 && !loading[type] && (
          <table className="CCSP-credentials-table">
            <thead>
              <tr>
                {fields.map(field => (
                  <th key={field.key} className={field.className || ''}>
                    {field.label}
                  </th>
                ))}
                <th className="CCSP-action-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {credentials.map(credential => (
                <tr key={credential.id} className="CCSP-credential-row">
                  {fields.map(field => (
                    <td key={field.key} className={field.className || ''}>
                      {field.render ? field.render(credential) : credential[field.key] || '—'}
                    </td>
                  ))}
                  <td className="CCSP-action-cell">
                    <div className="CCSP-action-buttons">
                      <button
                        onClick={() => openModal(modalType, credential)}
                        className="CCSP-action-btn CCSP-edit-btn"
                        title="Edit"
                        disabled={isSubmitting}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteCredential(type, credential.id)}
                        className="CCSP-action-btn CCSP-delete-btn"
                        title="Delete"
                        disabled={isSubmitting}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  return (
    <div className="CCSP-credential-setup-container">
      <div className="CCSP-header">
        <h1>Credentials Setup</h1>
        <p className="CCSP-header-subtitle">
          Configure your authentication providers and credentials
          <span className="CCSP-sync-status">
            {isSubmitting ? '🔄 Saving...' : '✅ Synced'}
          </span>
        </p>
      </div>

      {/* Error Banner */}
      {renderError()}

      {/* Identity Providers Section */}
      {renderSection(
        'External Authentication (Identity Provider)',
        identityProviders,
        'identityProviders',
        [
          { key: 'identityProviderName', label: 'Name' },
          { key: 'authenticationProtocol', label: 'Protocol' },
          { 
            key: 'authenticationFlowType', 
            label: 'Flow Type',
            render: (cred) => cred.authenticationFlowType?.replace('_', ' ') || '—'
          },
          { 
            key: 'clientId', 
            label: 'Client ID',
            render: (cred) => cred.clientId ? `${cred.clientId.substring(0, 8)}...` : '—',
            className: 'CCSP-mono'
          },
          { 
            key: 'createdAt', 
            label: 'Created',
            render: (cred) => new Date(cred.createdAt).toLocaleDateString(),
            className: 'CCSP-date'
          }
        ],
        'Add Identity Provider',
        'identityProvider'
      )}

      {/* External Credentials Section */}
      {renderSection(
        'External Credentials',
        externalCredentials,
        'externalCredentials',
        [
          { key: 'externalCredentialName', label: 'Name' },
          { key: 'authenticationProtocol', label: 'Protocol' },
          { 
            key: 'identityProvider', 
            label: 'Identity Provider',
            render: (cred) => cred.identityProvider || '—'
          },
          { key: 'scope', label: 'Scope', render: (cred) => cred.scope || 'Default' },
          { 
            key: 'createdAt', 
            label: 'Created',
            render: (cred) => new Date(cred.createdAt).toLocaleDateString(),
            className: 'CCSP-date'
          }
        ],
        'Add External Credential',
        'externalCredential'
      )}

      {/* Principals Section */}
      {renderSection(
        'Principals',
        principals,
        'principals',
        [
          { key: 'principalName', label: 'Name' },
          { key: 'principalType', label: 'Type' },
          { key: 'status', label: 'Status', render: (cred) => (
            <span className={`CCSP-status-badge CCSP-status-${cred.status.toLowerCase().replace('_', '-')}`}>
              {cred.status.replace('_', ' ')}
            </span>
          )},
          { key: 'scope', label: 'Scope', render: (cred) => cred.scope || 'Default' },
          { 
            key: 'updatedAt', 
            label: 'Last Updated',
            render: (cred) => new Date(cred.updatedAt).toLocaleDateString(),
            className: 'CCSP-date'
          }
        ],
        'Add Principal',
        'principal'
      )}

      {/* Named Credentials Section */}
      {renderSection(
        'Named Credentials',
        namedCredentials,
        'namedCredentials',
        [
          { key: 'credentialName', label: 'Name' },
          { 
            key: 'baseURL', 
            label: 'Base URL',
            render: (cred) => cred.baseURL || '—',
            className: 'CCSP-url'
          },
          { 
            key: 'externalCredential', 
            label: 'External Credential',
            render: (cred) => cred.externalCredential || '—'
          },
          { 
            key: 'enabledForCallouts', 
            label: 'Callouts',
            render: (cred) => cred.enabledForCallouts ? '✅ Enabled' : '❌ Disabled',
            className: 'CCSP-status'
          },
          { 
            key: 'createdAt', 
            label: 'Created',
            render: (cred) => new Date(cred.createdAt).toLocaleDateString(),
            className: 'CCSP-date'
          }
        ],
        'Add Named Credential',
        'namedCredential'
      )}

     

      {/* Modals */}
      {modal.type === 'identityProvider' && (
        <NewIdentityProvider 
          onSave={(data) => addCredential('identityProviders', data)} 
          onClose={closeModal}
          existingData={modal.data}
          isSubmitting={isSubmitting}
        />
      )}
      {modal.type === 'externalCredential' && (
        <NewExternalCredential 
          onSave={(data) => addCredential('externalCredentials', data)} 
          onClose={closeModal}
          existingData={modal.data}
          isSubmitting={isSubmitting}
        />
      )}
      {modal.type === 'principal' && (
        <NewPrincipal 
          onSave={(data) => addCredential('principals', data)} 
          onClose={closeModal}
          existingData={modal.data}
          isSubmitting={isSubmitting}
        />
      )}
      {modal.type === 'namedCredential' && (
        <NewNamedCredential 
          onSave={(data) => addCredential('namedCredentials', data)} 
          onClose={closeModal}
          existingData={modal.data}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default CreateCredentialSetup;