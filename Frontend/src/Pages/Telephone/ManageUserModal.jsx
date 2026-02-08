import React from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import './ManageUserModal.css';

const ManageUserModal = ({ onClose }) => {

    const handleAdd = () => {
        console.log('Add user');
        // Add your logic for adding a user
        onClose(); // Close modal after action
    };

    const handleRemoveUser = () => {
        console.log('Remove user');
        // Add your logic for removing a user
        onClose(); // Close modal after action
    };

    return (
        <div className="manage-user-modal-overlay" onClick={onClose}>
            <div className="manage-user-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="manage-user-modal-header">
                    <h2>Manage User</h2>
                    <button onClick={onClose} className="manage-user-close-button">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="manage-user-modal-body">
                    <div className="manage-user-actions">
                        <button className="add-user-btn" onClick={handleAdd}>
                            Add
                        </button>
                        <button className="remove-user-btn" onClick={handleRemoveUser}>
                            Remove User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageUserModal;
