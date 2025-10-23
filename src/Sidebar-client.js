import {FaHome,FaRegFileAlt, FaCog, FaCalendarAlt,FaMoneyBill,FaHistory,FaWallet,FaClipboardCheck,FaFileInvoiceDollar,FaCreditCard,FaTruck } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./styles/Sidebar-client-styles.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <Link to="/insurance-client-page/main-portal/Home" className="menu-item">
        <FaHome className="menu-icon" />
        <span>Home</span>
      </Link>

      <Link to="/insurance-client-page/main-portal/InsuranceDetails" className="menu-item">
        <FaRegFileAlt className="menu-icon" />
        <span>Insurance Details</span>
      </Link>

       <Link to="/insurance-client-page/main-portal/Balances"className="menu-item">
        <FaMoneyBill className="menu-icon" />
        <span>Payments</span>
      </Link>
      <Link to="/insurance-client-page/main-portal/History"className="menu-item">
        <FaHistory className="menu-icon" />
        <span>Payment History</span>
      </Link>
    
      <Link to="/insurance-client-page/main-portal/Claims"className="menu-item">
        <FaClipboardCheck className="menu-icon" />
        <span>Claims</span>
      </Link>
      
      <Link to="/insurance-client-page/main-portal/Delivery"className="menu-item">
        <FaTruck  className="menu-icon" />
        <span>Deliveries</span>
      </Link>

         <Link to="/insurance-client-page/main-portal/Quotation"className="menu-item">
        <FaFileInvoiceDollar className="menu-icon" />
        <span>Quotation</span>
      </Link>

       <Link to="/insurance-client-page/main-portal/AccountSettings"className="menu-item menu-item-bottom">
        <FaCog className="menu-icon" />
        <span>Settings</span>
      </Link>

      
    </aside>
  );
}