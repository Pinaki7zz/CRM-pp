import React, { useState } from 'react';
import { Plus, Settings, User, Trash2, Edit3, CheckCircle, AlertCircle } from 'lucide-react';
import './LinkedInAccountsManager.css';

const LinkedInAccountsManager = () => {
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      status: 'active',
      connections: 1250,
      avatar: null
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      status: 'inactive',
      connections: 890,
      avatar: null
    }
  ]);

  const [showConnectForm, setShowConnectForm] = useState(false);
  const [showFieldsManager, setShowFieldsManager] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleConnectAccount = () => {
    if (newAccount.name && newAccount.email && newAccount.password) {
      const account = {
        id: Date.now(),
        name: newAccount.name,
        email: newAccount.email,
        status: 'active',
        connections: Math.floor(Math.random() * 2000),
        avatar: null
      };
      setAccounts([...accounts, account]);
      setNewAccount({ name: '', email: '', password: '' });
      setShowConnectForm(false);
    }
  };

  const removeAccount = (id) => {
    setAccounts(accounts.filter(account => account.id !== id));
  };

  const toggleAccountStatus = (id) => {
    setAccounts(accounts.map(account => 
      account.id === id 
        ? { ...account, status: account.status === 'active' ? 'inactive' : 'active' }
        : account
    ));
  };

  return (
    <div className="LAM-linkedin-manager">
      {/* Header */}
      <div className="LAM-header">
        <div className="LAM-header-content">
          <h1 className="LAM-title">LinkedIn Accounts</h1>
          <button 
            className="LAM-btn btn-secondary"
            onClick={() => setShowFieldsManager(true)}
          >
            <Settings size={18} />
            Manage LinkedIn Fields
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="LAM-main-content">
        {accounts.length === 0 ? (
          <div className="LAM-empty-state">
            <div className="LAM-empty-icon">
              <User size={64} />
            </div>
            <h2>No LinkedIn accounts connected</h2>
            <p>Connect your first LinkedIn account to get started with managing your professional network.</p>
            <button 
              className="LAM-btn btn-primary btn-large"
              onClick={() => setShowConnectForm(true)}
            >
              <Plus size={20} />
              Connect LinkedIn Account
            </button>
          </div>
        ) : (
          <div className="LAM-accounts-grid">
            {accounts.map(account => (
              <div key={account.id} className="LAM-account-card">
                <div className="LAM-account-header">
                  <div className="LAM-account-avatar">
                    {account.avatar ? (
                      <img src={account.avatar} alt={account.name} />
                    ) : (
                      <User size={32} />
                    )}
                  </div>
                  <div className="LAM-account-info">
                    <h3>{account.name}</h3>
                    <p>{account.email}</p>
                  </div>
                  <div className={`status-badge ${account.status}`}>
                    {account.status === 'active' ? (
                      <CheckCircle size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                    {account.status}
                  </div>
                </div>
                
                <div className="LAM-account-stats">
                  <div className="LAM-stat">
                    <span className="LAM-stat-value">{account.connections}</span>
                    <span className="LAM-stat-label">Connections</span>
                  </div>
                </div>

                <div className="LAM-account-actions">
                  <button 
                    className="LAM-btn btn-icon"
                    onClick={() => toggleAccountStatus(account.id)}
                    title={account.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    className="LAM-btn btn-icon btn-danger"
                    onClick={() => removeAccount(account.id)}
                    title="Remove account"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            <div className="LAM-add-account-card" onClick={() => setShowConnectForm(true)}>
              <Plus size={32} />
              <span>Add New Account</span>
            </div>
          </div>
        )}
      </div>

      {/* Connect Account Modal */}
      {showConnectForm && (
        <div className="LAM-modal-overlay" onClick={() => setShowConnectForm(false)}>
          <div className="LAM-modal" onClick={e => e.stopPropagation()}>
            <div className="LAM-modal-header">
              <h2>Connect LinkedIn Account</h2>
              <button className="LAM-modal-close" onClick={() => setShowConnectForm(false)}>×</button>
            </div>
            <div className="LAM-modal-body">
              <div className="LAM-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="LAM-form-group">
                <label>LinkedIn Email</label>
                <input
                  type="email"
                  value={newAccount.email}
                  onChange={(e) => setNewAccount({...newAccount, email: e.target.value})}
                  placeholder="Enter your LinkedIn email"
                />
              </div>
              <div className="LAM-form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newAccount.password}
                  onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
                  placeholder="Enter your LinkedIn password"
                />
              </div>
              <div className="LAM-form-actions">
                <button type="button" className="LAM-btn btn-secondary" onClick={() => setShowConnectForm(false)}>
                  Cancel
                </button>
                <button type="button" className="LAM-btn btn-primary" onClick={handleConnectAccount}>
                  Connect Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fields Manager Modal */}
      {showFieldsManager && (
        <div className="LAM-modal-overlay" onClick={() => setShowFieldsManager(false)}>
          <div className="LAM-modal" onClick={e => e.stopPropagation()}>
            <div className="LAM-modal-header">
              <h2>Manage LinkedIn Fields</h2>
              <button className="LAM-modal-close" onClick={() => setShowFieldsManager(false)}>×</button>
            </div>
            <div className="LAM-modal-body">
              <p>Configure which LinkedIn profile fields to display and manage.</p>
              <div className="LAM-fields-list">
                {['Name', 'Email', 'Connections', 'Industry', 'Location', 'Headline'].map(field => (
                  <div key={field} className="LAM-field-item">
                    <label>
                      <input type="checkbox" defaultChecked />
                      {field}
                    </label>
                  </div>
                ))}
              </div>
              <div className="LAM-form-actions">
                <button className="LAM-btn btn-secondary" onClick={() => setShowFieldsManager(false)}>
                  Cancel
                </button>
                <button className="LAM-btn btn-primary" onClick={() => setShowFieldsManager(false)}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkedInAccountsManager;