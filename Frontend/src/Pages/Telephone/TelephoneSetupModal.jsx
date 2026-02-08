import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight } from 'lucide-react';
import './TelephoneSetupModal.css';

const TelephoneSetupModal = ({ onClose }) => {
    const navigate = useNavigate();

    const setupOptions = [
        { id: 'call-center', name: 'Call Center', path: '/admin/socialsetups/telephone/call-center' },
        { id: 'directory-numbers', name: 'Directory Numbers', path: '/admin/socialsetups/telephone/directory-numbers' },
        { id: 'softphone-layout', name: 'Softphone layout', path: '/admin/socialsetups/telephone/softphone-layout' },
    ];

    const handleNavigate = (path) => {
        navigate(path);
        onClose(); // Close modal after navigation
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Telephone Setup</h2>
                    <button onClick={onClose} className="close-button">
                        <X size={24} />
                    </button>
                </div>
                <div className="modal-body">
                    <p>Select a configuration to begin setup:</p>
                    <div className="setup-options-list">
                        {setupOptions.map(option => (
                            <button key={option.id} className="option-button" onClick={() => handleNavigate(option.path)}>
                                <span>{option.name}</span>
                                <ChevronRight size={20} className="option-icon" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TelephoneSetupModal;
