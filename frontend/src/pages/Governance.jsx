import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

function Governance() {
  const permissions = [
    {
      role: "Administrator",
      dashboard: "Full",
      projects: "Full",
      analytics: "Full",
      gis: "Full",
      alerts: "Full",
      settings: "Full",
    },
    {
      role: "Risk Manager",
      dashboard: "View",
      projects: "Manage",
      analytics: "Full",
      gis: "View",
      alerts: "Manage",
      settings: "Manage",
    },
    {
      role: "Analyst",
      dashboard: "View",
      projects: "View",
      analytics: "Full",
      gis: "View",
      alerts: "View",
      settings: "View",
    },
  ];

  const auditLogs = [
    {
      user: "Administrator",
      action: "Risk analysis viewed",
      target: "NH-48 Highway Expansion",
      time: "Today, 10:42 AM",
    },
    {
      user: "Risk Manager",
      action: "Project details reviewed",
      target: "Western Railway Corridor",
      time: "Today, 10:18 AM",
    },
    {
      user: "Administrator",
      action: "Settings updated",
      target: "Account Settings",
      time: "Yesterday, 4:35 PM",
    },
    {
      user: "Analyst",
      action: "Analytics accessed",
      target: "District Risk Trends",
      time: "Yesterday, 3:12 PM",
    },
  ];

  return (
    <div className="app-layout">

      <Sidebar />

      <main className="main-content">

        <Navbar />

        <section className="dashboard">

          <div className="page-title">
            <h1>Governance & Security</h1>
            <p>
              Manage roles, permissions and system activity
            </p>
          </div>

          {/* ROLE BASED ACCESS */}

          <div className="dashboard-section">

            <h2>Role-Based Access Control</h2>

            <p className="section-description">
              Frontend permission matrix for system modules
            </p>

            <div className="project-table-wrapper">

              <table className="project-table">

                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Dashboard</th>
                    <th>Projects</th>
                    <th>Analytics</th>
                    <th>GIS Map</th>
                    <th>Alerts</th>
                    <th>Settings</th>
                  </tr>
                </thead>

                <tbody>

                  {permissions.map((item) => (

                    <tr key={item.role}>

                      <td>
                        <strong>{item.role}</strong>
                      </td>

                      <td>{item.dashboard}</td>
                      <td>{item.projects}</td>
                      <td>{item.analytics}</td>
                      <td>{item.gis}</td>
                      <td>{item.alerts}</td>
                      <td>{item.settings}</td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          </div>

          {/* SECURITY STATUS */}

          <div className="dashboard-section">

            <h2>Security Status</h2>

            <div className="operational-grid">

              <div className="operational-card">
                <div className="operational-icon">
                  🔐
                </div>

                <div>
                  <span>Authentication</span>
                  <strong>Configured</strong>
                  <small>Backend integration ready</small>
                </div>
              </div>

              <div className="operational-card">
                <div className="operational-icon">
                  🛡️
                </div>

                <div>
                  <span>Access Control</span>
                  <strong>Defined</strong>
                  <small>Role permissions configured</small>
                </div>
              </div>

              <div className="operational-card">
                <div className="operational-icon">
                  📋
                </div>

                <div>
                  <span>Audit Logging</span>
                  <strong>Active</strong>
                  <small>Activity interface available</small>
                </div>
              </div>

            </div>
          </div>

          {/* AUDIT TRAIL */}

          <div className="dashboard-section">

            <h2>Audit Trail</h2>

            <p className="section-description">
              Recent system activities and user actions
            </p>

            <div className="project-table-wrapper">

              <table className="project-table">

                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Target</th>
                    <th>Time</th>
                  </tr>
                </thead>

                <tbody>

                  {auditLogs.map((log, index) => (

                    <tr key={index}>

                      <td>
                        <strong>{log.user}</strong>
                      </td>

                      <td>{log.action}</td>

                      <td>{log.target}</td>

                      <td>{log.time}</td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          <div className="info-banner">
            <strong>Backend Security Integration</strong>
            <p>
              Authentication, authorization and persistent
              audit records can be connected to the backend
              security service.
            </p>
          </div>

        </section>

      </main>

    </div>
  );
}

export default Governance;