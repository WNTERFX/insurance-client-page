import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./styles/QuoteInfo-styles.css";
import SilverstarLOGO from "./images/SilverStar.png";
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

  // Redirect if no form data
  useEffect(() => {
    if (!formData.firstName || !calculationData.totalPremium) {
      console.warn('No form data found, redirecting to CreateQuote');
      navigate('/insurance-client-page/CreateQuote');
    }
  }, [formData, calculationData, navigate]);

  // Generate quotation number on mount
  useEffect(() => {
    (async () => {
      const qNumber = await generateQuotationNumber();
      setQuotationNumber(qNumber);
    })();
  }, []);

  const handleBack = () => {
    // Navigate back to CreateQuote with form data retained
    navigate("/insurance-client-page/CreateQuote", {
      state: {
        formData: formData
      }
    });
  };

  const handleDownloadPDF = async (e) => {
    // Prevent any default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isGeneratingPDF) return;
    
    setIsGeneratingPDF(true);
    
    try {
      const result = await handleGenerateQuotePDF(formData, calculationData);
      
      if (result.success) {
        console.log("✅ PDF generated successfully:", result.fileName);
        
        // After successful PDF generation, navigate to CreateQuote with empty fields
        setTimeout(() => {
          navigate("/insurance-client-page/CreateQuote", {
            replace: true // This replaces the current history entry
          });
        }, 500); // Small delay to ensure PDF download starts
      } else {
        alert("Failed to generate PDF: " + result.error);
        setIsGeneratingPDF(false);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
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

  // Calculate amount from percentage and round to nearest whole number
  const calculateFromPercentage = (percentage, baseAmount) => {
    const result = (percentage / 100) * baseAmount;
    return Math.round(result); // Round to nearest whole number
  };

  // Get full name
  const getFullName = () => {
    return `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || '-';
  };

  // Get Make Model
  const getMakeModel = () => {
    return `${formData.make || ''} ${formData.model || ''}`.trim() || '-';
  };

  // Calculate tax amounts based on basic premium (rounded to 2 decimals)
  const basicPremiumAmount = calculationData.basicPremium || 0;
  const localGovTaxAmount = calculateFromPercentage(
    calculationData.localGovTax || 0, 
    basicPremiumAmount
  );
  const vatAmount = calculateFromPercentage(
    calculationData.vatTax || 0, 
    basicPremiumAmount
  );
  const docuStampAmount = calculateFromPercentage(
    calculationData.docuStamp || 0, 
    basicPremiumAmount
  );

  return (
    <div className="quote-info-page">
      {/* Header */}
      <header className="top-bar-container">
          <Link
            to="/"
            className="logo-container"
            aria-label="Go to Home — Silverstar Insurance Agency"
          >
            <img src={SilverstarLOGO} alt="Silverstar Insurance — Home" className="logo" />

          </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/insurance-client-page/Partners" className="nav-link">Partners</Link>
            <Link to="/insurance-client-page/Faqs" className="nav-link">FAQs</Link>
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
            <p className="section-description">Registered owner and vehicle information</p>
            
            <div className="info-box">
              <div className="info-grid">
                <div className="info-item">
                  <label>First Name (Registered owner)</label>
                  <span className="info-value">{formData.firstName || '-'}</span>
                </div>
                
                <div className="info-item">
                  <label>Last Name (Registered owner)</label>
                  <span className="info-value">{formData.lastName || '-'}</span>
                </div>
                
                <div className="info-item">
                  <label>Address</label>
                  <span className="info-value">{formData.address || '-'}</span>
                </div>
                
                <div className="info-item">
                  <label>Contact Number</label>
                  <span className="info-value">{formData.contactNumber || '-'}</span>
                </div>
                
                <div className="info-item">
                  <label>Email</label>
                  <span className="info-value">{formData.email || '-'}</span>
                </div>
                
                <div className="info-item">
                  <label>Insurance Partner</label>
                  <span className="info-value">{formData.partnerName || '-'}</span>
                </div>
                
                <div className="info-item">
                  <label>Make</label>
                  <span className="info-value">{formData.make || '-'}</span>
                </div>
                
                <div className="info-item">
                  <label>Model</label>
                  <span className="info-value">{formData.model || '-'}</span>
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
                  <label>Original Value of Vehicle</label>
                  <span className="info-value">
                    {formData.originalValue ? formatCurrency(parseFloat(formData.originalValue)) : '-'}
                  </span>
                </div>
                
                <div className="info-item">
                  <label>Vehicle Year</label>
                  <span className="info-value">{formData.vehicleYear || '-'}</span>
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
                <span className="calc-value">{formatCurrency(localGovTaxAmount)}</span>
              </div>
              
              <div className="calc-row">
                <span className="calc-label">VAT:</span>
                <span className="calc-value">{formatCurrency(vatAmount)}</span>
              </div>
              
              <div className="calc-row">
                <span className="calc-label">Documentary Stamp:</span>
                <span className="calc-value">{formatCurrency(docuStampAmount)}</span>
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
              type="button"
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