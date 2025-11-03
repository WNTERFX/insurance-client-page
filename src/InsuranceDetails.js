import { useEffect, useState, useRef } from "react";
import { getCurrentClient, fetchPoliciesWithComputation } from "./Actions/PolicyActions"; 
import { fetchPartners } from "./Actions/PartnersActions";
import './styles/InsuranceDetails.css'
import { logoutClient } from "./Actions/LoginActions";
import { FaBell, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function InsuranceDetails() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Filter states ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [partnerFilter, setPartnerFilter] = useState("All Partners");
  const [companyPartners, setCompanyPartners] = useState([]);

  // Load current user data
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const client = await getCurrentClient();
        if (client) {
          setCurrentUser(client);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    }
    loadCurrentUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    console.log("Logging out...");
    const result = await logoutClient();
   
    if (result.success) {
      navigate("/insurance-client-page/");
    } else {
      console.error("Failed to log out:", result.error);
      alert("Logout failed. Please try again.");
    }
  };

  // Display name logic
  const displayName = () => {
    if (!currentUser) return "Loading...";
    
    const prefix = currentUser.prefix || "";
    const firstName = currentUser.first_Name || "";
    
    if (prefix && firstName) {
      return `${prefix} ${firstName}`;
    } else if (firstName) {
      return firstName;
    } else if (currentUser.last_Name) {
      return currentUser.last_Name;
    } else {
      return "User";
    }
  };

  useEffect(() => {
    const loadInsuranceData = async () => {
      try {
        setLoading(true);
        setError(null);

        const policies = await fetchPoliciesWithComputation();
        setDetails(policies || []);
      } catch (err) {
        setError(err.message || "Failed to load insurance details");
      } finally {
        setLoading(false);
      }
    };
    loadInsuranceData();
  }, []);

  // Load partners from Supabase
  useEffect(() => {
    const loadPartners = async () => {
      try {
        const partners = await fetchPartners();
        setCompanyPartners(partners);
      } catch (error) {
        console.error("Error loading partners:", error);
      }
    };
    loadPartners();
  }, []);

  // --- Combined filtering logic ---
  const filteredDetails = details.filter((policy) => {
    // Status filter
    const matchesStatus = 
      statusFilter === "All Status" || 
      (statusFilter === "Active" && policy.policy_is_active) ||
      (statusFilter === "Inactive" && !policy.policy_is_active);

    // Partner filter
    const matchesPartner = 
      partnerFilter === "All Partners" || 
      policy.insurance_Partners?.insurance_Name === partnerFilter;

    // Search filter
    const searchableText = [
      policy.policy_type,
      policy.internal_id,
      policy.insurance_Partners?.insurance_Name,
      policy.vehicle_table?.map(v => v.vehicle_name).join(' '),
      policy.vehicle_table?.map(v => v.vehicle_maker).join(' '),
      policy.vehicle_table?.map(v => v.engine_serial_no).join(' ')
    ].filter(Boolean).join(' ').toLowerCase();

    const matchesSearch = searchableText.includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPartner && matchesSearch;
  });

  const formatCurrency = (amount) => `₱${(amount || 0).toLocaleString()}`;
  
  // Calculate tax/fee amounts from percentage and round to nearest whole number
  const calculateTaxAmount = (percentage, baseAmount) => {
    const result = (percentage / 100) * baseAmount;
    return Math.round(result);
  };

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");

  if (loading) {
    return (
      <div className="InsuranceDetails-container">
        <header className="topbar-client">
          <div className="header-content-info">
            <div className="header-left">
              <h1 className="page-title">Insurance Details</h1>
              <p className="page-subtitle">Review your active and inactive policy information.</p>
            </div>
            
            <div className="header-right">
              <button className="notification-btn">
                <FaBell className="notification-icon" />
              </button>
              
              <div className="user-dropdown" ref={dropdownRef}>
                <button
                  className="user-dropdown-toggle"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="user-name">{displayName()}</span>
                  <FaUserCircle className="user-avatar-icon" />
                </button>
                
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      <FaSignOutAlt className="dropdown-icon" />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <div className="loading-spinner-container">
          <div className="spinner-large"></div>
          <p>Loading insurance details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="InsuranceDetails-container">
        <header className="topbar-client">
          <div className="header-content-info">
            <div className="header-left">
              <h1 className="page-title">Insurance Details</h1>
              <p className="page-subtitle">Review your active and inactive policy information.</p>
            </div>
            
            <div className="header-right">
              <button className="notification-btn">
                <FaBell className="notification-icon" />
              </button>
              
              <div className="user-dropdown" ref={dropdownRef}>
                <button
                  className="user-dropdown-toggle"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="user-name">{displayName()}</span>
                  <FaUserCircle className="user-avatar-icon" />
                </button>
                
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      <FaSignOutAlt className="dropdown-icon" />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <div className="error-box"><strong>Error:</strong> {error}</div>
      </div>
    );
  }

  return (
    <div className="InsuranceDetails-container">
      <header className="topbar-client">
        <div className="header-content-info">
          <div className="header-left">
            <h1 className="page-title">Insurance Details</h1>
            <p className="page-subtitle">Review your active and inactive policy information.</p>
          </div>
          
          <div className="header-right">
            <button className="notification-btn">
              <FaBell className="notification-icon" />
            </button>
            
            <div className="user-dropdown" ref={dropdownRef}>
              <button
                className="user-dropdown-toggle"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="user-name">{displayName()}</span>
                <FaUserCircle className="user-avatar-icon" />
              </button>
              
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    <FaSignOutAlt className="dropdown-icon" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Filter Controls */}
      <div className="controls-insurance">
        <span className="policy-count-text">
          Insurance Policy ({filteredDetails.length})
        </span>
        <div className="search-container-insurance">
          <input
            type="text"
            placeholder="Search by policy type, ID, partner, vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="All Status">Status: All</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <select
          value={partnerFilter}
          onChange={(e) => setPartnerFilter(e.target.value)}
          className="partner-filter"
        >
          <option value="All Partners">Partner: All</option>
          {companyPartners.map((partner) => (
            <option key={partner.id} value={partner.insurance_Name}>
              {partner.insurance_Name}
            </option>
          ))}
        </select>
      </div>

      {/* Policies Grid */}
      {filteredDetails.length === 0 ? (
        <div className="empty-state">
          <h3>No Insurance Policies Found</h3>
          <p>No policies match your current filters.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {filteredDetails.map((policy) => (
            <div key={policy.id} className="policy-card">
              {/* Policy Header */}
              <div className="policy-header">
                <div>
                  <h2>{policy.policy_type || 'Insurance Policy'}</h2>
                  <p>Policy ID: {policy.internal_id}</p>
                </div>
                <div className={`policy-status ${policy.policy_is_active ? 'active' : 'inactive'}`}>
                  {policy.policy_is_active ? "Active" : "Inactive"}
                </div>
              </div>

              {/* Policy Info */}
              <div className="policy-info">
                <h3>Policy Information</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                  <div><strong>Inception Date:</strong> {formatDate(policy.policy_inception)}</div>
                  <div><strong>Expiry Date:</strong> {formatDate(policy.policy_expiry)}</div>
                  <div><strong>Created:</strong> {formatDate(policy.created_at)}</div>
                  <div><strong>Insurer:</strong> {policy.insurance_Partners?.insurance_Name || 'N/A'}</div>
                </div>
              </div>

              {/* Policy Details Grid */}
              <div className="policy-details-grid">
                {/* Policy Computation */}
                <div className="policy-computation">
                  <h3>Premium Summary</h3>
                  {policy.policy_Computation_Table && policy.policy_Computation_Table.length > 0 ? (
                    policy.policy_Computation_Table.map((computation) => (
                      <div key={computation.id} className="computation-card">
                        <div><strong>Original Value:</strong><span>{formatCurrency(computation.original_Value)}</span></div>
                        <div><strong>Current Value:</strong><span>{formatCurrency(computation.current_Value)}</span></div>
                        <div><strong>AON Cost:</strong><span>{formatCurrency(computation.aon_Cost)}</span></div>
                        <div><strong>Vehicle Rate Value:</strong><span>{formatCurrency(computation.vehicle_Rate_Value)}</span></div>
                        <div className="total-premium-row">
                          <strong>Total Premium:</strong> 
                          <span>{formatCurrency(computation.total_Premium)}</span>
                        </div>
                      </div>
                    ))
                  ) : <div className="no-data">No computation data available</div>}
                </div>

                {/* Vehicle Details */}
                <div className="vehicle-details">
                  <h3>Vehicle Information</h3>
                  {policy.vehicle_table?.length > 0 ? policy.vehicle_table.map(vehicle => (
                    <div key={vehicle.id} className="vehicle-info">
                      <div className="vehicle-info-grid">
                        <div>
                          <strong>Make:</strong>
                          <span>{vehicle.vehicle_maker || 'N/A'}</span>
                        </div>
                        <div>
                          <strong>Model:</strong>
                          <span>{vehicle.vehicle_name || 'N/A'}</span>
                        </div>
                        <div>
                          <strong>Color:</strong>
                          <span>{vehicle.vehicle_color || 'N/A'}</span>
                        </div>
                        <div>
                          <strong>Year:</strong>
                          <span>{vehicle.vehicle_year || 'N/A'}</span>
                        </div>
                        <div>
                          <strong>Plate Number:</strong>
                          <span>{vehicle.plate_num || 'N/A'}</span>
                        </div>
                        <div>
                          <strong>VIN:</strong>
                          <span>{vehicle.vin_num || 'N/A'}</span>
                        </div>
                        <div>
                          <strong>Engine Serial Number:</strong>
                          <span>{vehicle.engine_serial_no || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )) : <div className="no-data">No vehicle data available</div>}
                </div>
              </div>

              {/* Coverage & Tax Breakdown */}
              {policy.vehicle_table?.length > 0 && policy.vehicle_table.map(vehicle => (
                vehicle.calculation_Table ? (
                  <div key={vehicle.id} className="coverage-tax">
                    <h3>Coverage & Tax Breakdown</h3>
                    <div className="grid-three">
                      <div>
                        <h5>Coverage Amounts</h5>
                        <div><strong>Bodily Injury:</strong>{formatCurrency(vehicle.calculation_Table.bodily_Injury)}</div>
                        <div><strong>Property Damage:</strong> {formatCurrency(vehicle.calculation_Table.property_Damage)}</div>
                        <div><strong>Personal Accident:</strong> {formatCurrency(vehicle.calculation_Table.personal_Accident)}</div>
                        <div><strong>Vehicle Type:</strong> {vehicle.calculation_Table.vehicle_type}</div>
                      </div>
                      {/*<div>
                        <h5>Rates & Premiums</h5>
                        <div>
                          <strong>Vehicle Rate:</strong> 
                          {formatCurrency(
                            calculateTaxAmount(
                              vehicle.calculation_Table.vehicle_Rate || 0,
                              policy.policy_Computation_Table?.[0]?.current_Value || 0
                            )
                          )}
                        </div>
                        <div>
                          <strong>AON:</strong> 
                          {formatCurrency(
                            calculateTaxAmount(
                              vehicle.calculation_Table.aon * 100 || 0,
                              policy.policy_Computation_Table?.[0]?.current_Value || 0
                            )
                          )}
                        </div>
                      </div>*/}
                      <div>
                        <h5>Taxes & Fees</h5>
                        <div>
                          <strong>VAT Tax:</strong> 
                          {formatCurrency(
                            calculateTaxAmount(
                              vehicle.calculation_Table.vat_Tax || 0,
                              policy.policy_Computation_Table?.[0]?.vehicle_Rate_Value || 0
                            )
                          )}
                        </div>
                        <div>
                          <strong>Documentary Stamp:</strong> 
                          {formatCurrency(
                            calculateTaxAmount(
                              vehicle.calculation_Table.docu_Stamp || 0,
                              policy.policy_Computation_Table?.[0]?.vehicle_Rate_Value || 0
                            )
                          )}
                        </div>
                        <div>
                          <strong>Local Gov Tax:</strong> 
                          {formatCurrency(
                            calculateTaxAmount(
                              vehicle.calculation_Table.local_Gov_Tax || 0,
                              policy.policy_Computation_Table?.[0]?.vehicle_Rate_Value || 0
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : <div className="no-calculation" key={vehicle.id}>No calculation data found for this vehicle</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="summary">
        <h3>Summary</h3>
        <div className="grid">
          <div>
            {details.length}
            <div style={{ color: "#6b7280" }}>Total Policies</div>
          </div>
          <div>
            {details.filter(p => p.policy_is_active).length}
            <div style={{ color: "#6b7280" }}>Active Policies</div>
          </div>
          <div>
            {details.filter(p => !p.policy_is_active).length}
            <div style={{ color: "#6b7280" }}>Inactive Policies</div>
          </div>
        </div>
      </div>
    </div>
  );
}