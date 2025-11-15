import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./styles/CreateQuote-styles.css";
import SilverstarLOGO from "./images/SilverStar.png";
import CustomAlertModal from "./ClientForms/CustomAlertModal";
import { getComputationValue, fetchVehicleDetails } from "./Actions/VehicleTypeActions";
import { fetchPartners } from "./Actions/PartnersActions";
import {
  ComputationActionsVehicleValue,
  ComputatationRate,
  ComputationActionsBasicPre,
  ComputationActionsTax,
  ComputationActionsAoN
} from "./Actions/ComputationActions";

export default function CreateQuote() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get retained form data if navigating back from QuoteInfo
  const retainedFormData = location.state?.formData || null;

  // Form state - initialize with retained data if available
  const [formData, setFormData] = useState({
    firstName: retainedFormData?.firstName || '',
    lastName: retainedFormData?.lastName || '',
    address: retainedFormData?.address || '',
    contactNumber: retainedFormData?.contactNumber || '',
    email: retainedFormData?.email || '',
    selectedPartner: retainedFormData?.selectedPartner || '',
    partnerName: retainedFormData?.partnerName || '',
    vehicleType: retainedFormData?.vehicleType || '',
    make: retainedFormData?.make || '',
    model: retainedFormData?.model || '',
    plateNumber: retainedFormData?.plateNumber || '',
    originalValue: retainedFormData?.originalValue || '',
    vehicleYear: retainedFormData?.vehicleYear || '',
    withAON: retainedFormData?.withAON || false,
    dataPrivacyConsent: retainedFormData?.dataPrivacyConsent || false
  });

  // Validation errors state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Alert modal state
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  // Vehicle types and details
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [partners, setPartners] = useState([]);

  // Load vehicle types and partners on mount
  useEffect(() => {
    (async () => {
      const types = await getComputationValue();
      const partnersList = await fetchPartners();
      setVehicleTypes(types || []);
      setPartners(partnersList || []);
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

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        if (!value || !value.trim()) return 'First name is required';
        if (!/^[a-zA-Z\s.]+$/.test(value)) return 'First name is invalid';
        return '';

      case 'lastName':
        if (!value || !value.trim()) return 'Last name is required';
        if (!/^[a-zA-Z\s.]+$/.test(value)) return 'Last name is invalid';
        return '';

      case 'address':
        if (!value || !value.trim()) return 'Address is required';
        return '';

      case 'contactNumber': {
        if (!value) return 'Contact Number is required';

        // normalize: drop spaces, hyphens, parentheses
        const raw = String(value).trim();
        const digitsOnly = raw.replace(/\D/g, '');

        // Accept: 09XXXXXXXXX (11 digits) or +639XXXXXXXXX / 639XXXXXXXXX
        const isValid =
          PHONE_REGEX.test(raw) || /^639\d{9}$/.test(digitsOnly);

        if (!isValid) {
          return 'Enter a valid PH mobile (e.g., 09123456789 or +639123456789)';
        }
        return '';
      }

      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';

      case 'selectedPartner':
        if (!value) return 'Insurance Partner is required';
        return '';

      case 'make':
        if (!value || !value.trim()) return 'Make is required';
        return '';

      case 'model':
        if (!value || !value.trim()) return 'Model is required';
        return '';

      case 'plateNumber':
        if (!value || !value.trim()) return 'Plate Number is required';
        return '';

      case 'vehicleType':
        if (!value) return 'Vehicle Type is required';
        return '';

      case 'originalValue':
        if (!value) return 'Original Value is required';
        if (parseFloat(value) <= 0) return 'Original Value must be greater than 0';
        return '';

      case 'vehicleYear':
        if (!value) return 'Vehicle Year is required';
        return '';

      case 'dataPrivacyConsent':
        if (!value) return 'required';
        return '';

      default:
        return '';
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // If changing partner selection, also store the partner name
    if (name === 'selectedPartner') {
      if (value) {
        const partner = partners.find(p => String(p.id) === String(value));
        setFormData(prev => ({
          ...prev,
          selectedPartner: value,
          partnerName: partner ? partner.insurance_Name : ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          selectedPartner: '',
          partnerName: ''
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when user starts typing
    if (touched[name]) {
      const error = validateField(name, type === 'checkbox' ? checked : value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'firstName', 'lastName', 'address', 'contactNumber', 'email',
      'selectedPartner', 'make', 'model', 'plateNumber',
      'vehicleType', 'originalValue', 'vehicleYear', 'dataPrivacyConsent'
    ];

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    setTouched(
      requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    );

    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    // Reset form to initial state
    setFormData({
      firstName: '',
      lastName: '',
      address: '',
      contactNumber: '',
      email: '',
      selectedPartner: '',
      partnerName: '',
      vehicleType: '',
      make: '',
      model: '',
      plateNumber: '',
      originalValue: '',
      vehicleYear: '',
      withAON: false,
      dataPrivacyConsent: false
    });
    setErrors({});
    setTouched({});

    // Navigate to home page
    navigate("/");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    if (!validateForm()) {
      setAlertModal({
        isOpen: true,
        title: 'Alert',
        message: 'Please fill in all required fields correctly'
      });
      return;
    }

    // Verify partner name is set
    let partnerName = formData.partnerName;
    if (!partnerName) {
      const selectedPartnerObj = partners.find(p => p.id.toString() === formData.selectedPartner.toString());

      if (!selectedPartnerObj) {
        console.error('Partner not found!');
        setAlertModal({
          isOpen: true,
          title: 'Error',
          message: 'Error: Selected insurance partner not found. Please try selecting the partner again.'
        });
        return;
      }

      partnerName = selectedPartnerObj.insurance_Name;
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
        formData: {
          ...formData,
          partnerName
        },
        calculationData
      }
    });
  };

  // Allowed PH mobile formats: 09123456789 or +639123456789
  const PHONE_REGEX = /^(?:\+?63|0)9\d{9}$/;

  const VEHICLE_MAKES = [
    "Toyota", "Mitsubishi", "Honda", "Ford", "Nissan", "Hyundai", "Isuzu", "Suzuki",
    "Subaru", "Geely", "Yamaha", "Kawasaki", "KTM", "DUCATI", "CFMOTO"
  ];

  return (
    <div className="create-quote-page">
      {/* Header */}
      <header className="top-bar-container">
          <Link
            to="/insurance-client-page"
            className="logo-container"
            aria-label="Go to Home — Silverstar Insurance Agency"
          >
            <img src={SilverstarLOGO} alt="Silverstar Insurance — Home" className="logo" />

          </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/insurance-client-page/Partners" className="nav-link">Partners</Link>
          <Link to="/insurance-client-page/AboutUs" className="nav-link">About Us</Link>
          <Link to="/insurance-client-page/Contact" className="nav-link">Contact</Link>
          <Link to="/insurance-client-page/login" className="login-button">Log in</Link>
        </nav>
      </header>

      {/* Quote Form Section */}
      <div className="quote-container">
        <div className="insurance-quote-container">
          {/* Updated Header with Cancel Button */}
          <div className="quote-header-with-cancel">
            <div className="quote-header-text">
              <h1>Get Your Vehicle Insurance Quote</h1>
              <p>Fill in the details below to receive a personalized quotation</p>
            </div>
            <button
              type="button"
              className="cancel-quote-button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Registered Owner Details */}
            <section className="form-section_">
              <h2>Registered Owner Details</h2>
              <p className="section-des_">Enter the registered owner's information</p>

              <div className="form-grid_">
                <label>
                  <span className="label-text">
                    First Name (Registered owner)
                    <span className="required">*</span>
                  </span>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={{ borderColor: touched.firstName && errors.firstName ? 'red' : '' }}
                  />
                  {touched.firstName && errors.firstName && (
                    <small style={{ color: 'red' }}>{errors.firstName}</small>
                  )}
                </label>

                <label>
                  <span className="label-text">
                    Last Name (Registered owner)
                    <span className="required">*</span>
                  </span>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={{ borderColor: touched.lastName && errors.lastName ? 'red' : '' }}
                  />
                  {touched.lastName && errors.lastName && (
                    <small style={{ color: 'red' }}>{errors.lastName}</small>
                  )}
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
                    onBlur={handleBlur}
                    style={{ borderColor: touched.address && errors.address ? 'red' : '' }}
                  />
                  {touched.address && errors.address && (
                    <small style={{ color: 'red' }}>{errors.address}</small>
                  )}
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
                    onBlur={handleBlur}
                    inputMode="numeric"
                    pattern="^(?:\+?63|0)9\d{9}$"
                    placeholder="e.g., 09123456789 or +639123456789"
                    maxLength="14"
                    style={{ borderColor: touched.contactNumber && errors.contactNumber ? 'red' : '' }}
                  />
                  {touched.contactNumber && errors.contactNumber && (
                    <small style={{ color: 'red' }}>{errors.contactNumber}</small>
                  )}
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
                    onBlur={handleBlur}
                    style={{ borderColor: touched.email && errors.email ? 'red' : '' }}
                  />
                  {touched.email && errors.email && (
                    <small style={{ color: 'red' }}>{errors.email}</small>
                  )}
                </label>

                <label>
                  <span className="label-text">
                    Insurance Partner
                    <span className="required">*</span>
                  </span>
                  <select
                    name="selectedPartner"
                    value={formData.selectedPartner}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={{ borderColor: touched.selectedPartner && errors.selectedPartner ? 'red' : '' }}
                  >
                    <option value="">Select Insurance Partner</option>
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.insurance_Name}
                      </option>
                    ))}
                  </select>
                  {touched.selectedPartner && errors.selectedPartner && (
                    <small style={{ color: 'red' }}>{errors.selectedPartner}</small>
                  )}
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
                    Make
                    <span className="required">*</span>
                  </span>
                  <select
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={{ borderColor: touched.make && errors.make ? 'red' : '' }}
                  >
                    <option value="">Select Make</option>
                    {VEHICLE_MAKES.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  {touched.make && errors.make && (
                    <small style={{ color: 'red' }}>{errors.make}</small>
                  )}
                </label>

                <label>
                  <span className="label-text">
                    Model
                    <span className="required">*</span>
                  </span>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., Camry, Civic, Mustang"
                    style={{ borderColor: touched.model && errors.model ? 'red' : '' }}
                  />
                  {touched.model && errors.model && (
                    <small style={{ color: 'red' }}>{errors.model}</small>
                  )}
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
                    onBlur={handleBlur}
                    style={{ borderColor: touched.plateNumber && errors.plateNumber ? 'red' : '' }}
                  />
                  {touched.plateNumber && errors.plateNumber && (
                    <small style={{ color: 'red' }}>{errors.plateNumber}</small>
                  )}
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
                    onBlur={handleBlur}
                    style={{ borderColor: touched.vehicleType && errors.vehicleType ? 'red' : '' }}
                  >
                    <option value="">Select Vehicle Type</option>
                    {vehicleTypes.map((type) => (
                      <option key={type.id} value={type.vehicle_type}>
                        {type.vehicle_type}
                      </option>
                    ))}
                  </select>
                  {touched.vehicleType && errors.vehicleType && (
                    <small style={{ color: 'red' }}>{errors.vehicleType}</small>
                  )}
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
                    onBlur={handleBlur}
                    min="0"
                    step="0.01"
                    style={{ borderColor: touched.originalValue && errors.originalValue ? 'red' : '' }}
                  />
                  {touched.originalValue && errors.originalValue && (
                    <small style={{ color: 'red' }}>{errors.originalValue}</small>
                  )}
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
                    onBlur={handleBlur}
                    style={{ borderColor: touched.vehicleYear && errors.vehicleYear ? 'red' : '' }}
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 11 }, (_, i) => 2025 - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {touched.vehicleYear && errors.vehicleYear && (
                    <small style={{ color: 'red' }}>{errors.vehicleYear}</small>
                  )}
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
              <label
                className="aon-disclaimer"
                style={{
                  color: touched.dataPrivacyConsent && errors.dataPrivacyConsent ? 'red' : 'inherit'
                }}
              >
                <input
                  type="checkbox"
                  name="dataPrivacyConsent"
                  checked={formData.dataPrivacyConsent}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <span>
                  In compliance with the Data Privacy Act (DPA) of 2012 and its Implementing Rules and Regulations (IRR) effective September 9, 2016,
                  I hereby authorize Silverstar Insurance Agency Inc. to collect, store, and process my personal information for the purpose of generating
                  and providing an insurance quotation. This includes using my data to assess eligibility, compute premiums, and communicate relevant offers or
                  follow-ups related to the quotation request.
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

      {/* Custom Alert Modal */}
      <CustomAlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
      />
    </div>
  );
}