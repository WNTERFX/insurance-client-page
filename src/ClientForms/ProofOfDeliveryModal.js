import React, { useState, useEffect } from "react";
import "../styles/proof-of-delivery-modal.css";
import { db } from "../dbServer";

export default function ProofOfDeliveryModal({ isOpen, delivery, onClose }) {
  const [imageUrls, setImageUrls] = useState([]); // ✅ Changed to array
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliveryData, setDeliveryData] = useState(null);

  useEffect(() => {
    if (!isOpen || !delivery) return;

    const loadProofImages = async () => {
      setLoading(true);
      setError(null);
      setImageUrls([]);
      setCurrentImageIndex(0);

      try {
        console.log("🔍 Loading proof for delivery ID:", delivery.id);

        // Fetch delivery details
        const { data: fetchedDelivery, error: deliveryError } = await db
          .from("delivery_Table")
          .select(`
            id,
            proof_of_delivery,
            delivered_at,
            delivery_street_address,
            delivery_city,
            delivery_region,
            delivery_province,
            delivery_barangay,
            delivery_zip_code,
            policy_Table (
              internal_id,
              clients_Table (
                first_Name,
                middle_Name,
                family_Name,
                phone_Number
              )
            )
          `)
          .eq("id", delivery.id)
          .single();

        if (deliveryError) {
          console.error("❌ Error fetching delivery:", deliveryError);
          throw deliveryError;
        }

        console.log("✅ Fetched delivery data:", fetchedDelivery);
        setDeliveryData(fetchedDelivery);

        if (!fetchedDelivery?.proof_of_delivery) {
          console.warn("⚠️ No proof_of_delivery path found");
          setError("No proof of delivery image available");
          setLoading(false);
          return;
        }

        console.log("📸 Proof data:", fetchedDelivery.proof_of_delivery);

        // ✅ Parse proof_of_delivery (handle JSON array or single path)
        let filePaths = [];
        try {
          const parsed = JSON.parse(fetchedDelivery.proof_of_delivery);
          filePaths = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          // If not JSON, treat as single path
          filePaths = [fetchedDelivery.proof_of_delivery];
        }

        console.log("📁 File paths:", filePaths);

        // ✅ Get public URLs for all images
        const urls = [];
        for (const filePath of filePaths) {
          const { data: urlData } = db.storage
            .from("delivery-proof")
            .getPublicUrl(filePath);

          if (urlData?.publicUrl) {
            console.log("✅ Generated URL:", urlData.publicUrl);
            urls.push(urlData.publicUrl);
          } else {
            console.warn("⚠️ Failed to generate URL for:", filePath);
          }
        }

        if (urls.length === 0) {
          setError("Failed to load image URLs");
        } else {
          setImageUrls(urls);
        }
      } catch (err) {
        console.error("❌ Error loading proof of delivery:", err);
        setError(`Failed to load proof of delivery: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadProofImages();
  }, [isOpen, delivery]);

  if (!isOpen) return null;

  // Extract client info
  const clientInfo = deliveryData?.policy_Table?.clients_Table || {};
  const clientName = `${clientInfo.first_Name || ""} ${clientInfo.middle_Name || ""} ${clientInfo.family_Name || ""}`.trim() || "N/A";
  const policyNumber = deliveryData?.policy_Table?.internal_id || delivery?.policy_number || "N/A";

  // Build full address
  const fullAddress = deliveryData 
    ? [
        deliveryData.delivery_street_address,
        deliveryData.delivery_barangay,
        deliveryData.delivery_city,
        deliveryData.delivery_province,
        deliveryData.delivery_region,
        deliveryData.delivery_zip_code
      ].filter(Boolean).join(", ")
    : delivery?.address || "N/A";

  const currentImageUrl = imageUrls[currentImageIndex];

  const handlePreview = () => {
    if (currentImageUrl) {
      window.open(currentImageUrl, "_blank");
    }
  };

  const handleDownload = async () => {
    if (!currentImageUrl) return;
    
    try {
      const response = await fetch(currentImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `proof-of-delivery-${policyNumber}-${currentImageIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download image:", err);
      alert("Failed to download image");
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="proof-modal-overlay" onClick={onClose}>
      <div className="proof-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="proof-modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h2 className="proof-modal-title">
          Receiving Copy - Policy ID: {policyNumber}
        </h2>

        <div className="proof-modal-content">
          {/* Image Preview with Navigation */}
          <div className="proof-image-container">
            {loading ? (
              <div className="proof-image-placeholder">
                <div className="spinner"></div>
                <p>Loading image...</p>
              </div>
            ) : error ? (
              <div className="proof-image-placeholder">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p style={{ color: "#b91c1c" }}>{error}</p>
              </div>
            ) : (
              <>
                <img 
                  src={currentImageUrl} 
                  alt={`Proof of Delivery ${currentImageIndex + 1}`}
                  className="proof-image"
                  onError={(e) => {
                    console.error("❌ Image failed to load:", currentImageUrl);
                    setError("Failed to display image");
                  }}
                />

                {/* ✅ Navigation Controls for Multiple Images */}
                {imageUrls.length > 1 && (
                  <div className="proof-image-navigation">
                    <button 
                      className="nav-btn prev-btn" 
                      onClick={handlePrevImage}
                      aria-label="Previous image"
                    >
                      ❮
                    </button>

                    <div className="image-indicators">
                      {imageUrls.map((_, index) => (
                        <button
                          key={index}
                          className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(index)}
                          aria-label={`Go to image ${index + 1}`}
                        />
                      ))}
                    </div>

                    <button 
                      className="nav-btn next-btn" 
                      onClick={handleNextImage}
                      aria-label="Next image"
                    >
                      ❯
                    </button>
                  </div>
                )}

                {/* ✅ Image Counter */}
                {imageUrls.length > 1 && (
                  <div className="image-counter">
                    {currentImageIndex + 1} / {imageUrls.length}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Delivery Information */}
          <div className="proof-info-container">
            <h3 className="proof-info-title">Delivery Information</h3>
            
            <div className="proof-info-item">
              <span className="proof-info-label">RECIPIENT:</span>
              <span className="proof-info-value">{clientName}</span>
            </div>

            <div className="proof-info-item">
              <span className="proof-info-label">CONTACT NUMBER:</span>
              <span className="proof-info-value">{clientInfo.phone_Number || delivery?.phone_number || "N/A"}</span>
            </div>

            <div className="proof-info-item">
              <span className="proof-info-label">DELIVERED ON:</span>
              <span className="proof-info-value">
                {deliveryData?.delivered_at || delivery?.delivered_at
                  ? new Date(deliveryData?.delivered_at || delivery.delivered_at).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>

            <div className="proof-info-item">
              <span className="proof-info-label">ADDRESS:</span>
              <span className="proof-info-value">{fullAddress}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {imageUrls.length > 0 && !error && (
          <div className="proof-modal-actions">
            <button className="btn-preview" onClick={handlePreview}>
              👁 Preview
            </button>
            <button className="btn-download" onClick={handleDownload}>
              ⬇ Download (Image {currentImageIndex + 1})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}