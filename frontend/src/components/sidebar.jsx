import { NavLink } from "react-router-dom";

function Sidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: "▦",
    },
    {
      name: "Projects",
      path: "/projects",
      icon: "▣",
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: "◈",
    },
    {
      name: "GIS Map",
      path: "/gis-map",
      icon: "⌖",
    },
    {
      name: "Alerts",
      path: "/alerts",
      icon: "⚠",
    },
    {
      name: "Model Center",
      path: "/model-center",
      icon: "◉",
    },
    {
      name: "Governance",
      path: "/governance",
      icon: "◆",
    },
  ];

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-brand">
        <div className="brand-icon">AV</div>

        <div className="brand-text">
          <div className="logo">AcquiVision</div>

          <div className="brand-subtitle">
            Predictive vision for acquisition
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-section-title">
        MAIN MENU
      </div>

      <nav className="navigation">

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">
              {item.icon}
            </span>

            <span className="nav-text">
              {item.name}
            </span>

            {item.name === "Alerts" && (
              <span className="alert-count">
                5
              </span>
            )}
          </NavLink>
        ))}

      </nav>

      {/* Bottom Status */}
      <div className="sidebar-bottom">

        <div className="system-status">

          <span className="status-dot"></span>

          <div className="status-text">
            <strong>System Online</strong>
            <small>Monitoring active</small>
          </div>

        </div>

        <div className="sidebar-version">
          AcquiVision v1.0
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;