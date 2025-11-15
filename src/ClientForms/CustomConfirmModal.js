// src/AdminForms/CustomConfirmModal.jsx
import React from 'react';
import '../styles/CustomConfirmModal.css';

export default function CustomConfirmModal({ isOpen, onClose, onConfirm, message, title = "Confirm" }) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-confirm" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-confirm">
                    <h3>{title}</h3>
                </div>
                <div className="modal-body-confirm">
                    <p>{message}</p>
                </div>
                <div className="modal-footer-confirm">
                    <button 
                        onClick={onClose}
                        className="modal-button-cancel"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className="modal-button-confirm"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}