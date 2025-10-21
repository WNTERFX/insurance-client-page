// src/ClientForms/ClientClaimsCreationForm.jsx
import React, { useRef, useEffect } from 'react';
import { Camera, FileText, Trash2, X } from 'lucide-react';
import "../styles/claims-creation-styles-client.css";

export default function ClientClaimsCreationForm({
    incidentType,
    setIncidentType,
    selectPolicy,
    setSelectPolicy,
    description,
    setDescription,
    contactNumber,
    setContactNumber,
    incidentLocation,
    setIncidentLocation,
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
        if (selectPolicy && errors.selectPolicy) {
            setErrors(prev => ({ ...prev, selectPolicy: false }));
        }
    }, [selectPolicy, errors.selectPolicy, setErrors]);

    {/*useEffect(() => {
        if (contactNumber && errors.contactNumber) {
            setErrors(prev => ({ ...prev, contactNumber: false }));
        }
    }, [contactNumber, errors.contactNumber, setErrors]);*/}

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

    return (
        <div className="claims-container">
            <h1 className="form-header">File New Claims</h1>
            <p className="form-subheader">Submit a new insurance claim with all required details</p>

            <form onSubmit={handleSubmit}>
                <div className="form-section main-claim-details-section">
                    <div className="form-group-row-claim-info">
                        <div className="form-group type-of-claim-comprehensive">
                            <label className="label-heading">Type of Claim: Comprehensive</label>
                        </div>

                        <div className="form-group claimable-amount-display">
                            <label className="label-heading">Claimable Amount:
                            <span className={`claimable-amount-value ${selectedPolicyClaimableAmount <= 0 ? 'zero' : ''}`}>
                                {formatCurrency(selectedPolicyClaimableAmount)}
                            </span>
                            </label>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group type-of-incident-group">
                            <label className="label-heading">Type of Incident:</label>
                            <label className="checkbox-container">
                                <input
                                    type="checkbox"
                                    checked={incidentType === 'Own Damage'}
                                    onChange={() => setIncidentType('Own Damage')}
                                    disabled={loading}
                                />
                                Own Damage
                            </label>
                            <label className="checkbox-container">
                                <input
                                    type="checkbox"
                                    checked={incidentType === 'Third-party'}
                                    onChange={() => setIncidentType('Third-party')}
                                    disabled={loading}
                                />
                                Third-party
                            </label>
                        </div>

                        <div className="form-group">
                            <label className="label-heading">Policy *:</label>
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
                            {selectPolicy && policies.find(p => p.id === parseInt(selectPolicy))?.claimValidationReason && (
                                <small style={{ color: '#dc3545', display: 'block', marginTop: '5px' }}>
                                    {policies.find(p => p.id === parseInt(selectPolicy))?.claimValidationReason}
                                </small>
                            )}
                        </div>

                        <div className="form-group date-input-wrapper">
                            <label className="label-heading">Incident Date *:</label>
                            <input
                                type="date"
                                value={incidentDate}
                                onChange={(e) => setIncidentDate(e.target.value)}
                                style={errors.incidentDate ? { borderColor: '#dc3545', boxShadow: '0 0 0 2px rgba(220, 53, 69, 0.2)' } : {}}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        {/*<div className="form-group">
                            <label className="label-heading">Location of Incident:</label>
                            <textarea
                                placeholder="Enter location of incident"
                                value={incidentLocation}
                                onChange={(e) => setIncidentLocation(e.target.value)}
                                className="location-textarea"
                                disabled={loading}
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label className="label-heading">Phone Number *:</label>
                            <input
                                type="tel"
                                placeholder="Enter phone number"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                style={errors.contactNumber ? { borderColor: '#dc3545', boxShadow: '0 0 0 2px rgba(220, 53, 69, 0.2)' } : {}}
                                disabled={loading}
                            />
                        </div>*/}

                        <div className="form-group date-input-wrapper">
                            <label className="label-heading">Claim Date *:</label>
                            <input
                                type="date"
                                value={claimDate}
                                onChange={(e) => setClaimDate(e.target.value)}
                                style={errors.claimDate ? { borderColor: '#dc3545', boxShadow: '0 0 0 2px rgba(220, 53, 69, 0.2)' } : {}}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                       {/* <div className="form-group description-incident-group">
                            <label className="label-heading">Description of Incident:</label>
                            <textarea
                                placeholder="Describe the incident in detail..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="description-textarea"
                                disabled={loading}
                            ></textarea>
                        </div>*/}

                        <div className="form-group right-column-inputs">
                            <div className="input-pair">
                                <label className="label-heading">Estimate Damage Amount *:</label>
                                <input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={estimatedDamage}
                                    onChange={(e) => setEstimatedDamage(e.target.value)}
                                    style={errors.estimatedDamage ? { borderColor: '#dc3545', boxShadow: '0 0 0 2px rgba(220, 53, 69, 0.2)' } : {}}
                                    disabled={loading}
                                />
                            </div>
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