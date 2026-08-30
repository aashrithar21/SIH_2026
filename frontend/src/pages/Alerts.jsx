import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

const API_URL = "http://127.0.0.1:8000";

function Alerts() {

  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ============================================================
  // LOAD ALL PROJECTS
  // ============================================================

  useEffect(() => {

    const fetchProjects = async () => {

      try {

        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/projects?limit=12000&offset=0`
        );

        if (!response.ok) {
          throw new Error("Failed to load projects");
        }

        const data = await response.json();

        setProjects(
          data.projects || []
        );

      } catch (err) {

        console.error(err);

        setError(
          "Unable to connect to backend. Make sure FastAPI is running."
        );

      } finally {

        setLoading(false);

      }

    };

    fetchProjects();

  }, []);


  // ============================================================
  // RISK CALCULATION
  // ============================================================

  const getRiskScore = (project) => {

    const delayed =
      Number(project.delayed);

    return delayed === 1 ? 75 : 25;

  };


  const getRiskLevel = (project) => {

    const score =
      getRiskScore(project);

    if (score >= 70) {
      return "High";
    }

    if (score >= 40) {
      return "Medium";
    }

    return "Low";

  };


  // ============================================================
  // ALERT PROJECTS
  // ============================================================

  const projectsWithRisk =
    projects.map((project) => {

      const riskScore =
        getRiskScore(project);

      const riskLevel =
        getRiskLevel(project);

      return {
        ...project,
        riskScore,
        riskLevel,
        delayProbability: riskScore,
      };

    });


  const criticalProjects =
    projectsWithRisk.filter(
      (project) =>
        project.riskScore >= 85
    );


  const highRiskProjects =
    projectsWithRisk.filter(
      (project) =>
        project.riskScore >= 70 &&
        project.riskScore < 85
    );


  const mediumRiskProjects =
    projectsWithRisk.filter(
      (project) =>
        project.riskScore >= 40 &&
        project.riskScore < 70
    );


  const totalAlerts =
    criticalProjects.length +
    highRiskProjects.length +
    mediumRiskProjects.length;


  // ============================================================
  // ALERT CARD
  // ============================================================

  const AlertCard = ({
    project,
    type,
  }) => {

    return (

      <div
        className={`alert-card alert-${type}`}
      >

        <div className="alert-card-left">

          <div
            className={`alert-icon alert-icon-${type}`}
          >

            {type === "medium"
              ? "•"
              : "!"}

          </div>


          <div className="alert-content">

            <div className="alert-title-row">

              <div>

                <h3>
                  {project.project_id}
                </h3>

                <p className="alert-location">

                  📍{" "}
                  {project.district},{" "}
                  {project.state}

                </p>

              </div>


              <span
                className={`risk-badge ${project.riskLevel.toLowerCase()}`}
              >

                {project.riskLevel}

              </span>

            </div>


            <div className="alert-metrics">

              <div className="alert-metric">

                <span>
                  Risk Score
                </span>

                <strong>
                  {project.riskScore}%
                </strong>

              </div>


              <div className="alert-metric">

                <span>
                  Delay Days
                </span>

                <strong>
                  {project.delay_days || 0}
                </strong>

              </div>


              <div className="alert-metric">

                <span>
                  Legal Disputes
                </span>

                <strong>
                  {project.legal_disputes || 0}
                </strong>

              </div>


              <div className="alert-metric">

                <span>
                  Pending Approvals
                </span>

                <strong>
                  {project.pending_approvals || 0}
                </strong>

              </div>

            </div>


            <div className="alert-progress-section">

              <div className="alert-progress-header">

                <span>
                  Acquisition Risk
                </span>

                <strong>
                  {project.riskScore}%
                </strong>

              </div>


              <div className="alert-progress">

                <div
                  className={`alert-progress-fill ${type}`}
                  style={{
                    width:
                      `${project.riskScore}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </div>


        <button
          className="alert-view-button"
          onClick={() =>
            navigate(
              `/projects/${project.project_id}`
            )
          }
        >

          View Details

          <span>
            →
          </span>

        </button>

      </div>

    );

  };


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div className="app-layout">

      <Sidebar />

      <main className="main-content">

        <Navbar />

        <section className="dashboard alerts-page">


          {/* PAGE HEADER */}

          <div className="page-title alerts-page-title">

            <div>

              <span className="page-eyebrow">
                RISK MANAGEMENT
              </span>

              <h1>
                Alerts
              </h1>

              <p>
                Monitor projects requiring attention
              </p>

            </div>


            <div className="live-monitoring">

              <span className="live-dot"></span>

              <div>

                <strong>
                  Live Monitoring
                </strong>

                <small>
                  Monitoring complete dataset
                </small>

              </div>

            </div>

          </div>


          {/* ERROR */}

          {error && (

            <div
              style={{
                padding: "15px",
                marginBottom: "20px",
                borderRadius: "8px",
                background: "#fee2e2",
                color: "#991b1b",
              }}
            >

              {error}

            </div>

          )}


          {/* LOADING */}

          {loading && (

            <div className="dashboard-section">

              Loading alerts from{" "}

              <strong>
                12,000 projects
              </strong>
              ...

            </div>

          )}


          {!loading && !error && (

            <>

              {/* SUMMARY */}

              <div className="alert-summary-grid">

                <div className="alert-summary-card critical-summary">

                  <div className="summary-icon">
                    !
                  </div>

                  <div className="summary-content">

                    <span>
                      Critical Alerts
                    </span>

                    <strong>
                      {criticalProjects.length.toLocaleString()}
                    </strong>

                    <small>
                      Immediate intervention
                    </small>

                  </div>

                </div>


                <div className="alert-summary-card high-summary">

                  <div className="summary-icon">
                    !
                  </div>

                  <div className="summary-content">

                    <span>
                      High Risk Alerts
                    </span>

                    <strong>
                      {highRiskProjects.length.toLocaleString()}
                    </strong>

                    <small>
                      Requires attention
                    </small>

                  </div>

                </div>


                <div className="alert-summary-card medium-summary">

                  <div className="summary-icon">
                    •
                  </div>

                  <div className="summary-content">

                    <span>
                      Medium Risk
                    </span>

                    <strong>
                      {mediumRiskProjects.length.toLocaleString()}
                    </strong>

                    <small>
                      Under monitoring
                    </small>

                  </div>

                </div>


                <div className="alert-summary-card total-summary">

                  <div className="summary-icon">
                    ✓
                  </div>

                  <div className="summary-content">

                    <span>
                      Total Alerts
                    </span>

                    <strong>
                      {totalAlerts.toLocaleString()}
                    </strong>

                    <small>
                      Active project alerts
                    </small>

                  </div>

                </div>

              </div>


              {/* CRITICAL */}

              <div className="dashboard-section alert-section">

                <div className="section-header">

                  <div>

                    <div className="section-title-with-icon">

                      <span className="section-alert-icon critical-icon">
                        !
                      </span>

                      <h2>
                        Critical Alerts
                      </h2>

                    </div>

                    <p className="section-description">
                      Projects requiring immediate intervention
                    </p>

                  </div>

                  <span className="project-count critical-count">

                    {criticalProjects.length}
                    {" "}
                    Alert
                    {criticalProjects.length !== 1
                      ? "s"
                      : ""}

                  </span>

                </div>


                {criticalProjects.length === 0 ? (

                  <div className="empty-alert">
                    ✓ No critical alerts at this time
                  </div>

                ) : (

                  <div className="alert-list">

                    {criticalProjects.map(
                      (project) => (

                        <AlertCard
                          key={project.project_id}
                          project={project}
                          type="critical"
                        />

                      )
                    )}

                  </div>

                )}

              </div>


              {/* HIGH */}

              <div className="dashboard-section alert-section">

                <div className="section-header">

                  <div>

                    <div className="section-title-with-icon">

                      <span className="section-alert-icon high-icon">
                        !
                      </span>

                      <h2>
                        High Risk Alerts
                      </h2>

                    </div>

                    <p className="section-description">
                      Projects that require close monitoring
                    </p>

                  </div>

                  <span className="project-count high-count">

                    {highRiskProjects.length}
                    {" "}
                    Alert
                    {highRiskProjects.length !== 1
                      ? "s"
                      : ""}

                  </span>

                </div>


                {highRiskProjects.length === 0 ? (

                  <div className="empty-alert">
                    ✓ No high risk alerts
                  </div>

                ) : (

                  <div className="alert-list">

                    {highRiskProjects.map(
                      (project) => (

                        <AlertCard
                          key={project.project_id}
                          project={project}
                          type="high"
                        />

                      )
                    )}

                  </div>

                )}

              </div>


              {/* MEDIUM */}

              <div className="dashboard-section alert-section">

                <div className="section-header">

                  <div>

                    <div className="section-title-with-icon">

                      <span className="section-alert-icon medium-icon">
                        •
                      </span>

                      <h2>
                        Medium Risk Monitoring
                      </h2>

                    </div>

                    <p className="section-description">
                      Projects currently under monitoring
                    </p>

                  </div>

                  <span className="project-count medium-count">

                    {mediumRiskProjects.length}
                    {" "}
                    Project
                    {mediumRiskProjects.length !== 1
                      ? "s"
                      : ""}

                  </span>

                </div>


                {mediumRiskProjects.length === 0 ? (

                  <div className="empty-alert">
                    ✓ No medium risk projects
                  </div>

                ) : (

                  <div className="alert-list">

                    {mediumRiskProjects.map(
                      (project) => (

                        <AlertCard
                          key={project.project_id}
                          project={project}
                          type="medium"
                        />

                      )
                    )}

                  </div>

                )}

              </div>

            </>

          )}

        </section>

      </main>

    </div>

  );

}

export default Alerts;