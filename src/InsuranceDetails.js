import { useEffect, useState } from "react";
import { getCurrentClient, fetchPoliciesWithComputation } from "./Actions/PolicyActions";
import './styles/InsuranceDetails.css'

export default function InsuranceDetails() {
  const [details, setDetails] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInsuranceData = async () => {
      try {
        setLoading(true);
        setError(null);

        const user = await getCurrentClient();
        setCurrentUser(user);

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

  const formatCurrency = (amount) => `₱${(amount || 0).toLocaleString()}`;
  const formatPercentage = (rate) => `${((rate || 0) * 100).toFixed(0)}%`;
  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");

  if (loading) return <div className="InsuranceDetails-container"><div className="loading-message">Loading insurance details <span className="spinner"></span></div></div>;
  if (error) return <div className="InsuranceDetails-container"><div className="error-box"><strong>Error:</strong> {error}</div></div>;
  if (!details.length) return <div className="InsuranceDetails-container"><div className="empty-state"><h3>No Insurance Policies Found</h3><p>You don't have any insurance policies yet.</p></div></div>;

  return (
    <div className="InsuranceDetails-container">
      {/* Header */}
      <div className="insurance-header" style={{ marginBottom: "2rem" }}>
        <h1>Insurance Details</h1>
        {currentUser && <p>
          Welcome back, {[
            currentUser.prefix,
            currentUser.first_Name,
            currentUser.middle_Name,
            currentUser.family_Name,
            currentUser.suffix
          ]
            .filter(Boolean) // remove null/undefined/empty strings
            .join(' ')}
        </p>}
      </div>


      {/* Policies Grid */}
      <div style={{ display: "grid", gap: "1.5rem" }}>
        {details.map((policy) => (
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
                <div><strong>Partner ID:</strong> {policy.partner_id || 'N/A'}</div>
              </div>
            </div>

            {/* Policy Computation */}
            <div className="policy-computation">
              <h3>Policy Computation</h3>
              {policy.policy_Computation_Table && policy.policy_Computation_Table.length > 0 ? (
                policy.policy_Computation_Table.map((computation) => (
                  <div key={computation.id} className="computation-card">
                    <div><strong>Original Value:</strong> {formatCurrency(computation.original_Value)}</div>
                    <div><strong>Current Value:</strong> {formatCurrency(computation.current_Value)}</div>
                    <div><strong>AON Cost:</strong> {formatCurrency(computation.aon_Cost)}</div>
                    <div><strong>Vehicle Rate Value:</strong> {formatCurrency(computation.vehicle_Rate_Value)}</div>
                    <hr />
                    <div><strong style={{ color: "#92400e" }}>Total Premium:</strong> <span style={{ fontWeight: 700, color: "#059669" }}>{formatCurrency(computation.total_Premium)}</span></div>
                  </div>
                ))
              ) : <div className="no-data">No computation data available</div>}
            </div>

            {/* Vehicle Details */}
            <div className="vehicle-details">
              <h3>Vehicle & Coverage Details</h3>
              

              {policy.vehicle_table?.length > 0 ? policy.vehicle_table.map(vehicle => (
                <div key={vehicle.id}>
                  <div className="vehicle-info">
                    <h4>Vehicle Information</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.5rem", fontSize: "0.875rem" }}>
                      <div><strong>Vehicle:</strong> {vehicle.vehicle_name}</div>
                      <div><strong>Color:</strong> {vehicle.vehicle_color}</div>
                      <div><strong>Year:</strong> {vehicle.vehicle_year}</div>
                      <div><strong>Plate Number:</strong> {vehicle.plate_num}</div>
                      <div style={{ gridColumn: "1 / -1" }}><strong>VIN:</strong> {vehicle.vin_num}</div>
                    </div>
                  </div>

                  {vehicle.calculation_Table ? (
                    <div className="coverage-tax">
                      <h4>Coverage & Tax Breakdown</h4>
                      <div className="grid-three">
                        <div>
                          <h5>Coverage Amounts</h5>
                          <div><span>Bodily Injury:</span> <span>{formatCurrency(vehicle.calculation_Table.bodily_Injury)}</span></div>
                          <div><span>Property Damage:</span> <span>{formatCurrency(vehicle.calculation_Table.property_Damage)}</span></div>
                          <div><span>Personal Accident:</span> <span>{formatCurrency(vehicle.calculation_Table.personal_Accident)}</span></div>
                          <div><span>Vehicle Type:</span> <span>{vehicle.calculation_Table.vehicle_type}</span></div>
                        </div>
                        <div>
                          <h5>Rates & Premiums</h5>
                          <div><span>Vehicle Rate:</span> <span>{(vehicle.calculation_Table.vehicle_Rate)}%</span></div>
                          <div><span>AON:</span> <span>{formatPercentage(vehicle.calculation_Table.aon)}</span></div>
                        </div>
                        <div>
                          <h5>Taxes & Fees</h5>
                          <div><span>VAT Tax:</span> <span>{(vehicle.calculation_Table.vat_Tax)}%</span></div>
                          <div><span>Documentary Stamp:</span> <span>{(vehicle.calculation_Table.docu_Stamp)}%</span></div>
                          <div><span>Local Gov Tax:</span> <span>{(vehicle.calculation_Table.local_Gov_Tax)}%</span></div>
                        </div>
                      </div>
                    </div>
                  ) : <div className="no-calculation">No calculation data found for this vehicle</div>}
                </div>
              )) : <div className="no-data">No vehicle data available</div>}
            </div>
          </div>
        ))}
      </div>

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