import { useEffect, useState } from "react";
import { getCurrentClient, fetchPoliciesWithComputation } from "./Actions/PolicyActions";

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

        // Get current user
        const user = await getCurrentClient();
        setCurrentUser(user);

        // Get policies with computation
        const policies = await fetchPoliciesWithComputation();
        setDetails(policies || []);

      } catch (err) {
        console.error("Error loading insurance data:", err);
        setError(err.message || "Failed to load insurance details");
      } finally {
        setLoading(false);
      }
    };

    loadInsuranceData();
  }, []);

  const formatCurrency = (amount) => {
    return `₱${(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="InsuranceDetails-container" style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "1.2rem", color: "#6b7280" }}>
          Loading insurance details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="InsuranceDetails-container" style={{ padding: "2rem" }}>
        <div style={{ 
          backgroundColor: "#fef2f2", 
          border: "1px solid #fecaca", 
          borderRadius: "8px", 
          padding: "1rem",
          color: "#dc2626"
        }}>
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (details.length === 0) {
    return (
      <div className="InsuranceDetails-container" style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ 
          backgroundColor: "#f0f9ff", 
          border: "2px dashed #0ea5e9", 
          borderRadius: "8px", 
          padding: "3rem",
          color: "#0c4a6e"
        }}>
          <h3 style={{ margin: "0 0 1rem 0" }}>No Insurance Policies Found</h3>
          <p style={{ margin: 0, fontSize: "1.1rem" }}>
            You don't have any insurance policies yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="InsuranceDetails-container" style={{ padding: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: "0 0 0.5rem 0", color: "#1f2937", fontSize: "2rem" }}>
          Insurance Details
        </h1>
        {currentUser && (
          <p style={{ margin: 0, color: "#6b7280", fontSize: "1.1rem" }}>
            Welcome back, {currentUser.email}
          </p>
        )}
      </div>

      {/* Policies Grid */}
      <div style={{ display: "grid", gap: "1.5rem" }}>
        {details.map((policy) => (
          <div
            key={policy.id}
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "2rem",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Policy Header */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "1.5rem",
              paddingBottom: "1rem",
              borderBottom: "2px solid #e5e7eb"
            }}>
              <div>
                <h2 style={{ margin: "0 0 0.5rem 0", color: "#1f2937", fontSize: "1.5rem" }}>
                  {policy.policy_type || 'Insurance Policy'}
                </h2>
                <p style={{ margin: 0, color: "#6b7280" }}>
                  Policy ID: {policy.id}
                </p>
              </div>
              <div>
                <span
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "20px",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: policy.policy_is_active ? "#065f46" : "#991b1b",
                    backgroundColor: policy.policy_is_active ? "#d1fae5" : "#fee2e2",
                  }}
                >
                  {policy.policy_is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Policy Details */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
              {/* Left Column - Policy Info */}
              <div>
                <h3 style={{ margin: "0 0 1rem 0", color: "#374151", fontSize: "1.2rem" }}>
                  Policy Information
                </h3>
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>Inception Date:</strong>
                    <span>{formatDate(policy.policy_inception)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>Expiry Date:</strong>
                    <span>{formatDate(policy.policy_expirty)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>Created:</strong>
                    <span>{formatDate(policy.created_at)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>Client ID:</strong>
                    <span>{policy.client_id}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>Partner ID:</strong>
                    <span>{policy.partner_id || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Computation Details */}
              <div>
                <h3 style={{ margin: "0 0 1rem 0", color: "#374151", fontSize: "1.2rem" }}>
                  Policy Computation
                </h3>
                {policy.policy_Computation_Table && policy.policy_Computation_Table.length > 0 ? (
                  policy.policy_Computation_Table.map((computation, index) => (
                    <div
                      key={computation.id}
                      style={{
                        backgroundColor: "#fef3c7",
                        border: "1px solid #f59e0b",
                        borderRadius: "8px",
                        padding: "1rem",
                        marginBottom: index < policy.policy_Computation_Table.length - 1 ? "1rem" : "0"
                      }}
                    >
                      <div style={{ display: "grid", gap: "0.5rem", fontSize: "0.875rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <strong>Original Value:</strong>
                          <span>{formatCurrency(computation.original_Value)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <strong>Current Value:</strong>
                          <span>{formatCurrency(computation.current_Value)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <strong>AON Cost:</strong>
                          <span>{formatCurrency(computation.aon_Cost)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <strong>Vehicle Rate:</strong>
                          <span>{formatCurrency(computation.vehicle_Rate_Value)}</span>
                        </div>
                        <hr style={{ margin: "0.5rem 0", border: "none", borderTop: "1px solid #f59e0b" }} />
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <strong style={{ color: "#92400e" }}>Total Premium:</strong>
                          <span style={{ fontWeight: "700", color: "#059669" }}>
                            {formatCurrency(computation.total_Premium)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    backgroundColor: "#f3f4f6",
                    border: "2px dashed #d1d5db",
                    borderRadius: "8px",
                    padding: "2rem",
                    textAlign: "center",
                    color: "#6b7280",
                    fontStyle: "italic"
                  }}>
                    No computation data available
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{
        marginTop: "2rem",
        backgroundColor: "#f0f9ff",
        border: "1px solid #0ea5e9",
        borderRadius: "8px",
        padding: "1.5rem"
      }}>
        <h3 style={{ margin: "0 0 1rem 0", color: "#0c4a6e" }}>Summary</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#1f2937" }}>
              {details.length}
            </div>
            <div style={{ color: "#6b7280" }}>Total Policies</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#059669" }}>
              {details.filter(p => p.policy_is_active).length}
            </div>
            <div style={{ color: "#6b7280" }}>Active Policies</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#dc2626" }}>
              {details.filter(p => !p.policy_is_active).length}
            </div>
            <div style={{ color: "#6b7280" }}>Inactive Policies</div>
          </div>
        </div>
      </div>
    </div>
  );
}