import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const navigate = useNavigate();

  // =========================
  // SAVED PROFILE SETTINGS
  // =========================

  const getSavedSettings = () => {
    const savedSettings = localStorage.getItem("settings");

    if (!savedSettings) {
      return {
        name: "Administrator",
        role: "Risk Manager",
      };
    }

    try {
      return JSON.parse(savedSettings);
    } catch {
      return {
        name: "Administrator",
        role: "Risk Manager",
      };
    }
  };

  const [userName, setUserName] = useState(() => {
    const settings = getSavedSettings();
    return settings.name || "Administrator";
  });

  const [userRole, setUserRole] = useState(() => {
    const settings = getSavedSettings();
    return settings.role || "Risk Manager";
  });

  // =========================
  // UPDATE PROFILE
  // =========================

  useEffect(() => {
    const updateProfile = () => {
      const settings = getSavedSettings();

      setUserName(settings.name || "Administrator");
      setUserRole(settings.role || "Risk Manager");
    };

    window.addEventListener("settingsUpdated", updateProfile);

    return () => {
      window.removeEventListener("settingsUpdated", updateProfile);
    };
  }, []);

  // =========================
  // NOTIFICATIONS
  // =========================

  const handleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowProfile(false);
  };

  // =========================
  // PROFILE
  // =========================

  const handleProfile = () => {
    setShowProfile(!showProfile);
    setShowNotifications(false);
  };

  // =========================
  // VIEW ALL ALERTS
  // =========================

  const handleViewAlerts = () => {
    setShowNotifications(false);
    navigate("/alerts");
  };

  // =========================
  // ACCOUNT SETTINGS
  // =========================

  const handleAccountSettings = () => {
    setShowProfile(false);
    navigate("/settings");
  };

  // =========================
  // SYSTEM INFORMATION
  // =========================

  const handleSystemInfo = () => {
    setShowProfile(false);

    alert(
      "AcquiVision v1.0\n\nSystem Status: Online\nMonitoring: Active"
    );
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    setShowProfile(false);
    navigate("/");
  };

  return (
    <header className="navbar">

      {/* =========================
          LEFT SIDE
      ========================= */}

      <div className="navbar-left">

        <div className="navbar-title">

          <h2>
            Land Acquisition Risk Monitor
          </h2>

          <p>
            Predicting tomorrow's delays today.
          </p>

        </div>

      </div>

      {/* =========================
          RIGHT SIDE
      ========================= */}

      <div className="navbar-right">

        {/* =========================
            SYSTEM STATUS
        ========================= */}

        <div className="navbar-status">

          <span className="status-dot"></span>

          <span>
            System Online
          </span>

        </div>

        {/* =========================
            NOTIFICATIONS
        ========================= */}

        <div className="notification-wrapper">

          <button
            className="notification"
            onClick={handleNotifications}
            aria-label="Notifications"
          >

            <span className="notification-icon">
              🔔
            </span>

            <span className="notification-badge">
              5
            </span>

          </button>

          {/* =========================
              NOTIFICATION PANEL
          ========================= */}

          {showNotifications && (

            <div className="notification-panel">

              {/* HEADER */}

              <div className="notification-header">

                <div>

                  <h3>
                    Notifications
                  </h3>

                  <span>
                    5 active alerts
                  </span>

                </div>

                <button
                  className="notification-close"
                  onClick={() =>
                    setShowNotifications(false)
                  }
                  aria-label="Close notifications"
                >
                  ×
                </button>

              </div>

              {/* =========================
                  NOTIFICATION LIST
              ========================= */}

              <div className="notification-list">

                {/* CRITICAL ALERT */}

                <div className="notification-item critical">

                  <span className="notification-dot"></span>

                  <div>

                    <strong>
                      Critical Risk
                    </strong>

                    <p>
                      NH-48 Highway Expansion
                    </p>

                    <small>
                      Risk score: 86%
                    </small>

                  </div>

                </div>

                {/* HIGH ALERT */}

                <div className="notification-item high">

                  <span className="notification-dot"></span>

                  <div>

                    <strong>
                      High Risk
                    </strong>

                    <p>
                      Western Railway Corridor
                    </p>

                    <small>
                      Risk score: 72%
                    </small>

                  </div>

                </div>

                {/* HIGH ALERT */}

                <div className="notification-item high">

                  <span className="notification-dot"></span>

                  <div>

                    <strong>
                      High Risk
                    </strong>

                    <p>
                      Chennai Outer Ring Road
                    </p>

                    <small>
                      Risk score: 64%
                    </small>

                  </div>

                </div>

                {/* MEDIUM ALERT */}

                <div className="notification-item medium">

                  <span className="notification-dot"></span>

                  <div>

                    <strong>
                      Medium Risk
                    </strong>

                    <p>
                      Delhi Freight Corridor
                    </p>

                    <small>
                      Risk score: 48%
                    </small>

                  </div>

                </div>

                {/* MEDIUM ALERT */}

                <div className="notification-item medium">

                  <span className="notification-dot"></span>

                  <div>

                    <strong>
                      Medium Risk
                    </strong>

                    <p>
                      Nagpur Metro Extension
                    </p>

                    <small>
                      Risk score: 58%
                    </small>

                  </div>

                </div>

              </div>

              {/* =========================
                  VIEW ALL ALERTS
              ========================= */}

              <button
                className="view-all-notifications"
                onClick={handleViewAlerts}
              >
                View All Alerts →
              </button>

            </div>

          )}

        </div>

        {/* =========================
            USER PROFILE
        ========================= */}

        <div className="profile-wrapper">

          <button
            className="user-profile"
            onClick={handleProfile}
            aria-label="User profile"
          >

            <div className="user-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">

              <strong>
                {userName}
              </strong>

              <span>
                {userRole}
              </span>

            </div>

            <span
              className={`user-arrow ${
                showProfile ? "open" : ""
              }`}
            >
              ▾
            </span>

          </button>

          {/* =========================
              PROFILE DROPDOWN
          ========================= */}

          {showProfile && (

            <div className="profile-dropdown">

              {/* PROFILE HEADER */}

              <div className="profile-dropdown-header">

                <div className="profile-large-avatar">
                  {userName.charAt(0).toUpperCase()}
                </div>

                <div>

                  <strong>
                    {userName}
                  </strong>

                  <span>
                    {userRole}
                  </span>

                </div>

              </div>

              <div className="profile-divider"></div>

              {/* =========================
                  ACCOUNT SETTINGS
              ========================= */}

              <button
                className="profile-menu-item"
                onClick={handleAccountSettings}
              >

                <span className="profile-menu-icon">
                  ⚙️
                </span>

                <div>

                  <strong>
                    Account Settings
                  </strong>

                  <small>
                    Manage your account
                  </small>

                </div>

              </button>

              {/* =========================
                  SYSTEM INFORMATION
              ========================= */}

              <button
                className="profile-menu-item"
                onClick={handleSystemInfo}
              >

                <span className="profile-menu-icon">
                  ℹ️
                </span>

                <div>

                  <strong>
                    System Information
                  </strong>

                  <small>
                    AcquiVision v1.0
                  </small>

                </div>

              </button>

              <div className="profile-divider"></div>

              {/* =========================
                  LOGOUT
              ========================= */}

              <button
                className="profile-menu-item logout"
                onClick={handleLogout}
              >

                <span className="profile-menu-icon">
                  🚪
                </span>

                <div>

                  <strong>
                    Logout
                  </strong>

                  <small>
                    Return to dashboard
                  </small>

                </div>

              </button>

            </div>

          )}

        </div>

      </div>

    </header>
  );
}

export default Navbar;