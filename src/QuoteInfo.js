import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./styles/QuoteInfo-styles.css";
import SilverstarLOGO from "./images/SilverstarLOGO.png";
import { ArrowLeft, Download } from 'lucide-react';
import { handleGenerateQuotePDF, generateQuotationNumber } from "./Actions/generateQuotePDF";

export default function QuoteInfo(){
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from CreateQuote form (passed via navigation state)
  const formData = location.state?.formData || {};
  const calculationData = location.state?.calculationData || {};
  
  const [quotationNumber, setQuotationNumber] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Generate quotation number on mount
  useEffect(() => {
    (async () => {
      const qNumber = await generateQuotationNumber();
      setQuotationNumber(qNumber);
    })();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownloadPDF = async () => {
    if (isGeneratingPDF) return;
    
    setIsGeneratingPDF(true);
    
    try {
      const result = await handleGenerateQuotePDF(formData, calculationData);
      
      if (result.success) {
        console.log(" PDF generated successfully:", result.fileName);
        // PDF is automatically downloaded by jsPDF
      } else {
        alert("Failed to generate PDF: " + result.error);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  // Format percentage helper
  const formatPercentage = (value) => {
    return `${value || 0}%`;
  };

  return (
    <div className="quote-info-page">
      {/* Header */}
      <header className="top-bar-container">
        <div className="logo-container">
          <img src={SilverstarLOGO} alt="Logo" className="logo" />
          <p className="company-name">Silverstar Insurance Agency</p>
        </div>
        <nav className="nav-links">
          <Link to="/insurance-client-page" className="nav-link">Home</Link>
          <Link to="/insurance-client-page/Partners" className="nav-link">Partners</Link>
          <Link to="/insurance-client-page/AboutUs" className="nav-link">About Us</Link>
          <Link to="/insurance-client-page/Contact" className="nav-link">Contact</Link>
          <Link to="/insurance-client-page/login" className="login-button">Log in</Link>
        </nav>
      </header>

      {/* Quote Info Section */}
      <div className="quoteinfo-container">
        <div className="insurance-quoteinfo-container">
          <div className="quoteinfo-header">
            <div>
              <h1>Get Your Vehicle Insurance Quote</h1>
              <p className="quoteinfo-subtitle">Fill in the details below to receive a personalized quotation</p>
              {quotationNumber && (
                <p className="quotation-number">Quotation No: <strong>{quotationNumber}</strong></p>
              )}
            </div>
            <button className="back-button" onClick={handleBack}>
              <ArrowLeft size={20} />
              Back
            </button>
          </div>

          {/* Current Insurance Information */}
          <section className="info-section">
            <h2>Current Insurance Information</h2>
            <p className="section-description">Enter the registered owner's information</p>
            
            <div className="info-box">
              <div className="info-grid">
                <div className="info-item">
                  <label>First Name, Last Name (Registered owner)</label>
                  <span className="info-value">{formData.ownerName || '-'}</span>
                </div>
                
                <div className="info-item">
                  <label>Contact Number</label>
                  <span className="info-value">{formData.contactNumber || '-'}</span>
                </div>
                
                <div className="info-item">
                  <label>Vehicle Name</label>
                  <span className="info-value">{formData.vehicleName || '-'}</span>
                </div>
                
                <div className="info-item">
                  <label>Plate Number</label>
                  <span className="info-value">{formData.plateNumber || '-'}</span>
                </div>
                
                <div className="info-item">
                  <label>Vehicle Type</label>
                  <span className="info-value">{formData.vehicleType || '-'}</span>
                </div>
                
                <div className="info-item">
                  <label>Address</label>
                  <span className="info-value">{formData.address || '-'}</span>
                </div>
                
                <div className="info-item">
                  <label>Email</label>
                  <span className="info-value">{formData.email || '-'}</span>
                </div>
                
                <div className="info-item">
                  <label>Vehicle Year</label>
                  <span className="info-value">{formData.vehicleYear || '-'}</span>
                </div>
                
                <div className="info-item">
                  <label>Original Value of Vehicle</label>
                  <span className="info-value">
                    {formData.originalValue ? formatCurrency(parseFloat(formData.originalValue)) : '-'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Calculation Summary */}
          <section className="calculation-section">
            <h2>Calculation Summary</h2>
            
            <div className="calculation-box">
              <div className="calc-row">
                <span className="calc-label">Vehicle Year</span>
                <span className="calc-value">{formData.vehicleYear || '-'}</span>
              </div>
              
              <div className="calc-row">
                <span className="calc-label">Vehicle Type</span>
                <span className="calc-value">{formData.vehicleType || '-'}</span>
              </div>
              
              <div className="calc-row">
                <span className="calc-label">Original Value of Vehicle</span>
                <span className="calc-value">
                  {formData.originalValue ? formatCurrency(parseFloat(formData.originalValue)) : '-'}
                </span>
              </div>

              <div className="calc-row">
                <span className="calc-label">Current Vehicle Value</span>
                <span className="calc-value">
                  {formatCurrency(calculationData.vehicleValue)}
                </span>
              </div>
              
              <div className="calc-row">
                <span className="calc-label">Bodily Injury:</span>
                <span className="calc-value">{formatCurrency(calculationData.bodilyInjury)}</span>
              </div>
              
              <div className="calc-row">
                <span className="calc-label">Property Damage:</span>
                <span className="calc-value">{formatCurrency(calculationData.propertyDamage)}</span>
              </div>
              
              <div className="calc-row">
                <span className="calc-label">Personal Accident:</span>
                <span className="calc-value">{formatCurrency(calculationData.personalAccident)}</span>
              </div>
              
              <div className="calc-row">
                <span className="calc-label">Basic Premium:</span>
                <span className="calc-value">{formatCurrency(calculationData.basicPremium)}</span>
              </div>
              
              <div className="calc-row">
                <span className="calc-label">Local Government Tax:</span>
                <span className="calc-value">{formatPercentage(calculationData.localGovTax)}</span>
              </div>
              
              <div className="calc-row">
                <span className="calc-label">VAT:</span>
                <span className="calc-value">{formatPercentage(calculationData.vatTax)}</span>
              </div>
              
              <div className="calc-row">
                <span className="calc-label">Documentary Stamp:</span>
                <span className="calc-value">{formatPercentage(calculationData.docuStamp)}</span>
              </div>
              
              {formData.withAON && (
                <div className="calc-row">
                  <span className="calc-label">AON (Act of Nature):</span>
                  <span className="calc-value">{formatCurrency(calculationData.aonCost)}</span>
                </div>
              )}
              
              <div className="calc-row total-row">
                <span className="calc-label">Total Premium:</span>
                <span className="calc-value total-value">
                  {formatCurrency(calculationData.totalPremium)}
                </span>
              </div>
            </div>
          </section>

          <p className="security-note">
            Your information is secure and will only be used for generating your quotation
          </p>

          {/* PDF Download Button */}
          <div className="download-section">
            <button 
              className="download-button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
            >
              <Download size={18} />
              {isGeneratingPDF ? 'Generating PDF...' : 'Download Quotation PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}