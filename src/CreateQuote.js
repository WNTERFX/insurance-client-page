import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/CreateQuote-styles.css";
import SilverstarLOGO from "./images/SilverstarLOGO.png";
import { getComputationValue, fetchVehicleDetails } from "./Actions/VehicleTypeActions";
import {
  ComputationActionsVehicleValue,
  ComputatationRate,
  ComputationActionsBasicPre,
  ComputationActionsTax,
  ComputationActionsAoN
} from "./Actions/ComputationActions";

export default function CreateQuote() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    ownerName: '',
    address: '',
    contactNumber: '',
    email: '',
    vehicleType: '',
    vehicleName: '',
    plateNumber: '',
    originalValue: '',
    vehicleYear: '',
    withAON: false,
    dataPrivacyConsent: false
  });

  // Vehicle types and details
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [vehicleDetails, setVehicleDetails] = useState(null);

  // Load vehicle types on mount
  useEffect(() => {
    (async () => {
      const types = await getComputationValue();
      setVehicleTypes(types || []);
    })();
  }, []);

  // Load vehicle details when type changes
  useEffect(() => {
    if (!formData.vehicleType) {
      setVehicleDetails(null);
      return;
    }
    
    (async () => {
      const details = await fetchVehicleDetails(formData.vehicleType);
      setVehicleDetails(details || null);
    })();
  }, [formData.vehicleType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.ownerName || !formData.contactNumber || !formData.email || 
        !formData.vehicleName || !formData.plateNumber || !formData.vehicleType ||
        !formData.originalValue || !formData.vehicleYear || !formData.dataPrivacyConsent) {
      alert('Please fill in all required fields and accept the data privacy consent');
      return;
    }

    // Calculate all values
    const vehicleValue = ComputationActionsVehicleValue(
      parseFloat(formData.originalValue) || 0,
      parseInt(formData.vehicleYear) || 0
    );

    const vehicleRate = vehicleDetails?.vehicle_Rate || 0;
    const vehicleValueRate = ComputatationRate(vehicleRate, vehicleValue);

    const bodilyInjury = vehicleDetails?.bodily_Injury || 0;
    const propertyDamage = vehicleDetails?.property_Damage || 0;
    const personalAccident = vehicleDetails?.personal_Accident || 0;

    const basicPremium = ComputationActionsBasicPre(
      bodilyInjury,
      propertyDamage,
      personalAccident
    ) + vehicleValueRate;

    const vatTax = vehicleDetails?.vat_Tax || 0;
    const docuStamp = vehicleDetails?.docu_Stamp || 0;
    const localGovTax = vehicleDetails?.local_Gov_Tax || 0;

    const totalPremiumBeforAON = ComputationActionsTax(
      basicPremium,
      vatTax,
      docuStamp,
      localGovTax
    );

    const aonRate = vehicleDetails?.aon || 0;
    const aonCost = formData.withAON ? ComputationActionsAoN(vehicleValue, aonRate) : 0;

    const totalPremium = totalPremiumBeforAON + aonCost;

    // Prepare calculation data
    const calculationData = {
      vehicleValue,
      vehicleValueRate,
      bodilyInjury,
      propertyDamage,
      personalAccident,
      basicPremium,
      localGovTax,
      vatTax,
      docuStamp,
      aonCost,
      totalPremium
    };

    // Navigate to QuoteInfo with form data and calculations
    navigate("/insurance-client-page/QuoteInfo", {
      state: {
        formData,
        calculationData
      }
    });
  };

  return (
    <div className="create-quote-page">
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

      {/* Quote Form Section */}
      <div className="quote-container">
        <div className="insurance-quote-container">
          <h1>Get Your Vehicle Insurance Quote</h1>
          <p>Fill in the details below to receive a personalized quotation</p>

          <form onSubmit={handleSubmit}>
            {/* Registered Owner Details */}
            <section className="form-section_">
              <h2>Registered Owner Details</h2>
              <p className="section-des_">Enter the registered owner's information</p>
              
              <div className="form-grid_"> 
                <label>
                  <span className="label-text">
                    First Name, Last Name (Registered owner)
                    <span className="required">*</span>
                  </span>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  <span className="label-text">
                    Address
                    <span className="required">*</span>
                  </span>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  <span className="label-text">
                    Contact Number
                    <span className="required">*</span>
                  </span>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  <span className="label-text">
                    Email
                    <span className="required">*</span>
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>
            </section>

            {/* Vehicle Information */}
            <section className="form-section_">
              <h2>Vehicle Information</h2>
              <p className="section-des_">Enter your vehicle specifications</p>
              
              <div className="form-group">
                <label>
                  <span className="label-text">
                    Vehicle Name
                    <span className="required">*</span>
                  </span>
                  <input
                    type="text"
                    name="vehicleName"
                    value={formData.vehicleName}
                    onChange={handleChange}
                    required
                  />
                </label>
              
                <label>
                  <span className="label-text">
                    Plate Number
                    <span className="required">*</span>
                  </span>
                  <input
                    type="text"
                    name="plateNumber"
                    value={formData.plateNumber}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  <span className="label-text">
                    Vehicle Type
                    <span className="required">*</span>
                  </span>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Vehicle Type</option>
                    {vehicleTypes.map((type) => (
                      <option key={type.id} value={type.vehicle_type}>
                        {type.vehicle_type}
                      </option>
                    ))}
                  </select>
                </label>
                
                <label>
                  <span className="label-text">
                    Original Value of Vehicle
                    <span className="required">*</span>
                  </span>
                  <input
                    type="number"
                    name="originalValue"
                    value={formData.originalValue}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </label>

                <label>
                  <span className="label-text">
                    Vehicle Year
                    <span className="required">*</span>
                  </span>
                  <select
                    name="vehicleYear"
                    value={formData.vehicleYear}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 11 }, (_, i) => 2025 - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </label>

                {/* AON Checkbox */}
                <div className="checkbox-group_">
                  <span>With Act Of Nature (AON):</span>
                  <input
                    type="checkbox"
                    name="withAON"
                    checked={formData.withAON}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            {/* Data Privacy Consent */}
            <section className="aon-section_">
              <label className="aon-disclaimer">
                <input
                  type="checkbox"
                  name="dataPrivacyConsent"
                  checked={formData.dataPrivacyConsent}
                  onChange={handleChange}
                  required
                />
                <span>
                  In compliance with the Data Privacy Act (DPA) of 2012, and its Implementing Rules and Regulations (IRR) effective September 9, 2016,
                  I allow Standard Insurance to collect, store and process my information to provide me certain services declared in relation to the
                  insurance policy/ies I am purchasing.
                </span>
              </label>
            </section>

            {/* Info Box */}
            <div className="info-box">
              <p>
                <strong>Note:</strong> Please ensure all details of the registered owner entered above are correct and match your vehicle registration documents.
              </p>
            </div>

            <p className="privacy-statement">
              Your information is secure and will only be used for generating your quotation
            </p>

            {/* Submit Button */}
            <div className="submit-button-container">
              <button type="submit" className="get-quotation-button">
                Get Quotation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}