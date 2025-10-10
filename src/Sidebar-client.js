import {FaHome,FaRegFileAlt,FaCalendarAlt,FaMoneyBill,FaHistory,FaWallet,FaClipboardCheck,FaFileInvoiceDollar,FaCreditCard,FaTruck } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./styles/Sidebar-client-styles.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <Link to="/insurance-client-page/login/MainArea/Home" className="menu-item">
        <FaHome className="menu-icon" />
        <span>Home</span>
      </Link>

      <Link to="/insurance-client-page/login/MainArea/InsuranceDetails" className="menu-item">
        <FaRegFileAlt className="menu-icon" />
        <span>Insurance Details</span>
      </Link>

       <Link to="/insurance-client-page/login/MainArea/Balances"className="menu-item">
        <FaMoneyBill className="menu-icon" />
        <span>Balances</span>
      </Link>
      <Link to="/insurance-client-page/login/MainArea/history"className="menu-item">
        <FaHistory className="menu-icon" />
        <span>History</span>
      </Link>
    
      <Link to="/insurance-client-page/login/MainArea/Claims"className="menu-item">
        <FaClipboardCheck className="menu-icon" />
        <span>Claims</span>
      </Link>
      
      <Link to="/insurance-client-page/login/MainArea/Delivery"className="menu-item">
        <FaTruck  className="menu-icon" />
        <span>Deliveries</span>
      </Link>

         <Link to="/insurance-client-page/login/MainArea/Quotation"className="menu-item">
        <FaFileInvoiceDollar className="menu-icon" />
        <span>Quotation</span>
      </Link>
         <Link to="/insurance-client-page/login/MainArea/Payment"className="menu-item">
        <FaCreditCard className="menu-icon" />
        <span>Payment</span>
      </Link>
    </aside>
  );
}