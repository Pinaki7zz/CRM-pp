import React, {useState} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Edit, Trash2 } from 'lucide-react';
import ManageUserModal from './ManageUserModal';
import './CallCenterDisplay.css';

const CallCenterDisplay = () => {
    const navigate = useNavigate();
    const { adapterId } = useParams();
    const [isManageUserModalOpen, setIsManageUserModalOpen] = useState(false);

    // Mock data for adapter
    const adapterData = {
        id: 'cti-adapter-1',
        name: 'CTI adapter/Package',
        description: 'Call Center Integration Adapter for managing telephony operations',
        lastModified: '13/05/2025, 3:30pm',
        status: 'Active',
        version: '1.0.0',
        size: '2.4 MB',
        type: 'XML Configuration',
        createdBy: 'System Administrator',
        createdDate: '10/03/2025, 2:15pm'
    };

    // Mock data for Call Center Users
    const callCenterUsers = [
        {
            id: 1,
            name: 'John Smith',
            username: 'jsmith',
            createdOn: '12/05/2025, 10:30am',
            lastModified: '15/05/2025, 2:45pm'
        },
        {
            id: 2,
            name: 'Sarah Johnson',
            username: 'sjohnson',
            createdOn: '10/05/2025, 9:15am',
            lastModified: '14/05/2025, 4:20pm'
        }
    ];

    const handleBack = () => {
        navigate('/admin/socialsetups/telephone/call-center');
    };

    const handleEdit = () => {
        console.log('Edit adapter:', adapterId);
    };

    const handleDelete = () => {
        console.log('Delete adapter:', adapterId);
        if (window.confirm('Are you sure you want to delete this adapter?')) {
            navigate('/admin/socialsetups/telephone/call-center');
        }
    };

    const handleDownload = () => {
        console.log('Download adapter:', adapterId);
    };

    const handleManageUser = () => {
        setIsManageUserModalOpen(true); // Open the modal
    };

    return (
        <div className="call-center-display-container">
            <div className="display-header">
                <div className="display-header-left">
                    <h1>Call Center Adapter Details</h1>
                </div>
                <div className="display-header-right">
                    <button onClick={handleBack} className="back-btn-display">
                        <ArrowLeft size={18} className="btn-icon" />
                        Back
                    </button>
                    <button className="download-btn" onClick={handleDownload} title="Download">
                        <Download size={16} className="btn-icon" />
                    </button>
                </div>
            </div>

            <div className="adapter-details-card">
                <div className="card-header-section">
                    <h2>{adapterData.name}</h2>
                    <span className={`status-badge ${adapterData.status.toLowerCase()}`}>
                        {adapterData.status}
                    </span>
                </div>

                <div className="details-grid">
                    <div className="detail-row">
                        <span className="detail-label">Description:</span>
                        <span className="detail-value">{adapterData.description}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Version:</span>
                        <span className="detail-value">{adapterData.version}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">{adapterData.type}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Size:</span>
                        <span className="detail-value">{adapterData.size}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Created By:</span>
                        <span className="detail-value">{adapterData.createdBy}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Created Date:</span>
                        <span className="detail-value">{adapterData.createdDate}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Last Modified:</span>
                        <span className="detail-value">{adapterData.lastModified}</span>
                    </div>
                </div>

                <div className="card-actions">
                    <button className="edit-btn-card" onClick={handleEdit}>
                        <Edit size={16} className="btn-icon" />
                        Edit
                    </button>
                    <button className="delete-btn-card" onClick={handleDelete}>
                        <Trash2 size={16} className="btn-icon" />
                        Delete
                    </button>
                </div>
            </div>

            <div className="call-center-user-section">
                <div className="user-section-header">
                    <h3>Call Center User</h3>
                    <button className="manage-user-btn" onClick={handleManageUser}>
                        Manage User
                    </button>
                </div>

                <div className="user-profile-section">
                    <h4>User Profile</h4>
                    
                    <div className="users-table-container">
                        <div className="users-table-header">
                            <div className="header-col">Name</div>
                            <div className="header-col">Username</div>
                            <div className="header-col">Created On</div>
                            <div className="header-col">Last Modified</div>
                        </div>
                        
                        <div className="users-table-body">
                            {callCenterUsers.map(user => (
                                <div key={user.id} className="user-row">
                                    <div className="user-col">{user.name}</div>
                                    <div className="user-col">{user.username}</div>
                                    <div className="user-col">{user.createdOn}</div>
                                    <div className="user-col">{user.lastModified}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {isManageUserModalOpen && (
                <ManageUserModal onClose={() => setIsManageUserModalOpen(false)} />
            )}
        </div>
    );
};

export default CallCenterDisplay;
