import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, Eye, Trash2 } from 'lucide-react';
import './CallCenterSetup.css';
import ImportCallCenterModal from './ImportCallCenterModal'; // Import the modal

const CallCenterSetup = () => {
    const navigate = useNavigate();
    const [isImportModalOpen, setIsImportModalOpen] = useState(false); // State for import modal

    const adapters = [
        {
            id: 'cti-adapter-1',
            name: 'CTI adapter/Package',
            lastModified: '13/05/2025, 3:30pm',
        }
    ];

    const handleBack = () => {
        navigate('/admin/socialsetups');
    };

    const handleImport = () => {
        setIsImportModalOpen(true); // Open import modal
    };

    const handleDisplay = (adapterId) => {
        navigate(`/admin/socialsetups/telephone/call-center/display/${adapterId}`);
    };

    const handleDelete = (adapterId) => {
        console.log('Delete adapter:', adapterId);
    };

    return (
        <div className="call-center-container">
            <div className="call-center-header">
                <div className="header-left">
                    <h1>All Call Center</h1>
                </div>
                <div className="header-right">
                    <button onClick={handleBack} className="back-btn-header">
                        <ArrowLeft size={18} className="btn-icon" />
                        Back
                    </button>
                    <button className="import-btn" onClick={handleImport}>
                        <Upload size={18} className="btn-icon" />
                        Import
                    </button>
                </div>
            </div>

            <div className="adapters-list-container">
                <div className="adapters-table-header">
                    <div className="header-item cti-package">CTI Adapter/Package</div>
                    <div className="header-item last-modified">Last Modified Date</div>
                    <div className="header-item actions-header">Action</div>
                </div>
                <div className="adapters-table-body">
                    {adapters.map(adapter => (
                        <div key={adapter.id} className="adapter-row">
                            <div className="row-item cti-package-name">{adapter.name}</div>
                            <div className="row-item last-modified-date">{adapter.lastModified}</div>
                            <div className="row-item actions">
                                <button className="action-btn display-btn" onClick={() => handleDisplay(adapter.id)}>
                                    Display
                                </button>
                                <button className="action-btn delete-btn" onClick={() => handleDelete(adapter.id)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Render the import modal conditionally */}
            {isImportModalOpen && (
                <ImportCallCenterModal onClose={() => setIsImportModalOpen(false)} />
            )}
        </div>
    );
};

export default CallCenterSetup;
