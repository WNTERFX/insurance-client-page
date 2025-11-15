import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPaymentHistory } from "./Actions/HistoryActions";
import { getCurrentClient } from "./Actions/PolicyActions";
import { logoutClient } from "./Actions/LoginActions";
import { fetchPartners } from "./Actions/PartnersActions";
import { fetchPaymentReceipts } from "./Actions/ReceiptActions";
import { FaBell, FaSignOutAlt, FaUserCircle, FaReceipt, FaTimes, FaDownload, FaFileAlt, FaChevronLeft, FaChevronRight, FaHistory } from "react-icons/fa";
import "./styles/History-styles.css";
import { useDeclarePageHeader } from "./PageHeaderProvider";

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
  const [itemsPerPage] = useState(10);

  // --- User dropdown states ---
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

    useDeclarePageHeader("Transaction History", "View and manage all your payment transactions");

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

  // Load receipt counts for all payments
  const loadReceiptCounts = async () => {
    try {
      const { data: payments } = await fetchPaymentHistory();
      if (payments && payments.length > 0) {
        const counts = {};
        for (const payment of payments) {
          try {
            const receipts = await fetchPaymentReceipts(payment.payment_id);
            counts[payment.payment_id] = receipts.length;
          } catch (error) {
            counts[payment.payment_id] = 0;
          }
        }
        setReceiptCounts(counts);
      }
    } catch (error) {
      console.error("Error loading receipt counts:", error);
    }
  };

  // Load receipts for a specific payment
  const loadReceipts = async (paymentId) => {
    setLoadingReceipts(true);
    setSelectedPaymentId(paymentId);
    setCurrentReceiptIndex(0);
    try {
      const receipts = await fetchPaymentReceipts(paymentId);
      setSelectedPaymentReceipts(receipts);
      setReceiptModalOpen(true);
    } catch (error) {
      console.error("Error loading receipts:", error);
      alert("Failed to load receipts. Please try again.");
    } finally {
      setLoadingReceipts(false);
    }
  };

  // Close receipt modal
  const closeReceiptModal = () => {
    setReceiptModalOpen(false);
    setSelectedPaymentReceipts([]);
    setSelectedPaymentId(null);
    setCurrentReceiptIndex(0);
  };

  // Navigate between receipts
  const handleNextReceipt = () => {
    if (currentReceiptIndex < selectedPaymentReceipts.length - 1) {
      setCurrentReceiptIndex(currentReceiptIndex + 1);
    }
  };

  const handlePrevReceipt = () => {
    if (currentReceiptIndex > 0) {
      setCurrentReceiptIndex(currentReceiptIndex - 1);
    }
  };

  // Handle receipt download
  const handleDownloadReceipt = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Check if file is an image
  const isImageFile = (fileType) => {
    return fileType && (
      fileType.includes('image') || 
      fileType.includes('jpg') || 
      fileType.includes('jpeg') || 
      fileType.includes('png') || 
      fileType.includes('gif') || 
      fileType.includes('webp')
    );
  };

  // Check if file is a PDF
  const isPDFFile = (fileType) => {
    return fileType && fileType.includes('pdf');
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
      {/* Header matching Home component style */}

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
                All Transactions ({filteredData.length})
              </span>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search by reference, date, method, company..."
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

            {/* Single Table for All Transactions */}
            <div className="history-table">
              <div className="history-grid header">
                <div>Date</div>
                <div>Payment Method</div>
                <div>Amount</div>
                <div>Company</div>
                <div>Reference #</div>
                <div>Receipt</div>
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
                    <div className="reference-cell">{row.referenceNumber}</div>
                    <div>
                      {receiptCounts[row.payment_id] > 0 ? (
                        <button
                          className="receipt-view-btn"
                          onClick={() => loadReceipts(row.payment_id)}
                          disabled={loadingReceipts && selectedPaymentId === row.payment_id}
                        >
                          <FaReceipt className="receipt-icon" />
                          {loadingReceipts && selectedPaymentId === row.payment_id ? 'Loading...' : `View (${receiptCounts[row.payment_id]})`}
                        </button>
                      ) : (
                        <span className="no-receipt-badge">No Receipt</span>
                      )}
                    </div>
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

      {/* Receipt Modal */}
      {receiptModalOpen && selectedPaymentReceipts.length > 0 && (
        <div className="receipt-modal-overlay" onClick={closeReceiptModal}>
          <div className="receipt-modal-content receipt-viewer" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-modal-header">
              <div className="receipt-header-info">
                <h2>Payment Receipt</h2>
                {selectedPaymentReceipts.length > 1 && (
                  <span className="receipt-counter">
                    {currentReceiptIndex + 1} of {selectedPaymentReceipts.length}
                  </span>
                )}
              </div>
              <div className="receipt-header-actions">
                <button
                  className="receipt-download-btn-header"
                  onClick={() => handleDownloadReceipt(
                    selectedPaymentReceipts[currentReceiptIndex].file_url,
                    selectedPaymentReceipts[currentReceiptIndex].file_name
                  )}
                  title="Download"
                >
                  <FaDownload />
                </button>
                <button className="receipt-modal-close" onClick={closeReceiptModal}>
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <div className="receipt-modal-body receipt-viewer-body">
              {/* Navigation arrows for multiple receipts */}
              {selectedPaymentReceipts.length > 1 && (
                <>
                  <button
                    className="receipt-nav-btn receipt-nav-prev"
                    onClick={handlePrevReceipt}
                    disabled={currentReceiptIndex === 0}
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    className="receipt-nav-btn receipt-nav-next"
                    onClick={handleNextReceipt}
                    disabled={currentReceiptIndex === selectedPaymentReceipts.length - 1}
                  >
                    <FaChevronRight />
                  </button>
                </>
              )}

              {/* File viewer */}
              <div className="receipt-file-viewer">
                {isPDFFile(selectedPaymentReceipts[currentReceiptIndex].file_type) ? (
                  <iframe
                    src={selectedPaymentReceipts[currentReceiptIndex].file_url}
                    className="receipt-pdf-viewer"
                    title="Receipt PDF"
                  />
                ) : isImageFile(selectedPaymentReceipts[currentReceiptIndex].file_type) ? (
                  <img
                    src={selectedPaymentReceipts[currentReceiptIndex].file_url}
                    alt={selectedPaymentReceipts[currentReceiptIndex].file_name}
                    className="receipt-image-viewer"
                  />
                ) : (
                  <div className="receipt-unsupported">
                    <FaFileAlt className="unsupported-icon" />
                    <p>Preview not available for this file type</p>
                    <p className="file-type-text">{selectedPaymentReceipts[currentReceiptIndex].file_type}</p>
                    <a
                      href={selectedPaymentReceipts[currentReceiptIndex].file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="receipt-view-external-link"
                    >
                      Open in New Tab
                    </a>
                  </div>
                )}
              </div>

              {/* File info */}
              <div className="receipt-file-info">
                <p className="receipt-filename-display">
                  {selectedPaymentReceipts[currentReceiptIndex].file_name}
                </p>
                <p className="receipt-metadata-display">
                  {selectedPaymentReceipts[currentReceiptIndex].file_type} • 
                  {(selectedPaymentReceipts[currentReceiptIndex].file_size / 1024).toFixed(2)} KB • 
                  Uploaded {new Date(selectedPaymentReceipts[currentReceiptIndex].created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}