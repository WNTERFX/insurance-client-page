// src/ClientController/DeleteConfirmationModal.jsx
import React from 'react';
import '../styles/delete-confirmation-modal.css';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, fileName }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Confirm</h2>
                <p className="modal-message">
                    Are you sure you want to remove this attachment?
                </p>

                <div className="modal-actions">
                    <button 
                        type="button" 
                        className="cancel-button-modal" 
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        className="ok-button-modal" 
                        onClick={onConfirm}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;