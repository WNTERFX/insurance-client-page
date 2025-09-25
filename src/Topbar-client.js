import { FaBell, FaSignOutAlt } from "react-icons/fa";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import "./styles/Topbar-client.css";


export default function Topbar_client() {
   const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleLogout = () => {
    console.log("Logging out...");
     navigate("/appinsurance/")
  };

  return (
    <header className="topbar">
      <div className="left-section">
        <Menu className="nav-bar-icon" size={30} color="white" />
        <div className="company-name">Silverstar Insurance Agency Inc.</div>
      </div>

      <div className="user-dropdown" ref={dropdownRef}>
        <div className="user-info">
          <FaBell />
          <span>User 1</span>
          <button
            className="dropdown-toggle"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            ▾
          </button>
        </div>

        {dropdownOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-item logout" onClick={handleLogout}>
              <FaSignOutAlt /> Log out
            </div>
          </div>
        )}
      </div>
    </header>
  );
}