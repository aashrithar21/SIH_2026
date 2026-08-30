import { useState } from "react";

import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

function Settings() {
  // =========================
  // DEFAULT SETTINGS
  // =========================

  const defaultSettings = {
    name: "Administrator",
    role: "Risk Manager",
    notifications: true,
    emailAlerts: true,
    riskAlerts: true,
  };

  // =========================
  // PROFILE SETTINGS
  // =========================

  const [name, setName] = useState(() => {
    try {
      const settings = JSON.parse(localStorage.getItem("settings"));
      return settings?.name || defaultSettings.name;
    } catch {
      return defaultSettings.name;
    }
  });

  const [role, setRole] = useState(() => {
    try {
      const settings = JSON.parse(localStorage.getItem("settings"));
      return settings?.role || defaultSettings.role;
    } catch {
      return defaultSettings.role;
    }
  });

  // =========================
  // NOTIFICATION SETTINGS
  // =========================

  const [notifications, setNotifications] = useState(() => {
    try {
      const settings = JSON.parse(localStorage.getItem("settings"));
      return settings?.notifications ?? defaultSettings.notifications;
    } catch {
      return defaultSettings.notifications;
    }
  });

  const [emailAlerts, setEmailAlerts] = useState(() => {
    try {
      const settings = JSON.parse(localStorage.getItem("settings"));
      return settings?.emailAlerts ?? defaultSettings.emailAlerts;
    } catch {
      return defaultSettings.emailAlerts;
    }
  });

  const [riskAlerts, setRiskAlerts] = useState(() => {
    try {
      const settings = JSON.parse(localStorage.getItem("settings"));
      return settings?.riskAlerts ?? defaultSettings.riskAlerts;
    } catch {
      return defaultSettings.riskAlerts;
    }
  });

  // =========================
  // SAVE MESSAGE
  // =========================

  const [saved, setSaved] = useState(false);

  // =========================
  // SAVE SETTINGS
  // =========================

  const handleSave = () => {
    const settings = {
      name,
      role,
      notifications,
      emailAlerts,
      riskAlerts,
    };

    // Save settings permanently in browser
    localStorage.setItem("settings", JSON.stringify(settings));

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);

    // Notify Navbar that settings have changed
    window.dispatchEvent(new Event("settingsUpdated"));
  };

  // =========================
  // RESET SETTINGS
  // =========================

  const handleReset = () => {
    setName(defaultSettings.name);
    setRole(defaultSettings.role);
    setNotifications(defaultSettings.notifications);
    setEmailAlerts(defaultSettings.emailAlerts);
    setRiskAlerts(defaultSettings.riskAlerts);

    // Remove saved settings from browser
    localStorage.removeItem("settings");

    setSaved(false);

    // Notify Navbar that settings have been reset
    window.dispatchEvent(new Event("settingsUpdated"));
  };

  return (
    <div className="app-layout">
      {/* =========================
          SIDEBAR
      ========================== */}

      <Sidebar />

      {/* =========================
          MAIN CONTENT
      ========================== */}

      <main className="main-content">
        <Navbar />

        <section className="dashboard">
          {/* =========================
              PAGE HEADER
          ========================== */}

          <div className="page-title">
            <h1>Account Settings</h1>

            <p>
              Manage your LAND-SAFE account and notification preferences
            </p>
          </div>

          {/* =========================
              PROFILE INFORMATION
          ========================== */}

          <div className="dashboard-section">
            <h2>Profile Information</h2>

            <p className="section-description">
              Manage your administrator account information
            </p>

            <div className="settings-profile">
              {/* Avatar */}

              <div className="settings-avatar">
                {name ? name.charAt(0).toUpperCase() : "A"}
              </div>

              {/* Profile Information */}

              <div className="settings-user-info">
                <h3>{name}</h3>

                <p>{role}</p>

                <span>LAND-SAFE Administrator</span>
              </div>
            </div>

            {/* Profile Form */}

            <div className="settings-form">
              <div className="setting-input">
                <label>Full Name</label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              <div className="setting-input">
                <label>Role</label>

                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Enter your role"
                />
              </div>
            </div>
          </div>

          {/* =========================
              NOTIFICATION SETTINGS
          ========================== */}

          <div className="dashboard-section">
            <h2>Notification Settings</h2>

            <p className="section-description">
              Control how you receive project risk alerts
            </p>

            {/* GENERAL NOTIFICATIONS */}

            <div className="setting-row">
              <div>
                <strong>Notifications</strong>

                <p>Receive notifications about project activities</p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) =>
                    setNotifications(e.target.checked)
                  }
                />

                <span className="slider"></span>
              </label>
            </div>

            {/* EMAIL ALERTS */}

            <div className="setting-row">
              <div>
                <strong>Email Alerts</strong>

                <p>
                  Receive important risk alerts by email
                </p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) =>
                    setEmailAlerts(e.target.checked)
                  }
                />

                <span className="slider"></span>
              </label>
            </div>

            {/* HIGH RISK ALERTS */}

            <div className="setting-row">
              <div>
                <strong>High Risk Alerts</strong>

                <p>
                  Get notified when projects reach high risk levels
                </p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={riskAlerts}
                  onChange={(e) =>
                    setRiskAlerts(e.target.checked)
                  }
                />

                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* =========================
              SYSTEM INFORMATION
          ========================== */}

          <div className="dashboard-section">
            <h2>System Information</h2>

            <p className="section-description">
              LAND-SAFE application information
            </p>

            <div className="settings-info-grid">
              {/* Application */}

              <div className="settings-info-card">
                <span>Application</span>

                <strong>LAND-SAFE</strong>
              </div>

              {/* Version */}

              <div className="settings-info-card">
                <span>Version</span>

                <strong>v1.0</strong>
              </div>

              {/* System Status */}

              <div className="settings-info-card">
                <span>System Status</span>

                <strong className="system-online">
                  ● Online
                </strong>
              </div>

              {/* User Role */}

              <div className="settings-info-card">
                <span>User Role</span>

                <strong>{role}</strong>
              </div>
            </div>
          </div>

          {/* =========================
              SAVE / RESET
          ========================== */}

          <div className="settings-actions">
            <button
              className="view-button"
              onClick={handleSave}
            >
              💾 Save Settings
            </button>

            <button
              className="back-button"
              onClick={handleReset}
            >
              ↺ Reset
            </button>
          </div>

          {/* =========================
              SUCCESS MESSAGE
          ========================== */}

          {saved && (
            <div className="settings-success">
              ✅ Settings saved successfully!
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Settings;