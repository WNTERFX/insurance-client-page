import { Home, FileText, Settings, Banknote, History, ClipboardCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import "./styles/Sidebar-client-styles.css";
import { useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container-client">
          <img className="header-logo-client" src={require("./images/logo_.png")} alt="Silverstar Logo" />
        </div>
        <div className="company-info">
          <h2 className="company-Name">Silverstar Insurance </h2>

        </div>
      </div>
      <nav className="sidebar-nav">
        <Link 
          to="/insurance-client-page/main-portal/Home" 
          className={`menu-item${isActive("/insurance-client-page/main-portal/Home") ? " active" : ""}`}
        >
          <Home className="menu-icon" />
          <span>Home</span>
        </Link>
        <Link 
          to="/insurance-client-page/main-portal/InsuranceDetails" 
          className={`menu-item${isActive("/insurance-client-page/main-portal/InsuranceDetails") ? " active" : ""}`}
        >
          <FileText className="menu-icon" />
          <span>Insurance Details</span>
        </Link>
        <Link 
          to="/insurance-client-page/main-portal/Balances"
          className={`menu-item${isActive("/insurance-client-page/main-portal/Balances") ? " active" : ""}`}
        >
          <Banknote className="menu-icon" />
          <span>Payments</span>
        </Link>
        <Link 
          to="/insurance-client-page/main-portal/History"
          className={`menu-item${isActive("/insurance-client-page/main-portal/History") ? " active" : ""}`}
        >
          <History className="menu-icon" />
          <span>Payment History</span>
        </Link>
        <Link 
          to="/insurance-client-page/main-portal/Claims"
          className={`menu-item${isActive("/insurance-client-page/main-portal/Claims") ? " active" : ""}`}
        >
          <ClipboardCheck className="menu-icon" />
          <span>Claims</span>
        </Link>
        <Link 
          to="/insurance-client-page/main-portal/Delivery"
          className={`menu-item${isActive("/insurance-client-page/main-portal/Delivery") ? " active" : ""}`}
        >
          <Truck className="menu-icon" />
          <span>Deliveries</span>
        </Link>
        <Link 
          to="/insurance-client-page/main-portal/AccountSettings"
          className={`menu-item menu-item-bottom${isActive("/insurance-client-page/main-portal/AccountSettings") ? " active" : ""}`}
        >
          <Settings className="menu-icon" />
          <span>Settings</span>
        </Link>
      </nav>
    </aside>
  );
}