// src/ClientForms/CustomAlertModal.jsx
import React from 'react';
import '../styles/custom-alert-modal.css'; // Create this CSS file

export default function CustomAlertModal({ isOpen, onClose, message, title = "Alert" }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-alert" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-alert">
                    <h3>{title}</h3>
                </div>
                <div className="modal-body-alert">
                    <p>{message}</p>
                </div>
                <div className="modal-footer-alert">
                    <button 
                        onClick={onClose}
                        className="modal-button-ok"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}