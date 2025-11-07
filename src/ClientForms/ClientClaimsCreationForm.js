// src/ClientForms/ClientClaimsCreationForm.jsx
import React, { useRef, useEffect } from 'react';
import { Camera, FileText, Trash2 } from 'lucide-react';
import "../styles/claims-creation-styles-client.css";

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

    useEffect(() => {
        if (claimDate && errors.claimDate) {
            setErrors(prev => ({ ...prev, claimDate: false }));
        }
    }, [claimDate, errors.claimDate, setErrors]);

    useEffect(() => {
        if (estimatedDamage && errors.estimatedDamage) {
            setErrors(prev => ({ ...prev, estimatedDamage: false }));
        }
    }, [estimatedDamage, errors.estimatedDamage, setErrors]);

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
        // make it local-timezone safe to avoid off-by-one
        const offsetMs = d.getTimezoneOffset() * 60 * 1000;
        return new Date(d.getTime() - offsetMs).toISOString().slice(0, 10);
    }

    return (
        <div className="claims-container">
            <h1 className="form-header">File New Claims</h1>
            <p className="form-subheader">Submit a new insurance claim with all required details</p>

            <form onSubmit={handleSubmit}>
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

                    {/* A SINGLE GRID CONTAINER FOR PERFECT ALIGNMENT */}
                    <div className="form-row-claims-aligned">
                        {/* ITEM 1 - Row 1, Col 1 */}
                        <div className="form-group-claims type-of-incident-group">
                            <label className="label-heading">
                                Type of Incident <span style={{ color: 'red' }}>*</span>:
                            </label>
                            <label className="checkbox-container">
                                <input
                                    type="checkbox"
                                    checked={incidentTypes.includes('Own Damage')}
                                    onChange={() => handleIncidentTypeToggle('Own Damage')}
                                    disabled={loading}
                                />
                                Own Damage
                            </label>
                            <label className="checkbox-container">
                                <input
                                    type="checkbox"
                                    checked={incidentTypes.includes('Third-party')}
                                    onChange={() => handleIncidentTypeToggle('Third-party')}
                                    disabled={loading}
                                />
                                Third-party
                            </label>
                            {errors.incidentTypes && incidentTypes.length === 0 && (
                                <small style={{ color: 'red', display: 'block', marginTop: '5px' }}>
                                    Type of Incident is required
                                </small>
                            )}
                        </div>

                        {/* ITEM 2 - Row 1, Col 2 */}
                        <div className="form-group-claims">
                            <label className="label-heading">
                                Policy <span style={{ color: 'red' }}>*</span>:
                            </label>
                            <select
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
                                            style={isDisabled ? { color: '#999', fontStyle: 'italic' } : {}}
                                        >
                                            Policy #{policy.internal_id || policy.id}
                                            {isDisabled && ` - ${policy.claimValidationReason}`}
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
                        </div>

                        {/* ITEM 3 - Row 1, Col 3 */}
                        <div className="form-group-claims">
                            <label className="label-heading">
                                Incident Date <span style={{ color: 'red' }}>*</span>:
                            </label>
                            <input
                                type="date"
                                value={incidentDate}
                                onChange={(e) => setIncidentDate(e.target.value)}
                                style={errors.incidentDate ? { borderColor: '#dc3545', boxShadow: '0 0 0 2px rgba(220, 53, 69, 0.2)' } : {}}
                                disabled={loading}
                            />
                            {errors.incidentDate && !incidentDate && (
                                <small style={{ color: 'red', display: 'block', marginTop: '5px' }}>
                                    Incident Date is required
                                </small>
                            )}
                        </div>

                        {/* ITEM 4 - Row 2, Col 1 */}
                        <div className="form-group-claims">
                            <label className="label-heading">
                                Estimate Damage Amount <span style={{ color: 'red' }}>*</span>:
                            </label>
                            <input
                                type="number"
                                placeholder="Enter amount"
                                value={estimatedDamage}
                                onChange={(e) => setEstimatedDamage(e.target.value)}
                                style={errors.estimatedDamage ? { borderColor: '#dc3545', boxShadow: '0 0 0 2px rgba(220, 53, 69, 0.2)' } : {}}
                                disabled={loading}
                            />
                            {errors.estimatedDamage && !estimatedDamage && (
                                <small style={{ color: 'red', display: 'block', marginTop: '5px' }}>
                                    Estimate Damage Amount is required
                                </small>
                            )}
                        </div>

                        {/* ITEM 5 - Row 2, Col 2 */}
                        <div className="form-group-claims">
                            <label className="label-heading">
                                Claim Date <span style={{ color: 'red' }}>*</span>:
                            </label>
                            <input
                                type="date"
                                value={claimDate}
                                readOnly
                                // keep the error glow if you ever need it
                                style={errors.claimDate ? { borderColor: '#dc3545', boxShadow: '0 0 0 2px rgba(220, 53, 69, 0.2)' } : {}}
                            />
                            <small style={{ color: '#6c757d', display: 'block', marginTop: 5 }}>
                                Auto-filled as today’s date
                            </small>
                        </div>
                    </div>
                </div>

                <div className="form-section supporting-documents-section">
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
                                accept=".pdf,.doc,.docx,.txt"
                                multiple
                                onChange={handleDocumentUpload}
                                style={{ display: 'none' }}
                                disabled={loading}
                            />
                            <span className="upload-icon">
                                <FileText size={48} strokeWidth={1.5} color="#888" />
                            </span>
                            <p>Upload Documents</p>
                            <p className="upload-hint">Police report, repair estimates, receipts</p>
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
        </div>
    );
}