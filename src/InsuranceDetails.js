// InsuranceDetails.jsx
import { useEffect, useState } from "react";
import { getCurrentClient, fetchPoliciesWithComputation } from "./Actions/PolicyActions";
import { fetchPartners } from "./Actions/PartnersActions";
import "./styles/InsuranceDetails.css";
import { useNavigate } from "react-router-dom";
import { useDeclarePageHeader } from "./PageHeaderProvider"; // <-- use the same header hook as Home

export default function InsuranceDetails() {
  // Declare the page header (this shows up in TopbarClient)
  useDeclarePageHeader(
    "Insurance Details",
    "Review your active and inactive policy information."
  );

  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Filter states ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [partnerFilter, setPartnerFilter] = useState("All Partners");
  const [companyPartners, setCompanyPartners] = useState([]);

  /* ---------- helpers (LIFO ordering) ---------- */
  function policyOrderKey(p) {
    if (p?.updated_at) return new Date(p.updated_at).getTime();
    if (p?.created_at) return new Date(p.created_at).getTime();
    if (p?.policy_inception) return new Date(p.policy_inception).getTime();
    const n = Number(String(p?.internal_id || "").replace(/\D+/g, ""));
    if (Number.isFinite(n)) return n;
    return Number(p?.id || 0);
  }

  // Load current user (kept in case you use it in the page)
  useEffect(() => {
    (async () => {
      try {
        const client = await getCurrentClient();
        if (client) setCurrentUser(client);
      } catch (e) {
        console.error("Error loading user:", e);
      }
    })();
  }, []);

  // Load insurance data
  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  // Load partners
  useEffect(() => {
    (async () => {
      try {
        const partners = await fetchPartners();
        setCompanyPartners(partners);
      } catch (e) {
        console.error("Error loading partners:", e);
      }
    })();
  }, []);

  // --- Combined filtering logic ---
  const filteredDetails = details.filter((policy) => {
    const matchesStatus =
      statusFilter === "All Status" ||
      (statusFilter === "Active" && policy.policy_is_active) ||
      (statusFilter === "Inactive" && !policy.policy_is_active);

    const matchesPartner =
      partnerFilter === "All Partners" ||
      policy.insurance_Partners?.insurance_Name === partnerFilter;

    const searchableText = [
      policy.policy_type,
      policy.internal_id,
      policy.insurance_Partners?.insurance_Name,
      policy.vehicle_table?.map((v) => v.vehicle_name).join(" "),
      policy.vehicle_table?.map((v) => v.vehicle_maker).join(" "),
      policy.vehicle_table?.map((v) => v.plate_num).join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPartner && matchesSearch;
  });

  const filteredDetailsLIFO = [...filteredDetails].sort(
    (a, b) => policyOrderKey(b) - policyOrderKey(a)
  );

  // utils
  const formatCurrency = (amount) => `₱${(amount || 0).toLocaleString()}`;
  const calculateTaxAmount = (percent, base) =>
    Math.round(((percent || 0) / 100) * (base || 0));
  const formatDateLong = (date) =>
    date
      ? new Date(date).toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "N/A";

  if (loading) {
    return (
      <div className="InsuranceDetails-container">
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
        <div className="error-box">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="InsuranceDetails-container">
      {/* Filter Controls */}
      <div className="controls-insurance">
        <span className="policy-count-text">
          Insurance Policy ({filteredDetailsLIFO.length})
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

      {/* Policies Grid (LIFO) */}
      {filteredDetailsLIFO.length === 0 ? (
        <div className="empty-state">
          <h3>No Insurance Policies Found</h3>
          <p>No policies match your current filters.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {filteredDetailsLIFO.map((policy) => (
            <div key={policy.id} className="policy-card">
              {/* Policy Header */}
              <div className="policy-header">
                <div>
                  <h2>{policy.policy_type || "Insurance Policy"}</h2>
                  <p>Policy ID: {policy.internal_id}</p>
                </div>
                <div
                  className={`policy-status ${
                    policy.policy_is_active ? "active" : "inactive"
                  }`}
                >
                  {policy.policy_is_active ? "Active" : "Inactive"}
                </div>
              </div>

              {/* Policy Info */}
              <div className="policy-info">
                <h3>Policy Information</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <strong>Inception Date:</strong>{" "}
                    {formatDateLong(policy.policy_inception)}
                  </div>
                  <div>
                    <strong>Expiry Date:</strong>{" "}
                    {formatDateLong(policy.policy_expiry)}
                  </div>
                  <div>
                    <strong>Created:</strong>{" "}
                    {formatDateLong(policy.created_at)}
                  </div>
                  <div>
                    <strong>Insurer:</strong>{" "}
                    {policy.insurance_Partners?.insurance_Name || "N/A"}
                  </div>
                </div>
              </div>

              {/* Policy Details Grid */}
              <div className="policy-details-grid">
                {/* Premium Summary */}
                <div className="policy-computation">
                  <h3>Premium Summary</h3>
                  {policy.policy_Computation_Table &&
                  policy.policy_Computation_Table.length > 0 ? (
                    policy.policy_Computation_Table.map((computation) => (
                      <div key={computation.id} className="computation-card">
                        <div>
                          <strong>Original Value:</strong>
                          <span>{formatCurrency(computation.original_Value)}</span>
                        </div>
                        <div>
                          <strong>Current Value:</strong>
                          <span>{formatCurrency(computation.current_Value)}</span>
                        </div>
                        <div>
                          <strong>AON Cost:</strong>
                          <span>{formatCurrency(computation.aon_Cost)}</span>
                        </div>
                        <div>
                          <strong>Vehicle Rate Value:</strong>
                          <span>{formatCurrency(computation.vehicle_Rate_Value)}</span>
                        </div>
                        <div className="total-premium-row">
                          <strong>Total Premium:</strong>
                          <span>{formatCurrency(computation.total_Premium)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">No computation data available</div>
                  )}
                </div>

                {/* Vehicle Details */}
                <div className="vehicle-details">
                  <h3>Vehicle Information</h3>
                  {policy.vehicle_table?.length > 0 ? (
                    policy.vehicle_table.map((vehicle) => (
                      <div key={vehicle.id} className="vehicle-info">
                        <div className="vehicle-info-grid">
                          <div>
                            <strong>Make Model:</strong>
                            <span>{vehicle.vehicle_maker || "N/A"}</span>
                          </div>
                          <div>
                            <strong>Vehicle:</strong>
                            <span>{vehicle.vehicle_name || "N/A"}</span>
                          </div>
                          <div>
                            <strong>Color:</strong>
                            <span>{vehicle.vehicle_color || "N/A"}</span>
                          </div>
                          <div>
                            <strong>Year:</strong>
                            <span>{vehicle.vehicle_year || "N/A"}</span>
                          </div>
                          <div>
                            <strong>Plate Number:</strong>
                            <span>{vehicle.plate_num || "N/A"}</span>
                          </div>
                          <div>
                            <strong>VIN:</strong>
                            <span>{vehicle.vin_num || "N/A"}</span>
                          </div>
                          <div>
                            <strong>Engine Serial Number:</strong>
                            <span>{vehicle.engine_num || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">No vehicle data available</div>
                  )}
                </div>
              </div>

              {/* Coverage & Tax Breakdown */}
              {policy.vehicle_table?.length > 0 &&
                policy.vehicle_table.map((vehicle) => {
                  if (!vehicle.calculation_Table) {
                    return (
                      <div className="no-calculation" key={vehicle.id}>
                        No calculation data found for this vehicle
                      </div>
                    );
                  }

                  const bodilyInjury = vehicle.calculation_Table.bodily_Injury || 0;
                  const propertyDamage =
                    vehicle.calculation_Table.property_Damage || 0;
                  const personalAccident =
                    vehicle.calculation_Table.personal_Accident || 0;
                  const vehicleRateValue =
                    policy.policy_Computation_Table?.[0]?.vehicle_Rate_Value || 0;
                  const basicPremium =
                    bodilyInjury + propertyDamage + personalAccident + vehicleRateValue;

                  return (
                    <div key={vehicle.id} className="coverage-tax">
                      <h3>Coverage & Tax Breakdown</h3>
                      <div className="grid-three">
                        <div>
                          <h5>Coverage Amounts</h5>
                          <div>
                            <strong>Bodily Injury:</strong>
                            {formatCurrency(bodilyInjury)}
                          </div>
                          <div>
                            <strong>Property Damage:</strong>{" "}
                            {formatCurrency(propertyDamage)}
                          </div>
                          <div>
                            <strong>Personal Accident:</strong>{" "}
                            {formatCurrency(personalAccident)}
                          </div>
                          <div>
                            <strong>Vehicle Type:</strong>{" "}
                            {vehicle.calculation_Table.vehicle_type}
                          </div>
                        </div>
                        <div>
                          <h5>Taxes & Fees</h5>
                          <div>
                            <strong>VAT Tax:</strong>
                            {formatCurrency(
                              calculateTaxAmount(
                                vehicle.calculation_Table.vat_Tax || 0,
                                basicPremium
                              )
                            )}
                          </div>
                          <div>
                            <strong>Documentary Stamp:</strong>
                            {formatCurrency(
                              calculateTaxAmount(
                                vehicle.calculation_Table.docu_Stamp || 0,
                                basicPremium
                              )
                            )}
                          </div>
                          <div>
                            <strong>Local Gov Tax:</strong>
                            {formatCurrency(
                              calculateTaxAmount(
                                vehicle.calculation_Table.local_Gov_Tax || 0,
                                basicPremium
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
            {details.filter((p) => p.policy_is_active).length}
            <div style={{ color: "#6b7280" }}>Active Policies</div>
          </div>
          <div>
            {details.filter((p) => !p.policy_is_active).length}
            <div style={{ color: "#6b7280" }}>Inactive Policies</div>
          </div>
        </div>
      </div>
    </div>
  );
}
