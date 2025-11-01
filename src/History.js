import { useState, useEffect } from "react";
import { fetchPaymentHistory } from "./Actions/HistoryActions";
import "./styles/History-styles.css";

// --- NEW: Define your list of company partners ---
const companyPartners = [
  "Standard Insurance Co.",
  "The Mercantile Insurance Co.",
  "Stronghold Insurance Company Inc.",
  "Cocogen Insurance Co.",
  "Philippine British Assurance Company Inc.",
  "Alpha Insurance & Surety Co., Inc.",
  "Liberty Insurance Corp.",
];

export default function History() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- Filter states ---
  const [searchTerm, setSearchTerm] = useState("");
  // --- NEW: State for the company filter ---
  const [companyFilter, setCompanyFilter] = useState("All Companies");

  // --- Pagination states ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

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

  // --- UPDATED: Combined filtering logic ---
  const filteredData = historyData.filter((row) => {
    // Check 1: Does the row match the selected company?
    const matchesCompany = 
      companyFilter === "All Companies" || row.company === companyFilter;

    // Check 2: Does the row match the search term?
    const matchesSearch = Object.values(row).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Return true only if both conditions are met
    return matchesCompany && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  // --- NEW: Reset to page 1 when filters change for better UX ---
  const handleFilterChange = () => {
    setCurrentPage(1);
  };
  
  useEffect(() => {
    handleFilterChange();
  }, [searchTerm, companyFilter]);


  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  if (loading) {
    return (
      <div className="history-container">
        <h2>History</h2>
        <p>Track and manage all your payment transactions</p>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-container">
        <h2>History</h2>
        <p>Track and manage all your payment transactions</p>
        <div className="error">Error: {error}</div>
      </div>
    );
  }


  return (
    <div className="history-container">
      <h2>History</h2>
      <p>Track and manage all your payment transactions</p>

      <div className="controls">
        <span className="transaction-text">
          Payment Transactions ({filteredData.length})
        </span>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by date, method, company, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* --- UPDATED: New Company Partners Dropdown --- */}
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="company-filter" // Use a more descriptive class name
        >
          <option value="All Companies">All Company Partners</option>
          {companyPartners.map((companyName) => (
            <option key={companyName} value={companyName}>
              {companyName}
            </option>
          ))}
        </select>
      </div>

      <div className="history-table">
        <div className="history-grid header">
          <div>Date</div>
          <div>Payment Method</div>
          <div>Amount</div>
          <div>Company</div>
          <div>Client</div>
        </div>

        {currentItems.length > 0 ? (
          currentItems.map((row) => (
            <div className="history-grid" key={row.id}>
              <div>{row.date}</div>
              <div>{row.paymentMethod}</div>
              <div>
                Php {row.amount.toLocaleString()}
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
        ) : (
          <div className="no-results">No transactions found.</div>
        )}
      </div>

      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageClick(index + 1)}
            className={currentPage === index + 1 ? "active" : ""}
          >
            {index + 1}
          </button>
        ))}
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}