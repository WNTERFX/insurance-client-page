import {FaHome,FaRegFileAlt,FaCalendarAlt,FaMoneyBill,FaHistory,FaWallet,FaClipboardCheck,FaFileInvoiceDollar,FaCreditCard,} from "react-icons/fa";
import { Link } from "react-router-dom";
import "./styles/Sidebar-client-styles.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <Link to="/appinsurance/login/MainArea/Home" className="menu-item">
        <FaHome className="menu-icon" />
        <span>Home</span>
      </Link>

      <Link to="/appinsurance/login/MainArea/InsuranceDetails" className="menu-item">
        <FaRegFileAlt className="menu-icon" />
        <span>Insurance Details</span>
      </Link>

      <Link to="/appinsurance/login/MainArea/DueDates"className="menu-item">
        <FaCalendarAlt className="menu-icon" />
        <span>Due Dates</span>
      </Link>
       <Link to="/appinsurance/login/MainArea/Balances"className="menu-item">
        <FaMoneyBill className="menu-icon" />
        <span>Balances</span>
      </Link>
      <Link to="/appinsurance/login/MainArea/history"className="menu-item">
        <FaHistory className="menu-icon" />
        <span>History</span>
      </Link>
     <Link to="/appinsurance/login/MainArea/PendingPayments"className="menu-item">
        <FaWallet className="menu-icon" />
        <span>Pending Payments</span>
      </Link>
      <Link to="/appinsurance/login/MainArea/Claims"className="menu-item">
        <FaClipboardCheck className="menu-icon" />
        <span>Claims</span>
      </Link>
         <Link to="/appinsurance/login/MainArea/Quotation"className="menu-item">
        <FaFileInvoiceDollar className="menu-icon" />
        <span>Quotation</span>
      </Link>
         <Link to="/appinsurance/login/MainArea/Payment"className="menu-item">
        <FaCreditCard className="menu-icon" />
        <span>Payment</span>
      </Link>
    </aside>
  );
}