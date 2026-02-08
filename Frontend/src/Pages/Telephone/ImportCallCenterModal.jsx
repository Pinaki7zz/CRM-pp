import React, { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import './ImportCallCenterModal.css';

const ImportCallCenterModal = ({ onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    const handleImport = () => {
        if (selectedFile) {
            console.log('Importing file:', selectedFile.name);
            // Add your import logic here
            // You can make an API call to upload the file
            onClose(); // Close modal after import
        } else {
            alert('Please select a file first');
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        onClose();
    };

    return (
        <div className="import-modal-overlay" onClick={onClose}>
            <div className="import-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="import-modal-header">
                    <h2>New call center import information</h2>
                    <button onClick={onClose} className="import-close-button">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="import-modal-body">
                    <div className="file-upload-section">
                        <div className="file-upload-row">
                            <label className="file-upload-label">Call Center definition file</label>
                            <div className="file-upload-wrapper">
                                <input
                                    type="file"
                                    id="fileInput"
                                    className="file-input-hidden"
                                    onChange={handleFileChange}
                                    accept=".xml,.json,.txt,.csv"
                                />
                                <label htmlFor="fileInput" className="file-choose-button">
                                    Choose file
                                    <Upload size={16} className="upload-icon" />
                                </label>
                            </div>
                        </div>
                        {selectedFile && (
                            <div className="selected-file-name">
                                <FileText size={16} />
                                {selectedFile.name}
                            </div>
                        )}
                    </div>
                </div>


                <div className="import-modal-footer">
                    <button className="import-btn-modal" onClick={handleImport}>
                        Import
                    </button>
                    <button className="cancel-btn-modal" onClick={handleCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportCallCenterModal;
