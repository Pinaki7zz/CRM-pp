import React, { useState } from 'react';
import { 
  Shield, 
  Plus, 
  Edit2, 
  Trash2, 
  Settings, 
  Key, 
  Globe, 
  Lock, 
  CheckCircle, 
  XCircle,
  MoreVertical,
  Save,
  X,
  AlertTriangle
} from 'lucide-react';
import './ExternalCredentialManagementInterface.css';

const ExternalCredentialManager = () => {
  const [credentialData, setCredentialData] = useState({
    externalCredentialName: '',
    authenticationProtocol: 'OAuth 2.0',
    authenticationFlowType: 'Browser Flow',
    scope: '',
    providerName: 'LinkedIn Lead Gen'
  });

  const [namedCredentials, setNamedCredentials] = useState([
    {
      id: 1,
      credentialName: 'LinkedIn_API_Credential',
      url: 'https://api.linkedin.com/v2/leads'
    }
  ]);

  const [principals, setPrincipals] = useState([
    {
      id: 1,
      principalName: 'linkedin_principal',
      principalType: 'User',
      scope: 'r_liteprofile,r_emailaddress',
      authenticationStatus: 'Configure/Not Configured',
      isConfigured: false
    }
  ]);

  const [showAddCredential, setShowAddCredential] = useState(false);
  const [showAddPrincipal, setShowAddPrincipal] = useState(false);
  const [editingCredential, setEditingCredential] = useState(null);
  const [editingPrincipal, setEditingPrincipal] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const [newCredential, setNewCredential] = useState({
    credentialName: '',
    url: ''
  });

  const [newPrincipal, setNewPrincipal] = useState({
    principalName: '',
    principalType: 'User',
    scope: '',
    authenticationStatus: 'Not Configured',
    isConfigured: false
  });

  const protocolOptions = ['OAuth 2.0', 'OAuth 1.0', 'SAML', 'JWT', 'API Key'];
  const flowTypeOptions = ['Browser Flow', 'Server Flow', 'Mobile Flow', 'Desktop Flow'];
  const principalTypeOptions = ['User', 'Service Account', 'Application', 'System'];
  const providerOptions = ['LinkedIn Lead Gen', 'Google', 'Facebook', 'Twitter', 'GitHub', 'Salesforce'];

  const handleCredentialChange = (field, value) => {
    setCredentialData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddNamedCredential = () => {
    if (newCredential.credentialName && newCredential.url) {
      const credential = {
        id: Date.now(),
        credentialName: newCredential.credentialName,
        url: newCredential.url
      };
      setNamedCredentials(prev => [...prev, credential]);
      setNewCredential({ credentialName: '', url: '' });
      setShowAddCredential(false);
    }
  };

  const handleEditNamedCredential = (id, updatedCredential) => {
    setNamedCredentials(prev => 
      prev.map(cred => cred.id === id ? { ...cred, ...updatedCredential } : cred)
    );
    setEditingCredential(null);
  };

  const handleDeleteNamedCredential = (id) => {
    if (window.confirm('Are you sure you want to delete this credential?')) {
      setNamedCredentials(prev => prev.filter(cred => cred.id !== id));
    }
  };

  const handleAddPrincipal = () => {
    if (newPrincipal.principalName) {
      const principal = {
        id: Date.now(),
        ...newPrincipal
      };
      setPrincipals(prev => [...prev, principal]);
      setNewPrincipal({
        principalName: '',
        principalType: 'User',
        scope: '',
        authenticationStatus: 'Not Configured',
        isConfigured: false
      });
      setShowAddPrincipal(false);
    }
  };

  const handleEditPrincipal = (id, updatedPrincipal) => {
    setPrincipals(prev => 
      prev.map(principal => principal.id === id ? { ...principal, ...updatedPrincipal } : principal)
    );
    setEditingPrincipal(null);
  };

  const handleDeletePrincipal = (id) => {
    if (window.confirm('Are you sure you want to delete this principal?')) {
      setPrincipals(prev => prev.filter(principal => principal.id !== id));
    }
  };

  const handleAuthenticate = (id) => {
    setPrincipals(prev => 
      prev.map(principal => 
        principal.id === id 
          ? { 
              ...principal, 
              isConfigured: true, 
              authenticationStatus: 'Configured' 
            }
          : principal
      )
    );
  };

  const StatusBadge = ({ isConfigured }) => {
    return (
      <div className={`status-badge ${isConfigured ? 'status-configured' : 'status-not-configured'}`}>
        {isConfigured ? (
          <>
            <CheckCircle className="ECMI-status-icon" />
            Configured
          </>
        ) : (
          <>
            <AlertTriangle className="ECMI-status-icon" />
            Not Configured
          </>
        )}
      </div>
    );
  };

  const ActionDropdown = ({ onEdit, onDelete, onAuthenticate, isConfigured }) => (
    <div className="ECMI-dropdown-container">
      <button
        onClick={() => setDropdownOpen(dropdownOpen ? null : 'action')}
        className="ECMI-dropdown-trigger"
      >
        <MoreVertical className="ECMI-dropdown-icon" />
      </button>
      {dropdownOpen === 'action' && (
        <div className="ECMI-dropdown-menu">
          <button
            onClick={() => {
              onEdit();
              setDropdownOpen(null);
            }}
            className="ECMI-dropdown-item dropdown-edit"
          >
            <Edit2 className="ECMI-dropdown-item-icon" />
            Edit
          </button>
          {!isConfigured && (
            <button
              onClick={() => {
                onAuthenticate();
                setDropdownOpen(null);
              }}
              className="ECMI-dropdown-item dropdown-authenticate"
            >
              <Key className="ECMI-dropdown-item-icon" />
              Authenticate
            </button>
          )}
          <button
            onClick={() => {
              onDelete();
              setDropdownOpen(null);
            }}
            className="ECMI-dropdown-item dropdown-delete"
          >
            <Trash2 className="ECMI-dropdown-item-icon" />
            Delete
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="ECMI-credential-manager">
      <div className="ECMI-container">
        
        {/* Header */}
        <div className="ECMI-header-card">
          <div className="ECMI-header-content">
            <div className="ECMI-header-icon">
              <Shield className="ECMI-icon" />
            </div>
            <h1 className="ECMI-header-title">External Credential Manager</h1>
          </div>
          <p className="ECMI-header-subtitle">Configure and manage external authentication credentials</p>
        </div>

        {/* External Credential Configuration */}
        <div className="ECMI-section-card">
          <div className="ECMI-section-header">
            <Key className="ECMI-section-icon" />
            <h2 className="ECMI-section-title">External Credential</h2>
          </div>
          
          <div className="ECMI-form-grid">
            <div className="ECMI-form-group">
              <label className="ECMI-form-label">
                External Credential Name
              </label>
              <input
                type="text"
                value={credentialData.externalCredentialName}
                onChange={(e) => handleCredentialChange('externalCredentialName', e.target.value)}
                placeholder="Enter credential name"
                className="ECMI-form-input"
              />
            </div>

            <div className="ECMI-form-group">
              <label className="ECMI-form-label">
                Authentication Protocol
              </label>
              <select
                value={credentialData.authenticationProtocol}
                onChange={(e) => handleCredentialChange('authenticationProtocol', e.target.value)}
                className="ECMI-form-select"
              >
                {protocolOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="ECMI-form-group">
              <label className="ECMI-form-label">
                Authentication Flow Type
              </label>
              <select
                value={credentialData.authenticationFlowType}
                onChange={(e) => handleCredentialChange('authenticationFlowType', e.target.value)}
                className="ECMI-form-select"
              >
                {flowTypeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="ECMI-form-group">
              <label className="ECMI-form-label">
                Provider Name
              </label>
              <select
                value={credentialData.providerName}
                onChange={(e) => handleCredentialChange('providerName', e.target.value)}
                className="ECMI-form-select"
              >
                {providerOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="ECMI-form-group form-group-full">
              <label className="ECMI-form-label">
                Scope
              </label>
              <input
                type="text"
                value={credentialData.scope}
                onChange={(e) => handleCredentialChange('scope', e.target.value)}
                placeholder="Enter scope (e.g., r_liteprofile,r_emailaddress)"
                className="ECMI-form-input"
              />
            </div>
          </div>
        </div>

        {/* Related Named Credentials */}
        <div className="ECMI-section-card">
          <div className="ECMI-section-header-with-action">
            <div className="ECMI-section-header">
              <Globe className="ECMI-section-icon" />
              <h2 className="ECMI-section-title">Related Named Credentials</h2>
            </div>
            <button
              onClick={() => setShowAddCredential(true)}
              className="ECMI-btn btn-primary"
            >
              <Plus className="ECMI-btn-icon" />
              Add Credential
            </button>
          </div>

          {/* Add Credential Form */}
          {showAddCredential && (
            <div className="ECMI-inline-form">
              <div className="ECMI-inline-form-grid">
                <input
                  type="text"
                  value={newCredential.credentialName}
                  onChange={(e) => setNewCredential(prev => ({...prev, credentialName: e.target.value}))}
                  placeholder="Credential Name"
                  className="ECMI-form-input"
                />
                <input
                  type="url"
                  value={newCredential.url}
                  onChange={(e) => setNewCredential(prev => ({...prev, url: e.target.value}))}
                  placeholder="URL"
                  className="ECMI-form-input"
                />
              </div>
              <div className="ECMI-inline-form-actions">
                <button
                  onClick={handleAddNamedCredential}
                  className="ECMI-btn btn-success"
                >
                  <Save className="ECMI-btn-icon" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowAddCredential(false);
                    setNewCredential({ credentialName: '', url: '' });
                  }}
                  className="ECMI-btn btn-secondary"
                >
                  <X className="ECMI-btn-icon" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="ECMI-table-container">
            <table className="ECMI-data-table">
              <thead>
                <tr>
                  <th className="ECMI-table-header">Credential Name</th>
                  <th className="ECMI-table-header">URL</th>
                  <th className="ECMI-table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {namedCredentials.map((credential) => (
                  <tr key={credential.id} className="ECMI-table-row">
                    <td className="ECMI-table-cell">
                      {editingCredential === credential.id ? (
                        <input
                          type="text"
                          defaultValue={credential.credentialName}
                          onBlur={(e) => handleEditNamedCredential(credential.id, {credentialName: e.target.value})}
                          className="ECMI-table-input"
                        />
                      ) : (
                        <span className="ECMI-code-badge">
                          {credential.credentialName}
                        </span>
                      )}
                    </td>
                    <td className="ECMI-table-cell">
                      {editingCredential === credential.id ? (
                        <input
                          type="url"
                          defaultValue={credential.url}
                          onBlur={(e) => handleEditNamedCredential(credential.id, {url: e.target.value})}
                          className="ECMI-table-input"
                        />
                      ) : (
                        <code className="ECMI-url-badge">
                          {credential.url}
                        </code>
                      )}
                    </td>
                    <td className="ECMI-table-cell">
                      <div className="ECMI-table-actions">
                        <button
                          onClick={() => setEditingCredential(credential.id)}
                          className="ECMI-action-btn action-edit"
                        >
                          <Edit2 className="ECMI-action-icon" />
                        </button>
                        <button
                          onClick={() => handleDeleteNamedCredential(credential.id)}
                          className="ECMI-action-btn action-delete"
                        >
                          <Trash2 className="ECMI-action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Principals */}
        <div className="ECMI-section-card">
          <div className="ECMI-section-header-with-action">
            <div className="ECMI-section-header">
              <Lock className="ECMI-section-icon" />
              <h2 className="ECMI-section-title">Principals</h2>
            </div>
            <button
              onClick={() => setShowAddPrincipal(true)}
              className="ECMI-btn btn-primary"
            >
              <Plus className="ECMI-btn-icon" />
              Add Principal
            </button>
          </div>

          {/* Add Principal Form */}
          {showAddPrincipal && (
            <div className="ECMI-inline-form">
              <div className="ECMI-inline-form-grid-three">
                <input
                  type="text"
                  value={newPrincipal.principalName}
                  onChange={(e) => setNewPrincipal(prev => ({...prev, principalName: e.target.value}))}
                  placeholder="Principal Name"
                  className="ECMI-form-input"
                />
                <select
                  value={newPrincipal.principalType}
                  onChange={(e) => setNewPrincipal(prev => ({...prev, principalType: e.target.value}))}
                  className="ECMI-form-select"
                >
                  {principalTypeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newPrincipal.scope}
                  onChange={(e) => setNewPrincipal(prev => ({...prev, scope: e.target.value}))}
                  placeholder="Scope"
                  className="ECMI-form-input"
                />
              </div>
              <div className="ECMI-inline-form-actions">
                <button
                  onClick={handleAddPrincipal}
                  className="ECMI-btn btn-success"
                >
                  <Save className="ECMI-btn-icon" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowAddPrincipal(false);
                    setNewPrincipal({
                      principalName: '',
                      principalType: 'User',
                      scope: '',
                      authenticationStatus: 'Not Configured',
                      isConfigured: false
                    });
                  }}
                  className="ECMI-btn btn-secondary"
                >
                  <X className="ECMI-btn-icon" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="ECMI-table-container">
            <table className="ECMI-data-table">
              <thead>
                <tr>
                  <th className="ECMI-table-header">Principal Name</th>
                  <th className="ECMI-table-header">Principal Type</th>
                  <th className="ECMI-table-header">Scope</th>
                  <th className="ECMI-table-header">Authentication Status</th>
                  <th className="ECMI-table-header">Action</th>
                </tr>
              </thead>
              <tbody>
                {principals.map((principal) => (
                  <tr key={principal.id} className="ECMI-table-row">
                    <td className="ECMI-table-cell">
                      <span className="ECMI-code-badge">
                        {principal.principalName}
                      </span>
                    </td>
                    <td className="ECMI-table-cell">
                      <span className="ECMI-type-text">
                        {principal.principalType}
                      </span>
                    </td>
                    <td className="ECMI-table-cell">
                      <code className="ECMI-scope-badge">
                        {principal.scope}
                      </code>
                    </td>
                    <td className="ECMI-table-cell">
                      <StatusBadge isConfigured={principal.isConfigured} />
                    </td>
                    <td className="ECMI-table-cell">
                      <ActionDropdown
                        onEdit={() => setEditingPrincipal(principal.id)}
                        onDelete={() => handleDeletePrincipal(principal.id)}
                        onAuthenticate={() => handleAuthenticate(principal.id)}
                        isConfigured={principal.isConfigured}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div 
          className="ECMI-dropdown-overlay" 
          onClick={() => setDropdownOpen(null)}
        />
      )}
    </div>
  );
};

export default ExternalCredentialManager;