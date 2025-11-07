import React, { useState, useRef } from 'react';
import { X, Camera, FileText, Trash2 } from 'lucide-react';
import CustomAlertModal from '../ClientForms/CustomAlertModal';
import '../styles/upload-files-modal-styles.css';

export default function UploadFilesModal({
  isOpen,
  onClose,
  claimData,
  onUploadComplete,
}) {
  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteType, setDeleteType] = useState('');

  // Custom alert modal state
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: 'Alert',
    message: ''
  });

  const openAlert = (message, title = 'Alert') =>
    setAlertModal({ isOpen: true, title, message });
  const closeAlert = () =>
    setAlertModal({ isOpen: false, title: 'Alert', message: '' });

  const photoInputRef = useRef(null);
  const documentInputRef = useRef(null);

  if (!isOpen || !claimData) return null;

  const handlePhotoUpload = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = filesArray.filter((file) => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      openAlert(
        `Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}\n\nPlease upload only images (JPG, PNG, GIF, WebP)`,
        'Invalid File Type'
      );
      event.target.value = null;
      return;
    }

    setPhotos((prev) => [...prev, ...filesArray]);
    event.target.value = null;
  };

  const handleDocumentUpload = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const invalidFiles = filesArray.filter((file) => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      openAlert(
        `Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}\n\nPlease upload only PDFs or Word documents (.pdf, .doc, .docx)`,
        'Invalid File Type'
      );
      event.target.value = null;
      return;
    }

    setDocuments((prev) => [...prev, ...filesArray]);
    event.target.value = null;
  };

  const handleDeletePhoto = (index) => {
    setDeleteConfirm({ index, file: photos[index] });
    setDeleteType('photo');
  };

  const handleDeleteDocument = (index) => {
    setDeleteConfirm({ index, file: documents[index] });
    setDeleteType('document');
  };

  const confirmDelete = () => {
    if (deleteType === 'photo') {
      setPhotos((prev) => prev.filter((_, i) => i !== deleteConfirm.index));
      console.log(`Photo deleted: ${deleteConfirm.file.name}`);
    } else if (deleteType === 'document') {
      setDocuments((prev) => prev.filter((_, i) => i !== deleteConfirm.index));
      console.log(`Document deleted: ${deleteConfirm.file.name}`);
    }

    setDeleteConfirm(null);
    setDeleteType('');
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
    setDeleteType('');
  };

const handleSubmit = async () => {
  if (photos.length === 0 && documents.length === 0) {
    openAlert('Please select at least one file to upload.', 'No Files Selected');
    return;
  }

  setUploading(true);

  // Temporarily silence any window.alert fired inside onUploadComplete
  const originalAlert = window.alert;
  window.alert = () => {};

  try {
    await onUploadComplete(claimData.id, photos, documents);

    // Success: stay silent (no popups)
    setPhotos([]);
    setDocuments([]);

    // Optionally close modal or show a non-blocking toast if you have one
    // onClose?.();
    // showToast('Files uploaded');
  } catch (error) {
    // Show your custom alert on error
    console.error('Upload error:', error);
    openAlert(`Failed to upload files.\n\n${error?.message || error}`, 'Upload Error');
  } finally {
    // Restore alert for the rest of the app
    window.alert = originalAlert;
    setUploading(false);
  }
};

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount || 0);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-CA');
  };

  return (
    <div className="ufm modal-overlay" onClick={onClose}>
      <div className="ufm upload-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="ufm close-btn" onClick={onClose} aria-label="Close">
          <X size={28} />
        </button>

        {/* Header */}
        <h2 className="ufm title">Claims</h2>
        <p className="ufm subtitle">Submit an insurance claim with all required details</p>

        {/* Information Cards */}
        <div className="ufm grid-two">
          {/* Client Information */}
          <div className="ufm card">
            <h3 className="ufm card-title">Client Information</h3>
            <div className="ufm grid-two tight">
              <div>
                <p className="ufm label-upload-files">Name:</p>
                <p className="ufm value-upload-files">
                  {claimData.policy_Table?.clients_Table?.first_Name || 'N/A'}{' '}
                  {claimData.policy_Table?.clients_Table?.family_Name || ''}
                </p>
              </div>
              <div>
                <p className="ufm label-upload-files">Partner Company:</p>
                <p className="ufm value-upload-files">
                  {claimData.policy_Table?.insurance_Partners?.insurance_Name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="ufm label-upload-files">Contact Number:</p>
                <p className="ufm value-upload-files">
                  {claimData.policy_Table?.clients_Table?.phone_Number || ''}
                </p>
              </div>
              <div>
                <p className="ufm label-upload-files">Estimate Amount:</p>
                <p className="ufm value-upload-files">{formatCurrency(claimData.estimate_amount)}</p>
              </div>
            </div>
          </div>

          {/* Vehicle/Claim Information */}
          <div className="ufm card">
            <h3 className="ufm card-title">Vehicle Information</h3>
            <div className="ufm grid-two">
              <div>
                <p className="ufm label-upload-files">Type of Claim:</p>
                <p className="ufm value-upload-files">{claimData.policy_Table?.policy_type || 'N/A'}</p>
              </div>
              <div>
                <p className="ufm label-upload-files">Type of Incident:</p>
                <p className="ufm value-upload-files">{claimData.type_of_incident || 'N/A'}</p>
              </div>
              <div>
                <p className="ufm label-upload-files">Incident Date:</p>
                <p className="ufm value-upload-files">{formatDate(claimData.incident_date)}</p>
              </div>
              <div>
                <p className="ufm label-upload-files">Claim Date:</p>
                <p className="ufm value-upload-files">{formatDate(claimData.claim_date)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Boxes */}
        <div className="ufm block-gap">
          <h3 className="ufm section-title">Supporting Documents:</h3>
          <div className="ufm grid-two">
            {/* Upload Photos */}
            <div
              className="ufm upload-box"
              role="button"
              tabIndex={0}
              onClick={() => photoInputRef.current?.click()}
              onKeyDown={(e) => (e.key === 'Enter' ? photoInputRef.current?.click() : null)}
            >
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="ufm hidden-input"
              />
              <Camera size={48} className="ufm icon-muted" />
              <p className="ufm upload-title">Upload Photos</p>
              <p className="ufm upload-help">Take a photo of vehicle damage, accident scene</p>
              <p className="ufm upload-small">(Hold Ctrl/Cmd to select multiple)</p>
            </div>

            {/* Upload Documents */}
            <div
              className="ufm upload-box"
              role="button"
              tabIndex={0}
              onClick={() => documentInputRef.current?.click()}
              onKeyDown={(e) => (e.key === 'Enter' ? documentInputRef.current?.click() : null)}
            >
              <input
                ref={documentInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={handleDocumentUpload}
                className="ufm hidden-input"
              />
              <FileText size={48} className="ufm icon-muted" />
              <p className="ufm upload-title">Upload Documents</p>
              <p className="ufm upload-help">Police report, repair estimates, receipts</p>
              <p className="ufm upload-small">(Hold Ctrl/Cmd to select multiple)</p>
            </div>
          </div>
        </div>

        {/* Previews */}
        {(photos.length > 0 || documents.length > 0) && (
          <div className="ufm block-gap">
            {photos.length > 0 && (
              <div className="ufm section-stack">
                <h4 className="ufm section-subtitle">Uploaded Photos: ({photos.length})</h4>
                <div className="ufm preview-grid">
                  {photos.map((file, index) => (
                    <div className="ufm photo-card" key={`${file.name}-${index}`}>
                      <button
                        className="ufm remove-chip"
                        onClick={() => handleDeletePhoto(index)}
                        title="Remove photo"
                        aria-label={`Remove ${file.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="ufm photo-img"
                      />
                      <p className="ufm file-name" title={file.name}>
                        {file.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {documents.length > 0 && (
              <div className="ufm section-stack">
                <h4 className="ufm section-subtitle">Uploaded Documents: ({documents.length})</h4>
                <div className="ufm doc-grid">
                  {documents.map((file, index) => (
                    <div className="ufm doc-card" key={`${file.name}-${index}`}>
                      <FileText size={32} className="ufm icon-primary" />
                      <div className="ufm doc-meta">
                        <p className="ufm doc-name" title={file.name}>
                          {file.name}
                        </p>
                        <p className="ufm doc-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        className="ufm remove-btn"
                        onClick={() => handleDeleteDocument(index)}
                        title="Remove document"
                        aria-label={`Remove ${file.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="ufm action-bar">
          <button className="ufm btn btn-outline" onClick={onClose} disabled={uploading}>
            Cancel
          </button>
          <button
            className="ufm btn btn-primary"
            onClick={handleSubmit}
            disabled={uploading || (photos.length === 0 && documents.length === 0)}
          >
            {uploading ? 'Uploading...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="ufm confirm-overlay" onClick={cancelDelete}>
          <div className="ufm confirm-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="ufm confirm-title">Confirm</h3>
            <p className="ufm confirm-text">Are you sure you want to remove this attachment?</p>
            <div className="ufm confirm-actions">
              <button className="ufm btn btn-muted" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="ufm btn btn-danger" onClick={confirmDelete}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal (replaces window.alert) */}
      <CustomAlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
      />
    </div>
  );
}
