// src/ClientForms/ClientClaimsCreationForm.jsx
// Updated with estimate damage validation and document upload restrictions

import React, { useRef, useEffect, useState } from 'react';
import { Camera, FileText, Trash2 } from 'lucide-react';
import "../styles/claims-creation-styles-client.css";
import CustomAlertModal from "../ClientForms/CustomAlertModal";

export default function ClientClaimsCreationForm({
    incidentTypes,
    setIncidentTypes,
    selectPolicy,
    setSelectPolicy,
    incidentDate,
    setIncidentDate,
    claimDate,
    setClaimDate,
    estimatedDamage,
    setEstimatedDamage,
    photos,
    handlePhotoUpload,
    handleDeletePhoto,
    documents,
    handleDocumentUpload,
    handleDeleteDocument,
    handleSubmit,
    errors = {},
    setErrors,
    policies = [],
    loading,
    selectedPolicyClaimableAmount = 0
}) {
    const photoInputRef = useRef(null);
    const documentInputRef = useRef(null);
    const attachmentsSectionRef = useRef(null);

    // Field refs for focusing on error
    const incidentTypeFirstRef = useRef(null);
    const policySelectRef = useRef(null);
    const incidentDateRef = useRef(null);
    const estDamageRef = useRef(null);

    // ===== Modal state =====
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showCheckboxError, setShowCheckboxError] = useState(false);

    // ===== Alert modal (for attachments) =====
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertTitle] = useState("Alert");
    const [alertMessage, setAlertMessage] = useState("");

    // ===== Tooltip state =====
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipContent, setTooltipContent] = useState("");
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    // Prevent closing with Escape while modal is open
    useEffect(() => {
        function trapEsc(e) {
            if (!showSubmitModal && !alertOpen) return;
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
            }
        }
        document.addEventListener("keydown", trapEsc, true);
        return () => document.removeEventListener("keydown", trapEsc, true);
    }, [showSubmitModal, alertOpen]);

    // Clear errors when fields are filled
    useEffect(() => {
        if (incidentTypes.length > 0 && errors.incidentTypes) {
            setErrors(prev => ({ ...prev, incidentTypes: false }));
        }
    }, [incidentTypes, errors.incidentTypes, setErrors]);

    useEffect(() => {
        if (selectPolicy && errors.selectPolicy) {
            setErrors(prev => ({ ...prev, selectPolicy: false }));
        }
    }, [selectPolicy, errors.selectPolicy, setErrors]);

    useEffect(() => {
        if (incidentDate && errors.incidentDate) {
            setErrors(prev => ({ ...prev, incidentDate: false }));
        }
    }, [incidentDate, errors.incidentDate, setErrors]);

    // ✅ only clear estimate damage error if value is >= ₱10,000
    useEffect(() => {
        if (estimatedDamage && errors.estimatedDamage) {
            const numValue = parseFloat(estimatedDamage);
            if (!isNaN(numValue) && numValue >= 10000) {
                setErrors(prev => ({ ...prev, estimatedDamage: false }));
            }
        }
    }, [estimatedDamage, errors.estimatedDamage, setErrors]);

    useEffect(() => {
        if ((photos?.length || documents?.length) && errors.attachments) {
            setErrors(prev => ({ ...prev, attachments: false }));
        }
    }, [photos, documents, errors.attachments, setErrors]);

    const handlePhotoBoxClick = () => {
        photoInputRef.current?.click();
    };

    const handleDocumentBoxClick = () => {
        documentInputRef.current?.click();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const handleIncidentTypeToggle = (type) => {
        setIncidentTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    function todayISO() {
        const d = new Date();
        const offsetMs = d.getTimezoneOffset() * 60 * 1000;
        return new Date(d.getTime() - offsetMs).toISOString().slice(0, 10);
    }

    // Clamp any future incident date on mount
    useEffect(() => {
        if (incidentDate && incidentDate > todayISO()) {
            setIncidentDate(todayISO());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ===== Tooltip handlers =====
    const handleMouseEnter = (e, policy) => {
        if (!policy.canCreateClaim && policy.claimValidationReason) {
            const rect = e.target.getBoundingClientRect();
            setTooltipContent(policy.claimValidationReason);
            setTooltipPosition({
                x: rect.left + rect.width / 2,
                y: rect.top - 10
            });
            setTooltipVisible(true);
        }
    };

    const handleMouseLeave = () => {
        setTooltipVisible(false);
        setTooltipContent("");
    };

    // ===== Enhanced validation for estimate damage =====
    const handleEstimateDamageChange = (e) => {
        const value = e.target.value;

        // Allow empty string (for clearing the field)
        if (value === '') {
            setEstimatedDamage('');
            return;
        }

        // Remove any non-numeric characters except decimal point
        const cleanedValue = value.replace(/[^0-9.]/g, '');

        // Prevent multiple decimal points
        const parts = cleanedValue.split('.');
        if (parts.length > 2) {
            return; // Don't update if there's more than one decimal point
        }

        // Update the value
        setEstimatedDamage(cleanedValue);
    };

    // ===== Validation helpers =====
    function isValidNumber(val) {
        if (!val || val === '') return false;
        const n = parseFloat(val);
        // ✅ require at least ₱10,000
        return Number.isFinite(n) && n >= 10000;
    }

    function validateForm() {
        const max = todayISO();
        const newErrs = {};

        if (!incidentTypes || incidentTypes.length === 0) {
            newErrs.incidentTypes = true;
        }
        if (!selectPolicy) {
            newErrs.selectPolicy = true;
        }
        if (!incidentDate) {
            newErrs.incidentDate = true;
        } else if (incidentDate > max) {
            newErrs.incidentDate = true;
            setIncidentDate(max);
        }
        if (!isValidNumber(estimatedDamage)) {
            newErrs.estimatedDamage = true;
        }
        const hasAttachments = (Array.isArray(photos) && photos.length) || (Array.isArray(documents) && documents.length);
        if (!hasAttachments) {
            newErrs.attachments = true;
        }

        if (Object.keys(newErrs).length > 0) {
            setErrors(prev => ({ ...prev, ...newErrs }));

            if (newErrs.attachments) {
                setAlertMessage("There is no Attachment of Documents!");
                setAlertOpen(true);
                attachmentsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(() => photoInputRef.current?.focus(), 0);
            } else {
                const order = ["incidentTypes", "selectPolicy", "incidentDate", "estimatedDamage"];
                const first = order.find(k => newErrs[k]);
                setTimeout(() => {
                    if (first === "incidentTypes") incidentTypeFirstRef.current?.focus();
                    if (first === "selectPolicy") policySelectRef.current?.focus();
                    if (first === "incidentDate") incidentDateRef.current?.focus();
                    if (first === "estimatedDamage") estDamageRef.current?.focus();
                }, 0);
            }
            return false;
        }
        return true;
    }

    // ===== Modal flow handlers =====
    function openSubmitModal() {
        setShowSubmitModal(true);
        setAgreedToTerms(false);
        setShowCheckboxError(false);
    }

    function closeSubmitModal() {
        setShowSubmitModal(false);
        setAgreedToTerms(false);
        setShowCheckboxError(false);
    }

    function confirmAndSubmit() {
        if (!agreedToTerms) {
            setShowCheckboxError(true);
            return;
        }
        if (typeof handleSubmit === "function") {
            const fakeEvent = { preventDefault: () => {} };
            handleSubmit(fakeEvent);
        }
        closeSubmitModal();
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        if (validateForm()) {
            openSubmitModal();
        }
    }

    // Get error message for estimate damage
    const getEstimateDamageErrorMessage = () => {
        if (!estimatedDamage || estimatedDamage === '') {
            return 'Estimate Damage Amount is required';
        }
        const numValue = parseFloat(estimatedDamage);
        if (isNaN(numValue)) {
            return 'Please enter a valid number';
        }
        if (numValue <= 0) {
            return 'Amount must be greater than zero';
        }
        if (numValue < 10000) {
            return 'Minimum amount is ₱10,000';
        }
        return 'Estimate Damage Amount is required';
    };

    return (
        <div className="claims-container">
            <h1 className="form-header">File New Claims</h1>
            <p className="form-subheader">Submit a new insurance claim with all required details</p>

            <form onSubmit={handleFormSubmit}>
                <div className="form-section main-claim-details-section">
                    <div className="form-group-row-claim-info">
                        <div className="form-group-claims type-of-claim-comprehensive">
                            <label className="label-heading">Type of Claim: Comprehensive</label>
                        </div>
                        <div className="form-group-claims claimable-amount-display">
                            <label className="label-heading">Claimable Amount:
                                <span className={`claimable-amount-value ${selectedPolicyClaimableAmount <= 0 ? 'zero' : ''}`}>
                                    {formatCurrency(selectedPolicyClaimableAmount)}
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="form-row-claims-aligned">
                        {/* Type of Incident */}
                        <div className="form-group-claims type-of-incident-group">
                            <label className="label-heading">
                                Type of Incident <span style={{ color: 'red' }}>*</span>:
                            </label>
                            <div className="checkbox-container no-label">
                                <input
                                    id="incident-own-damage"
                                    ref={incidentTypeFirstRef}
                                    type="checkbox"
                                    checked={incidentTypes.includes('Own Damage')}
                                    onChange={() => handleIncidentTypeToggle('Own Damage')}
                                    disabled={loading}
                                />
                                <span>Own Damage</span>
                            </div>
                            <div className="checkbox-container no-label">
                                <input
                                    id="incident-third-party"
                                    type="checkbox"
                                    checked={incidentTypes.includes('Third-party')}
                                    onChange={() => handleIncidentTypeToggle('Third-party')}
                                    disabled={loading}
                                />
                                <span>Third-party</span>
                            </div>
                            {errors.incidentTypes && incidentTypes.length === 0 && (
                                <small style={{ color: 'red', display: 'block', marginTop: '5px' }}>
                                    Type of Incident is required
                                </small>
                            )}
                        </div>

                        {/* Policy Select with Tooltip */}
                        <div className="form-group-claims" style={{ position: 'relative' }}>
                            <label className="label-heading">
                                Policy <span style={{ color: 'red' }}>*</span>:
                            </label>
                            <select
                                ref={policySelectRef}
                                value={selectPolicy}
                                onChange={(e) => setSelectPolicy(e.target.value)}
                                className="claims-policy-select"
                                style={errors.selectPolicy ? { borderColor: '#dc3545', boxShadow: '0 0 0 2px rgba(220, 53, 69, 0.2)' } : {}}
                                disabled={loading || policies.length === 0}
                            >
                                <option value="">
                                    {policies.length === 0 ? 'No active policies available' : 'Select Policy'}
                                </option>
                                {policies.map((policy) => {
                                    const isDisabled = !policy.canCreateClaim;
                                    return (
                                        <option
                                            key={policy.id}
                                            value={policy.id}
                                            disabled={isDisabled}
                                            data-policy-id={policy.id}
                                            onMouseEnter={(e) => handleMouseEnter(e, policy)}
                                            onMouseLeave={handleMouseLeave}
                                            style={isDisabled ? { color: '#999', fontStyle: 'italic' } : {}}
                                            title={isDisabled ? policy.claimValidationReason : ''}
                                        >
                                            Policy #{policy.internal_id || policy.id}
                                        </option>
                                    );
                                })}
                            </select>
                            {errors.selectPolicy && !selectPolicy && (
                                <small style={{ color: 'red', display: 'block', marginTop: '5px' }}>
                                    Policy is required
                                </small>
                            )}
                            {selectPolicy && policies.find(p => p.id === parseInt(selectPolicy))?.claimValidationReason && (
                                <small style={{ color: '#dc3545', display: 'block', marginTop: '5px' }}>
                                    {policies.find(p => p.id === parseInt(selectPolicy))?.claimValidationReason}
                                </small>
                            )}

                            {/* Custom Tooltip */}
                            {tooltipVisible && (
                                <div
                                    className="policy-tooltip"
                                    style={{
                                        position: 'fixed',
                                        left: `${tooltipPosition.x}px`,
                                        top: `${tooltipPosition.y}px`,
                                        transform: 'translate(-50%, -100%)',
                                        backgroundColor: '#333',
                                        color: '#fff',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        maxWidth: '300px',
                                        zIndex: 10000,
                                        pointerEvents: 'none',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    {tooltipContent}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: '-4px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: 0,
                                            height: 0,
                                            borderLeft: '4px solid transparent',
                                            borderRight: '4px solid transparent',
                                            borderTop: '4px solid #333'
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Incident Date */}
                        <div className="form-group-claims">
                            <label className="label-heading">
                                Incident Date <span style={{ color: 'red' }}>*</span>:
                            </label>
                            <input
                                ref={incidentDateRef}
                                type="date"
                                value={incidentDate}
                                max={todayISO()}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const max = todayISO();
                                    setIncidentDate(val && val > max ? max : val);
                                }}
                                style={errors.incidentDate ? { borderColor: '#dc3545', boxShadow: '0 0 0 2px rgba(220, 53, 69, 0.2)' } : {}}
                                disabled={loading}
                            />
                            {errors.incidentDate && !incidentDate && (
                                <small style={{ color: 'red', display: 'block', marginTop: '5px' }}>
                                    Incident Date is required
                                </small>
                            )}
                        </div>

                        {/* Estimate Damage Amount */}
                        <div className="form-group-claims">
                            <label className="label-heading">
                                Estimate Damage Amount <span style={{ color: 'red' }}>*</span>:
                            </label>
                            <input
                                ref={estDamageRef}
                                type="text"
                                placeholder="Enter amount"
                                value={estimatedDamage}
                                onChange={handleEstimateDamageChange}
                                style={errors.estimatedDamage ? { borderColor: '#dc3545', boxShadow: '0 0 0 2px rgba(220, 53, 69, 0.2)' } : {}}
                                disabled={loading}
                            />
                            {errors.estimatedDamage && (
                                <small style={{ color: 'red', display: 'block', marginTop: '5px' }}>
                                    {getEstimateDamageErrorMessage()}
                                </small>
                            )}
                            {/* Hint text, like in your screenshot */}
                            <small style={{ color: '#6c757d', display: 'block', marginTop: errors.estimatedDamage ? 2 : 5 }}>
                                Minimum: ₱10,000
                            </small>
                        </div>

                        {/* Claim Date */}
                        <div className="form-group-claims">
                            <label className="label-heading">
                                Claim Date <span style={{ color: 'red' }}>*</span>:
                            </label>
                            <input
                                type="date"
                                value={claimDate}
                                readOnly
                                max={todayISO()}
                                style={errors.claimDate ? { borderColor: '#dc3545', boxShadow: '0 0 0 2px rgba(220, 53, 69, 0.2)' } : {}}
                            />
                            <small style={{ color: '#6c757d', display: 'block', marginTop: 5 }}>
                                Auto-filled as today's date
                            </small>
                        </div>
                    </div>
                </div>

                <div ref={attachmentsSectionRef} className="form-section supporting-documents-section">
                    <h2 className="section-title-heading">Supporting Documents:</h2>
                    <div className="document-upload-grid">
                        {/* Photo Upload Box */}
                        <div className="upload-box" onClick={!loading ? handlePhotoBoxClick : undefined}>
                            <input
                                ref={photoInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handlePhotoUpload}
                                style={{ display: 'none' }}
                                disabled={loading}
                            />
                            <span className="upload-icon">
                                <Camera size={48} strokeWidth={1.5} color="#888" />
                            </span>
                            <p>Upload photos</p>
                            <p className="upload-hint">Take a photo of vehicle damage, accident scene</p>
                            <p className="upload-hint" style={{ marginTop: '8px', fontSize: '11px', color: '#999' }}>
                                (Hold Ctrl/Cmd to select multiple)
                            </p>
                        </div>

                        {/* Document Upload Box */}
                        <div className="upload-box" onClick={!loading ? handleDocumentBoxClick : undefined}>
                            <input
                                ref={documentInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx"
                                multiple
                                onChange={handleDocumentUpload}
                                style={{ display: 'none' }}
                                disabled={loading}
                            />
                            <span className="upload-icon">
                                <FileText size={48} strokeWidth={1.5} color="#888" />
                            </span>
                            <p>Upload Documents</p>
                            <p className="upload-hint">Police report, repair estimates, receipts (PDF, DOC, DOCX only)</p>
                            <p className="upload-hint" style={{ marginTop: '8px', fontSize: '11px', color: '#999' }}>
                                (Hold Ctrl/Cmd to select multiple)
                            </p>
                        </div>
                    </div>

                    {/* Uploaded Files Preview */}
                    {photos.length > 0 && (
                        <div className="uploaded-preview-section">
                            <h3 className="uploaded-preview-heading">Uploaded Photos: ({photos.length})</h3>
                            <div className="uploaded-photos-grid">
                                {photos.map((file, index) => (
                                    <div key={`photo-${index}`} className="photo-preview-card">
                                        <button
                                            type="button"
                                            onClick={() => handleDeletePhoto(file)}
                                            className="photo-delete-btn"
                                            disabled={loading}
                                            title="Remove photo"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="photo-preview-img"
                                        />
                                        <p className="photo-preview-name">{file.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {documents.length > 0 && (
                        <div className="uploaded-preview-section">
                            <h3 className="uploaded-preview-heading">Uploaded Documents: ({documents.length})</h3>
                            <div className="uploaded-documents-list">
                                {documents.map((file, index) => (
                                    <div key={`doc-${index}`} className="document-preview-card">
                                        <FileText size={32} color="#4a90e2" />
                                        <div className="document-preview-info">
                                            <p className="document-preview-name">{file.name}</p>
                                            <p className="document-preview-size">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteDocument(file)}
                                            className="document-delete-btn"
                                            disabled={loading}
                                            title="Remove document"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={() => window.history.back()}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="submit-spinner"></span>
                                Submitting...
                            </>
                        ) : 'Submit'}
                    </button>
                </div>
            </form>

            {/* ===== Submit Confirmation Modal ===== */}
            {showSubmitModal && (
                <div 
                    className="payment-modal-overlay"
                    onClick={closeSubmitModal}
                >
                    <div
                        className="payment-modal-content"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="claims-submit-modal-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="payment-modal-header">
                            <h2 id="claims-submit-modal-title">Terms And Conditions</h2>
                            <button 
                                className="payment-modal-close" 
                                onClick={closeSubmitModal}
                                aria-label="Close modal"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="payment-modal-body">
                            <div className="payment-terms-container">
                                <input
                                    type="checkbox"
                                    id="claims-terms"
                                    className={agreedToTerms ? "checkbox-checked" : ""}
                                    checked={agreedToTerms}
                                    onChange={(e) => {
                                        setAgreedToTerms(e.target.checked);
                                        setShowCheckboxError(false);
                                    }}
                                />
                                <label htmlFor="claims-terms" className="payment-terms-text">
                                    <p
                                        className={showCheckboxError ? "error-text" : ""}
                                        style={showCheckboxError ? { fontWeight: 400 } : undefined}
                                    >
                                        By proceeding, I confirm that all claim information I have provided is accurate and complete. I understand and agree that once submitted, claims cannot be edited or modified.
                                         I also acknowledge and accept the{" "}
                                        <a
                                            href="/insurance-client-page/TermsAndConditions"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Terms And Conditions
                                        </a>{" "}
                                        and{" "}
                                        <a
                                            href="/insurance-client-page/PrivacyPolicy"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Privacy Policy
                                        </a>{" "}
                                        of Silverstar Inurance Agency Inc.
                                    </p>

                                    <p
                                        className={showCheckboxError ? "error-text" : ""}
                                        style={showCheckboxError ? { fontWeight: 400 } : undefined}
                                    >
                                       In compliance with the Data Privacy Act of 2012 and its Implementing Rules and Regulations effective September 9, 2016, 
                                       I authorize Silverstar Insurance Agency Inc. to collect, store,  and process my personal information for the purpose of 
                                       providing services related to the insurance policy/ies I am purchasing.
                                    </p>
                                </label>
                            </div>
                        </div>

                        <div className="payment-modal-footer">
                            <button
                                className="payment-process-btn"
                                onClick={confirmAndSubmit}
                                disabled={loading}
                            >
                                Agree
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Custom Alert Modal for attachments ===== */}
            <CustomAlertModal
                isOpen={alertOpen}
                title={alertTitle}
                message={alertMessage}
                confirmText="OK"
                onConfirm={() => setAlertOpen(false)}
                onClose={() => setAlertOpen(false)}
            />
        </div>
    );
}
