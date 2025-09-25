import { FaBell, FaSignOutAlt } from "react-icons/fa";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import { logoutClient } from "./Actions/LoginActions";
import { getCurrentClient } from "./Actions/PolicyActions"; // Adjust import path
import "./styles/Topbar-client.css";

export default function Topbar_client() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  // Load current user data
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const client = await getCurrentClient();
        if (client) {
          setCurrentUser(client);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCurrentUser();
  }, []);

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
      navigate("/appinsurance/");
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

  return (
    <header className="topbar">
      <div className="left-section">
        <Menu className="nav-bar-icon" size={30} color="white" />
        <div className="company-name">Silverstar Insurance Agency Inc.</div>
      </div>
      <div className="user-dropdown" ref={dropdownRef}>
        <div className="user-info">
          <FaBell />
          <span>{displayName()}</span>
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