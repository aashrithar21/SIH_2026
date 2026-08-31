import { NavLink } from "react-router-dom";

function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const isAdministrator =
    user?.role === "Administrator";

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
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

  // ----------------------------------------------------------
  // ADMINISTRATOR ONLY
  // ----------------------------------------------------------

  if (isAdministrator) {
    menuItems.push({
      name: "Data Upload",
      path: "/data-upload",
      icon: "⇧",
    });
  }

  return (
    <aside className="sidebar">

      {/* =====================================================
          LOGO
      ====================================================== */}

      <div className="sidebar-brand">

        <div className="brand-icon">
          AV
        </div>

        <div className="brand-text">

          <div className="logo">
            AcquiVision
          </div>

          <div className="brand-subtitle">
            Predictive vision for acquisition
          </div>

        </div>

      </div>


      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <div className="sidebar-section-title">
        MAIN MENU
      </div>

      <nav className="navigation">

        {menuItems.map((item) => (

          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
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


      {/* =====================================================
          BOTTOM STATUS
      ====================================================== */}

      <div className="sidebar-bottom">

        <div className="system-status">

          <span className="status-dot"></span>

          <div className="status-text">

            <strong>
              System Online
            </strong>

            <small>
              Monitoring active
            </small>

          </div>

        </div>


        {/* CURRENT USER */}

        {user && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.05)",
            }}
          >

            <strong
              style={{
                display: "block",
                fontSize: "13px",
              }}
            >
              {user.username}
            </strong>

            <small
              style={{
                opacity: 0.7,
              }}
            >
              {user.role}
            </small>

          </div>
        )}


        <div className="sidebar-version">
          AcquiVision v1.0
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;