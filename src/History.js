import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPaymentHistory } from "./Actions/HistoryActions";
import { getCurrentClient } from "./Actions/PolicyActions";
import { logoutClient } from "./Actions/LoginActions";
import { fetchPartners } from "./Actions/PartnersActions";
import { fetchPaymentReceipts } from "./Actions/ReceiptActions";
import { FaBell, FaSignOutAlt, FaUserCircle, FaReceipt, FaTimes, FaDownload, FaFileAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./styles/History-styles.css";

export default function History() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All Companies");
  const [companyPartners, setCompanyPartners] = useState([]);

  // User dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const dropdownRef = useRef(null);

  // --- Receipt modal states ---
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedPaymentReceipts, setSelectedPaymentReceipts] = useState([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [currentReceiptIndex, setCurrentReceiptIndex] = useState(0);
  const [receiptCounts, setReceiptCounts] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    loadPaymentHistory();
    loadCurrentUser();
    loadPartners();
    loadReceiptCounts();
  }, []);

  const loadPaymentHistory = async () => {
    setLoading(true);
    const { data, error } = await fetchPaymentHistory();
    if (error) {
      setError(error);
      console.error("Error fetching payment history:", error);
    } else {
      setHistoryData(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  };

  const loadCurrentUser = async () => {
    try {
      const client = await getCurrentClient();
      if (client) setCurrentUser(client);
    } catch (err) {
      console.error("Error loading user:", err);
    }
  };

  const loadPartners = async () => {
    try {
      const partners = await fetchPartners();
      setCompanyPartners(Array.isArray(partners) ? partners : []);
    } catch (err) {
      console.error("Error loading partners:", err);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const result = await logoutClient();
    if (result.success) {
      navigate("/insurance-client-page/");
    } else {
      console.error("Failed to log out:", result.error);
      alert("Logout failed. Please try again.");
    }
  };

  const displayName = () => {
    if (loading) return "Loading...";
    if (!currentUser) return "User";
    const prefix = currentUser.prefix || "";
    const firstName = currentUser.first_Name || "";
    const lastName = currentUser.last_Name || "";
    if (prefix && firstName) return `${prefix} ${firstName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    return "User";
  };

  // ---------- Helpers: amounts ----------
  // Parse/format amounts safely (handles "Php 908.5", "908.5", 908.5, "1,234.56")
  const toNumber = (v) => {
    if (v == null) return 0;
    if (typeof v === "number" && isFinite(v)) return v;
    if (typeof v === "string") {
      const num = Number(v.replace(/[^0-9.\-]/g, ""));
      return isFinite(num) ? num : 0;
    }
    return 0;
  };

  const toPeso = (v) =>
    `Php ${toNumber(v).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const getPaymentMethod = (row) => row?.paymentMethod || row?.method || "—";

  // ---------- LIFO sorting (latest first) ----------
  // Sort by rawDate (ISO from backend), fallback to display date/created_at
  const lifoSorted = useMemo(() => {
    return [...historyData].sort((a, b) => {
      const da = new Date(a?.rawDate || a?.date || a?.created_at || 0).getTime();
      const db = new Date(b?.rawDate || b?.date || b?.created_at || 0).getTime();
      return db - da;
    });
  }, [historyData]);

  // ---------- Combined filtering ----------
  const filteredData = lifoSorted.filter((row) => {
    const matchesCompany =
      companyFilter === "All Companies" || row.company === companyFilter;

    const matchesSearch = Object.values(row || {}).some((value) =>
      String(value ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return matchesCompany && matchesSearch;
  });

  // Show ALL items (no pagination)
  const currentItems = filteredData;

  return (
    <div className="dashboard-containerHistory">
      {/* Header */}
      <header className="topbar-client">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">Transaction History</h1>
            <p className="page-subtitle">
              Track and manage all your payment transactions
            </p>
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
                  <button
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="dropdown-icon" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="history-content">
        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner"></div>
            <p>Loading payment history...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>Error: {String(error)}</p>
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
                  placeholder="Search by date, method, company, ref no..."
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

            {/* Table (ALL rows shown) */}
            <div className="history-table">
              <div className="history-grid header">
                <div>Date</div>
                <div>Payment Method</div>
                <div>Amount</div>
                <div>Company</div>
                <div>Reference Number</div>
              </div>

              {currentItems.length > 0 ? (
                currentItems.map((row) => (
                  <div
                    className="history-grid"
                    key={row.id ?? `${row.rawDate}-${row.referenceNumber}`}
                  >
                    <div>{row?.date || "—"}</div>
                    <div>{getPaymentMethod(row)}</div>
                    <div>
                      {toPeso(row?.amount)}
                      {toNumber(row?.penalties) > 0 && (
                        <span className="penalty-badge">
                          {toPeso(row.penalties)} penalty
                        </span>
                      )}
                    </div>
                    <div>{row?.company || "—"}</div>
                    <div>{row?.referenceNumber || "—"}</div>
                  </div>
                ))
              ) : (
                <div className="no-results">No transactions found.</div>
              )}
            </div>
            {/* No pagination — showing all rows */}
          </>
        )}
      </div>
    </div>
  );
}
