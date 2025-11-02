import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPaymentHistory } from "./Actions/HistoryActions";
import { getCurrentClient } from "./Actions/PolicyActions";
import { logoutClient } from "./Actions/LoginActions";
import { fetchPartners } from "./Actions/PartnersActions";
import { FaBell, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import "./styles/History-styles.css";

export default function History() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- Filter states ---
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All Companies");
  const [companyPartners, setCompanyPartners] = useState([]);

  // --- Pagination states ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // --- User dropdown states ---
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadPaymentHistory();
    loadCurrentUser();
    loadPartners();
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

  // Load current user data
  const loadCurrentUser = async () => {
    try {
      const client = await getCurrentClient();
      if (client) {
        setCurrentUser(client);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  // Load partners from Supabase
  const loadPartners = async () => {
    try {
      const partners = await fetchPartners();
      setCompanyPartners(partners);
    } catch (error) {
      console.error("Error loading partners:", error);
    }
  };

  // Handle click outside dropdown
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
    if (loading) return "Loading...";
    if (!currentUser) return "User";

    const prefix = currentUser.prefix || "";
    const firstName = currentUser.first_Name || "";
    const lastName = currentUser.last_Name || "";

    // Combine name parts
    if (prefix && firstName) {
      return `${prefix} ${firstName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else {
      return "User";
    }
  };

  // --- Combined filtering logic ---
  const filteredData = historyData.filter((row) => {
    const matchesCompany = 
      companyFilter === "All Companies" || row.company === companyFilter;

    const matchesSearch = Object.values(row).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    return matchesCompany && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  // --- Reset to page 1 when filters change ---
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

  return (
    <div className="dashboard-containerHistory">
      {/* Header with Profile and Notification */}
      <header className="topbar-client">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">History</h1>
            <p className="page-subtitle">Track and manage all your payment transactions</p>
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

      {/* Content Area */}
      <div className="history-content">
        {/* Loading Spinner */}
        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner"></div>
            <p>Loading payment history...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>Error: {error}</p>
          </div>
        ) : (
          <>
            {/* Controls */}
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

              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="company-filter"
              >
                <option value="All Companies">All Company Partners</option>
                {companyPartners.map((partner) => (
                  <option key={partner.id} value={partner.insurance_Name}>
                    {partner.insurance_Name}
                  </option>
                ))}
              </select>
            </div>

            {/* Table */}
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

            {/* Pagination */}
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
          </>
        )}
      </div>
    </div>
  );
}