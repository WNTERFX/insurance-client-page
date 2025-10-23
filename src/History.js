import { useState, useEffect } from "react";
import { fetchPaymentHistory } from "./Actions/HistoryActions"
import "./styles/History-styles.css";

export default function History() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    setLoading(true);
    const { data, error } = await fetchPaymentHistory();
    
    if (error) {
      setError(error);
      console.error("Error fetching payment history:", error);
    } else {
      setHistoryData(data);
    }
    
    setLoading(false);
  };

  const filteredData = historyData.filter((row) =>
    Object.values(row).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="history-container">
        <h2>History</h2>
        <div className="loading">Loading payment history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-container">
        <h2>History</h2>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h2>History</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by date, method, company, client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="results-count">
          {filteredData.length} {filteredData.length === 1 ? "Record" : "Records"}
        </span>
      </div>
      
      <div className="history-grid header">
        <div>Date</div>
        <div>Payment Method</div>
        <div>Amount</div>
        <div>Company</div>
        <div>Client</div>
      </div>
      
      {filteredData.length === 0 ? (
        <div className="no-results">
          {searchTerm ? "No matching records found" : "No payment history available"}
        </div>
      ) : (
        filteredData.map((row) => (
          <div className="history-grid" key={row.id}>
            <div>{row.date}</div>
            <div>{row.paymentMethod}</div>
            <div>
              {row.amount}
              {row.penalties > 0 && (
                <span className="penalty-badge">
                  Php {row.penalties.toLocaleString()} penalty
                </span>
              )}
            </div>
            <div>{row.company}</div>
            <div>{row.clientName}</div>
          </div>
        ))
      )}
    </div>
  );
}