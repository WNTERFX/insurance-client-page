// Topbar-client.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBell, FaSignOutAlt, FaUserCircle, FaUser } from "react-icons/fa";
import { getCurrentClient } from "./Actions/PolicyActions";
import { logoutClient } from "./Actions/LoginActions";

// ⛳ IMPORTANT: make sure this path matches your file.
// If your file is 'PageHeaderContext.jsx', import from "./PageHeaderContext".
import { usePageHeader } from "./PageHeaderProvider";

import "./styles/Topbar-client.css";

export default function TopbarClient() {
  const location = useLocation();
  const navigate = useNavigate();

  // ---- Dynamic page header (title/subtitle) ----
  // If the page didn't set a header yet, we derive a friendly fallback from the path.
  const header = usePageHeader();
  const derivedTitle = useMemo(() => {
    const seg = location.pathname.split("/").filter(Boolean).pop() || "";
    if (!seg) return "";
    // prettify last segment (e.g., "InsuranceDetails" -> "Insurance Details")
    return seg
      .replace(/-/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }, [location.pathname]);

  const title = header?.title || derivedTitle;
  const subtitle = header?.subtitle || "";

  // ---- Account dropdown state ----
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  // Close dropdown on route change
  useEffect(() => setDropdownOpen(false), [location.pathname]);

  // Load current user once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const client = await getCurrentClient();
        if (mounted) setCurrentUser(client || null);
      } catch (e) {
        console.error("Error loading user:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Click-outside & Esc to close
  useEffect(() => {
    const onDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setDropdownOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const res = await logoutClient();
      if (res?.success) {
        navigate("/", { replace: true });
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch {
      alert("Logout failed. Please try again.");
    }
  };

  const displayName = useMemo(() => {
    if (loading) return "Loading...";
    if (!currentUser) return "User";
    const { prefix = "", first_Name = "", last_Name = "" } = currentUser;
    return prefix && first_Name ? `${prefix} ${first_Name}` : first_Name || last_Name || "User";
  }, [loading, currentUser]);

  return (
    <header className="topbar-client">
      <div className="header-content">
        <div className="header-left">
          {title ? <h1 className="page-title">{title}</h1> : null}
          {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
        </div>

        <div className="header-right">
          <button className="notification-btn" aria-label="Notifications">
            <FaBell className="notification-icon" />
          </button>

          <div className="user-dropdown" ref={dropdownRef}>
            <button
              className="user-dropdown-toggle"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
            >
              <span className="user-name">{displayName}</span>
              <FaUserCircle className="user-avatar-icon" />
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu" role="menu">
                <Link
                  to="/insurance-client-page/main-portal/Profile"
                  className="dropdown-item"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                >
                  <FaUser className="dropdown-icon" />
                  <span>View Profile</span>
                </Link>
                <button
                  className="dropdown-item logout-item"
                  role="menuitem"
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
  );
}
