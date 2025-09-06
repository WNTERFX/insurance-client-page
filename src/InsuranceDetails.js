import { useEffect, useState } from "react";
import { fetchPoliciesWithComputation } from "./Actions/PolicyActions";

export default function InsuranceDetails() {
  const [details, setDetails] = useState([]);

  useEffect(() => {
    fetchPoliciesWithComputation().then(setDetails);
  }, []);

  if (details.length === 0) {
    return <div>Loading insurance details...</div>;
  }

  return (
    <div className="InsuranceDetails-container">
      <h2>Insurance Details</h2>
      {details.map((policy) => (
        <div key={policy.id} className="insurance-card">
          <h3>{policy.policy_type}</h3>
          <p>Partner: {policy.insurance_Partners?.name || "Unknown Partner"}</p>
          <p>Inception: {policy.policy_inception}</p>
          <p>Expiry: {policy.policy_expirty}</p>
          <p>Status: {policy.policy_is_active ? "Active ✅" : "Inactive ❌"}</p>

          <h4>Computation Info</h4>
          {policy.policy_Computation_Table?.map((comp, i) => (
            <div key={i}>
              <p>Original Value: ₱{comp.original_Value}</p>
              <p>Current Value: ₱{comp.current_Value}</p>
              <p>Total Premium: ₱{comp.total_Premium}</p>
              <p>AoN Cost: ₱{comp.aon_Cost}</p>
              <p>Vehicle Rate: {comp.vehicle_Rate_Value}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
