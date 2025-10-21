import React, { useState, useRef } from 'react';
import { X, Camera, FileText, Trash2 } from 'lucide-react';

export default function UploadFilesModal({ 
  isOpen, 
  onClose, 
  claimData, 
  onUploadComplete 
}) {
  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteType, setDeleteType] = useState('');

  const photoInputRef = useRef(null);
  const documentInputRef = useRef(null);

  if (!isOpen || !claimData) return null;

  const handlePhotoUpload = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = filesArray.filter(file => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      alert(`Invalid file type(s). Please upload only images (JPG, PNG, GIF, WebP)`);
      event.target.value = null;
      return;
    }

    setPhotos(prev => [...prev, ...filesArray]);
    event.target.value = null;
  };

  const handleDocumentUpload = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const invalidFiles = filesArray.filter(file => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      alert(`Invalid file type(s). Please upload only PDFs or Word documents`);
      event.target.value = null;
      return;
    }

    setDocuments(prev => [...prev, ...filesArray]);
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
      setPhotos(prev => prev.filter((_, i) => i !== deleteConfirm.index));
      console.log(`Photo deleted: ${deleteConfirm.file.name}`);
    } else if (deleteType === 'document') {
      setDocuments(prev => prev.filter((_, i) => i !== deleteConfirm.index));
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
      alert('Please select at least one file to upload');
      return;
    }

    setUploading(true);
    try {
      console.log("🚀 Starting upload process...");
      await onUploadComplete(claimData.id, photos, documents);
      
      // Reset form
      setPhotos([]);
      setDocuments([]);
      
      console.log("✅ Upload complete!");
    } catch (error) {
      console.error('❌ Upload error:', error);
      // Don't show alert here, parent handles it
    } finally {
      setUploading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-CA");
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{ zIndex: 10000 }}
    >
      <div 
        className="upload-modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1200px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          <X size={28} />
        </button>

        {/* Header */}
        <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Claims</h2>
        <p style={{ color: '#666', marginBottom: '32px' }}>
          Submit a insurance claim with all required details
        </p>

        {/* Information Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Client Information */}
          <div style={{
            border: '2px solid #e0e0e0',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Client Information</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Name:</p>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>
                  {claimData.policy_Table?.clients_Table?.first_Name || "N/A"}{" "}
                  {claimData.policy_Table?.clients_Table?.family_Name || ""}
                </p>
              </div>
              
              <div>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Partner Company:</p>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>
                  {claimData.policy_Table?.insurance_Partners?.insurance_Name || "N/A"}
                </p>
              </div>
              
              <div>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Contact Number:</p>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>
                  {claimData.phone_number || "N/A"}
                </p>
              </div>
              
              <div>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Estimate Amount:</p>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>
                  {formatCurrency(claimData.estimate_amount)}
                </p>
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Location:</p>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>
                  {claimData.location_of_incident || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div style={{
            border: '2px solid #e0e0e0',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Vehicle Information</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Type of Claim:</p>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>
                  {claimData.policy_Table?.policy_type || "N/A"}
                </p>
              </div>
              
              <div>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Type of Incident:</p>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>
                  {claimData.type_of_incident || "N/A"}
                </p>
              </div>
              
              <div>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Incident Date:</p>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>
                  {formatDate(claimData.incident_date)}
                </p>
              </div>
              
              <div>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Claim Date:</p>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>
                  {formatDate(claimData.claim_date)}
                </p>
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Description:</p>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>
                  {claimData.description_of_incident || "No description provided"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Supporting Documents */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Supporting Documents:</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Upload Photos Box */}
            <div
              onClick={() => photoInputRef.current?.click()}
              style={{
                border: '2px dashed #ccc',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: '#fafafa'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4a90e2';
                e.currentTarget.style.background = '#f0f7ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#ccc';
                e.currentTarget.style.background = '#fafafa';
              }}
            >
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
              <Camera size={48} color="#888" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
                Upload photos
              </p>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Take a photo of vehicle damage, accident scene
              </p>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                (Hold Ctrl/Cmd to select multiple)
              </p>
            </div>

            {/* Upload Documents Box */}
            <div
              onClick={() => documentInputRef.current?.click()}
              style={{
                border: '2px dashed #ccc',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: '#fafafa'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4a90e2';
                e.currentTarget.style.background = '#f0f7ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#ccc';
                e.currentTarget.style.background = '#fafafa';
              }}
            >
              <input
                ref={documentInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={handleDocumentUpload}
                style={{ display: 'none' }}
              />
              <FileText size={48} color="#888" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
                Upload Documents
              </p>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Police report, repair estimates, receipts
              </p>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                (Hold Ctrl/Cmd to select multiple)
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded Files Preview */}
        {(photos.length > 0 || documents.length > 0) && (
          <div style={{ marginBottom: '24px' }}>
            {photos.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>
                  Uploaded Photos: ({photos.length})
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                  gap: '12px' 
                }}>
                  {photos.map((file, index) => (
                    <div 
                      key={index}
                      style={{
                        position: 'relative',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '8px',
                        background: '#fafafa'
                      }}
                    >
                      <button
                        onClick={() => handleDeletePhoto(index)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(220, 53, 69, 0.9)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: 'white',
                          zIndex: 2
                        }}
                        title="Remove photo"
                      >
                        <Trash2 size={14} />
                      </button>
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={file.name}
                        style={{
                          width: '100%',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          marginBottom: '8px'
                        }}
                      />
                      <p style={{ 
                        fontSize: '12px', 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {file.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {documents.length > 0 && (
              <div>
                <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>
                  Uploaded Documents: ({documents.length})
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                  gap: '12px' 
                }}>
                  {documents.map((file, index) => (
                    <div 
                      key={index}
                      style={{
                        position: 'relative',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '12px',
                        background: '#fafafa',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <FileText size={32} color="#4a90e2" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ 
                          fontSize: '14px',
                          fontWeight: '500',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {file.name}
                        </p>
                        <p style={{ fontSize: '12px', color: '#666' }}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteDocument(index)}
                        style={{
                          background: 'rgba(220, 53, 69, 0.1)',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '8px',
                          cursor: 'pointer',
                          color: '#dc3545',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220, 53, 69, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(220, 53, 69, 0.1)'}
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
        )}

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end',
          paddingTop: '20px',
          borderTop: '1px solid #e0e0e0'
        }}>
          <button
            onClick={onClose}
            disabled={uploading}
            style={{
              padding: '12px 24px',
              border: '1px solid #ccc',
              background: 'white',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.6 : 1
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || (photos.length === 0 && documents.length === 0)}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: (uploading || (photos.length === 0 && documents.length === 0)) 
                ? '#ccc' 
                : '#dc3545',
              color: 'white',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: (uploading || (photos.length === 0 && documents.length === 0)) 
                ? 'not-allowed' 
                : 'pointer',
              fontWeight: '500'
            }}
          >
            {uploading ? 'Uploading...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10001
          }}
          onClick={cancelDelete}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '90%',
              maxWidth: '400px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '1.3em', 
              color: '#333',
              fontWeight: 600 
            }}>
              Confirm
            </h3>
            <p style={{ 
              margin: '0 0 24px 0', 
              fontSize: '1em', 
              color: '#666',
              lineHeight: 1.5 
            }}>
              Are you sure you want to remove this attachment?
            </p>
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end' 
            }}>
              <button
                onClick={cancelDelete}
                style={{
                  padding: '10px 24px',
                  background: '#f0f0f0',
                  color: '#333',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '0.95em',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e0e0e0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f0f0f0'}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '10px 24px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.95em',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#c82333';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#dc3545';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}