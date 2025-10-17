import React, { useState, useEffect } from "react";
import { MapPin, Calendar, Phone, FileText, Upload, User, Building2, DollarSign, AlertTriangle, X, Eye, Download } from "lucide-react";
import { fetchClientClaims, getClaimDocumentUrls } from "./Actions/ClaimsActions";
import { db } from "./dbServer";
import UploadFilesModal from "./ClientForms/UploadFilesModal";
import "./styles/claims-display-styles.css";

export default function ClientClaimsDisplay({ refreshFlag }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [claims, setClaims] = useState([]);
  const [clientData, setClientData] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [expandedDocument, setExpandedDocument] = useState(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuthUser() {
      const { data, error } = await db.auth.getUser();
      if (error) {
        console.error("Auth fetch error:", error.message);
        setLoading(false);
        return;
      }
      setCurrentUser(data?.user || null);
    }
    loadAuthUser();
  }, []);

  useEffect(() => {
    const loadClient = async () => {
      if (!currentUser?.id) return;
      const { data, error } = await db
        .from("clients_Table")
        .select("*")
        .eq("auth_id", currentUser.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching client:", error.message);
        return;
      }
      setClientData(data);
    };
    loadClient();
  }, [currentUser]);

  useEffect(() => {
    const loadClaims = async () => {
      if (!clientData?.uid && !clientData?.id) return;
      setLoading(true);
      try {
        const identifier = clientData.uid || clientData.id;
        const data = await fetchClientClaims(identifier);
        setClaims(data);
        if (data.length > 0 && !selectedClaim) {
          setSelectedClaim(data[0]);
          // Check if the first claim has a message
          if (data[0].message && data[0].message.trim() !== '') {
            setCurrentMessage(data[0].message);
            setShowMessageModal(true);
          }
        }
      } catch (err) {
        console.error("Error loading claims:", err);
      } finally {
        setLoading(false);
      }
    };
    loadClaims();
  }, [clientData, refreshFlag]);

  const handleViewDocuments = async () => {
    if (!selectedClaim) return;
    
    setLoadingDocuments(true);
    try {
      console.log("📂 Loading documents for claim:", selectedClaim.id);
      
      const { data, error } = await db
        .from("claims_Table")
        .select("documents, created_at")
        .eq("id", selectedClaim.id)
        .single();

      if (error) throw error;

      if (!data.documents || !Array.isArray(data.documents) || data.documents.length === 0) {
        console.log("No documents found");
        setDocuments([]);
        setShowDocumentsModal(true);
        setLoadingDocuments(false);
        return;
      }

      const docsWithUrls = await getClaimDocumentUrls(data.documents);
      
      const processedDocs = docsWithUrls.map(doc => {
        const isImage = doc.type?.startsWith('image/') || 
                       /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.name);
        const isPDF = doc.type === 'application/pdf' || 
                     /\.pdf$/i.test(doc.name);
        const isWord = doc.type?.includes('word') || 
                      /\.(doc|docx)$/i.test(doc.name);
        
        return {
          name: doc.name,
          size: (doc.size / 1024 / 1024).toFixed(2) + ' MB',
          uploadDate: formatDate(doc.uploadedAt || data.created_at),
          url: doc.url,
          type: doc.type,
          isImage,
          isPDF,
          isWord,
          path: doc.path
        };
      });

      setDocuments(processedDocs);
      setShowDocumentsModal(true);
    } catch (err) {
      console.error("Error loading documents:", err);
      alert("Failed to load documents.");
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const response = await fetch(doc.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading:", err);
      alert("Failed to download document");
    }
  };

  const closeModal = () => {
    setShowDocumentsModal(false);
    setDocuments([]);
    setExpandedDocument(null);
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

  // Determine which progress items to show based on status
  const getProgressItems = (claim) => {
    const items = [];

    // 1. Claim Submitted - Always completed (using created_at timestamp)
    items.push({
      title: "Claim Submitted",
      date: formatDate(claim.created_at),
      description: "Your claim has been received and is being processed",
      completed: true
    });

    // 2. Under Review
    if (claim.status === 'Under Review' || claim.status === 'Approved' || claim.status === 'Rejected') {
      items.push({
        title: "Under Review",
        date: formatDate(claim.under_review_date),
        description: "Your documents are currently under review",
        completed: true
      });
    } else {
      items.push({
        title: "Under Review",
        date: "Pending",
        description: "Your documents are currently under review",
        completed: false
      });
    }

    // 3. Initial Review Complete
    if (claim.status === 'Approved') {
      items.push({
        title: "Initial Review Complete",
        date: formatDate(claim.approved_claim_date),
        description: "Approved Claim",
        completed: true
      });
    } else if (claim.status === 'Rejected') {
      items.push({
        title: "Initial Review Complete",
        date: formatDate(claim.reject_claim_date),
        description: "Reject Claim",
        completed: true,
        rejected: true
      });
    } else {
      items.push({
        title: "Initial Review Complete",
        date: "Pending",
        description: "Waiting for initial documentation review",
        completed: false
      });
    }

    return items;
  };

  if (loading) {
    return (
      <div className="claims-display-container">
        <div className="loading-message">
          Loading Claims <span className="spinner"></span>
        </div>
      </div>
    );
  }

  if (claims.length === 0) {
    return (
      <div className="claims-display-container">
        <p className="no-claims-text">No claims found</p>
      </div>
    );
  }

  return (
    <div className="claims-display-container">
      {/* Claims List */}
      <div className="claims-list-section">
        {claims.map((claim) => (
          <div
            key={claim.id}
            className={`claim-card ${selectedClaim?.id === claim.id ? "selected" : ""}`}
            onClick={() => setSelectedClaim(claim)}
          >
            <div className="claim-card-header">
              <h3>Claim ID: {claim.id}</h3>
              <span className="claim-type-badge">{claim.type_of_incident}</span>
            </div>
            <div className="claim-card-info">
              <div className="info-row">
                <span className="info-label-list">Policy:</span>
                <span className="info-value-list">{claim.policy_Table?.internal_id || "N/A"}</span>
              </div>
              <div className="info-row">
                <span className="info-label-list">Incident Date:</span>
                <span className="info-value-list">{formatDate(claim.incident_date)}</span>
              </div>
              <div className="info-row">
                <span className="info-label-list">Amount:</span>
                <span className="info-value-list">{formatCurrency(claim.estimate_amount)}</span>
              </div>
              <div className="info-row">
                <span className="info-label-list">Status:</span>
                <span className={`claim-status-small ${(claim.status || 'Pending').toLowerCase().replace(' ', '-')}`}>
                  {claim.status || 'Pending'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Claim Details */}
      {selectedClaim && (
        <div className="claim-details-section">
          <div className="claim-overview-middle">
            <h2 className="claim-id-header">Claim ID: {selectedClaim.id}</h2>
            <hr className="claim-id-divider" />

            {/* Client Information Card */}
            <div className="info-card">
              <h3>Client Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label"><User size={14} /> Name:</span>
                  <span className="info-value">
                    {selectedClaim.policy_Table?.clients_Table?.first_Name || "N/A"}{" "}
                    {selectedClaim.policy_Table?.clients_Table?.family_Name || ""}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label"><Building2 size={14} /> Partner Company:</span>
                  <span className="info-value">
                    {selectedClaim.policy_Table?.insurance_Partners?.insurance_Name || "N/A"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label"><Phone size={14} /> Contact Number:</span>
                  <span className="info-value">{selectedClaim.phone_number || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label"><DollarSign size={14} /> Estimate Amount:</span>
                  <span className="info-value">{formatCurrency(selectedClaim.estimate_amount)}</span>
                </div>
                <div className="info-item info-item-full">
                  <span className="info-label"><MapPin size={14} /> Location:</span>
                  <span className="info-value">{selectedClaim.location_of_incident || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Vehicle Information Card */}
            <div className="info-card">
              <h3>Vehicle Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label"><FileText size={14} /> Type of Claim:</span>
                  <span className="info-value">{selectedClaim.policy_Table?.policy_type || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label"><AlertTriangle size={14} /> Type of Incident:</span>
                  <span className="info-value">{selectedClaim.type_of_incident || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label"><Calendar size={14} /> Incident Date:</span>
                  <span className="info-value">{formatDate(selectedClaim.incident_date)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label"><Calendar size={14} /> Claim Date:</span>
                  <span className="info-value">{formatDate(selectedClaim.claim_date)}</span>
                </div>
                <div className="info-item info-item-full">
                  <span className="info-label"><FileText size={14} /> Description:</span>
                  <span className="info-value">{selectedClaim.description_of_incident || "No description provided"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Claim Progress Section */}
          <div className="claim-details-right">
            <h3>Claim Progress</h3>
            <div className="claim-progress-timeline">
              {getProgressItems(selectedClaim).map((item, index) => (
                <div key={index} className={`progress-item ${item.completed ? 'completed' : ''} ${item.rejected ? 'rejected' : ''}`}>
                  <div className="progress-bullet"></div>
                  <div className="progress-content">
                    <h4>{item.title}</h4>
                    <span className="progress-date">{item.date}</span>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="claim-actions">
              <button 
                className="btn-view-documents" 
                onClick={handleViewDocuments}
                disabled={loadingDocuments}
              >
                <FileText size={20} /> 
                {loadingDocuments ? "Loading..." : "View Documents"}
              </button>
              <button 
                className="btn-upload-files"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload size={20} /> Upload Files
              </button>
            </div>

            {/* Notice Message Section - Moved below Upload Files */}
            {selectedClaim.message && selectedClaim.message.trim() !== '' && (
              <div className="notice-message-section">
                <h4>Notice Message:</h4>
                <div className="notice-message-box">
                  {selectedClaim.message}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message Popup Modal - Simplified text */}
     {/* {showMessageModal && currentMessage && (
        <div className="message-popup-overlay" onClick={() => setShowMessageModal(false)}>
          <div className="message-popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="message-popup-header">
              <h3>Notice Message</h3>
              <button className="message-popup-close" onClick={() => setShowMessageModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="message-popup-body">
              <p>{currentMessage}</p>
            </div>
            <div className="message-popup-footer">
              <button className="message-popup-ok-btn" onClick={() => setShowMessageModal(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}*/}

      {/* Upload Files Modal */}
      {showUploadModal && (
        <UploadFilesModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          claimData={selectedClaim}
          onUploadComplete={async (claimId, photos, documents) => {
            try {
              console.log("📤 Uploading files for claim:", claimId);
              
              // Get current user
              const { data: { user }, error: authError } = await db.auth.getUser();
              if (authError) throw authError;
              if (!user) throw new Error("No authenticated user");

              // Get client auth_id
              const { data: clientAuthData, error: clientError } = await db
                .from("clients_Table")
                .select("auth_id")
                .eq("auth_id", user.id)
                .single();

              if (clientError) throw clientError;
              if (!clientAuthData) throw new Error("Client not found");

              // Combine all files
              const allFiles = [...photos, ...documents];
              
              // Get existing documents
              const { data: existingClaim, error: claimError } = await db
                .from("claims_Table")
                .select("documents")
                .eq("id", claimId)
                .single();

              if (claimError) throw claimError;

              const existingDocs = existingClaim.documents || [];
              const newDocs = [];

              // Upload each file
              for (const file of allFiles) {
                const timestamp = Date.now();
                const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                const fileName = `${timestamp}_${sanitizedFileName}`;
                const filePath = `${clientAuthData.auth_id}/${claimId}/${fileName}`;

                console.log(`📤 Uploading: ${file.name}`);

                const { data: uploadData, error: uploadError } = await db.storage
                  .from('claim-documents')
                  .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                  });

                if (uploadError) {
                  console.error(`❌ Failed to upload ${file.name}:`, uploadError);
                  continue;
                }

                console.log(`✅ Uploaded: ${uploadData.path}`);

                newDocs.push({
                  path: uploadData.path,
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  uploadedAt: new Date().toISOString()
                });
              }

              // Update claim with new documents
              const updatedDocs = [...existingDocs, ...newDocs];
              
              const { error: updateError } = await db
                .from("claims_Table")
                .update({ documents: updatedDocs })
                .eq("id", claimId);

              if (updateError) throw updateError;

              console.log(`✅ Successfully uploaded ${newDocs.length} file(s)`);
              
              // Refresh claims list
              if (clientData) {
                const identifier = clientData.uid || clientData.id;
                const data = await fetchClientClaims(identifier);
                setClaims(data);
                
                // Update selected claim to show new documents
                const updatedClaim = data.find(c => c.id === claimId);
                if (updatedClaim) {
                  setSelectedClaim(updatedClaim);
                }
              }

              // Close modal
              setShowUploadModal(false);
              
              // Show success message
              alert(`Successfully uploaded ${newDocs.length} file(s)!`);

              return true;
            } catch (error) {
              console.error("❌ Upload error:", error);
              alert("Failed to upload files: " + error.message);
              throw error;
            }
          }}
        />
      )}

      {/* Documents Modal */}
      {showDocumentsModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Claims Documents - CLAIM ID: {selectedClaim.id}</h2>
                <p className="modal-subtitle">View and download all documents related to this claim</p>
              </div>
              <button className="modal-close-btn" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <div className="documents-list">
              {documents.length === 0 ? (
                <p className="no-documents-text">No documents available for this claim</p>
              ) : (
                documents.map((doc, index) => (
                  <div key={index} className="document-item">
                    <div className="document-header">
                      <div className="document-info">
                        <h4>{doc.name}</h4>
                        <p className="document-meta">{doc.size} • Uploaded {doc.uploadDate}</p>
                      </div>
                      <div className="document-actions">
                        {(doc.isImage || doc.isPDF) && (
                          <button className="btn-preview" onClick={() => setExpandedDocument(doc)}>
                            <Eye size={16} /> Preview
                          </button>
                        )}
                        <button className="btn-download" onClick={() => handleDownload(doc)}>
                          <Download size={16} /> Download
                        </button>
                      </div>
                    </div>
                    
                    <div 
                      className="document-preview" 
                      onClick={() => (doc.isImage || doc.isPDF) && setExpandedDocument(doc)}
                      style={{ cursor: (doc.isImage || doc.isPDF) ? 'pointer' : 'default' }}
                    >
                      {doc.isImage ? (
                        <img src={doc.url} alt={doc.name} className="preview-image" />
                      ) : doc.isPDF ? (
                        <div className="pdf-preview">
                          <FileText size={48} />
                          <p>PDF Document</p>
                          <small>Click to view full size</small>
                        </div>
                      ) : doc.isWord ? (
                        <div className="pdf-preview">
                          <FileText size={48} />
                          <p>Word Document</p>
                          <small>Click download to view</small>
                        </div>
                      ) : (
                        <div className="pdf-preview">
                          <FileText size={48} />
                          <p>Document</p>
                          <small>Click download to view</small>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expanded Document Modal */}
      {expandedDocument && (
        <div className="expanded-modal-overlay" onClick={() => setExpandedDocument(null)}>
          <div className="expanded-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="expanded-close-btn" onClick={() => setExpandedDocument(null)}>
              <X size={32} />
            </button>
            {expandedDocument.isImage ? (
              <img 
                src={expandedDocument.url} 
                alt={expandedDocument.name} 
                className="expanded-image" 
              />
            ) : expandedDocument.isPDF ? (
              <iframe 
                src={expandedDocument.url} 
                className="expanded-pdf" 
                title={expandedDocument.name}
                style={{
                  width: '90vw',
                  height: '90vh',
                  border: 'none',
                  borderRadius: '8px'
                }}
              />
            ) : (
              <div className="expanded-document">
                <FileText size={96} />
                <p>{expandedDocument.name}</p>
                <button 
                  className="btn-download-expanded" 
                  onClick={() => handleDownload(expandedDocument)}
                >
                  <Download size={20} /> Download to View
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}