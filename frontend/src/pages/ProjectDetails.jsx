import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

const API_URL = "http://127.0.0.1:8000";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // FETCH PROJECT
  // ==========================================================

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("Fetching project ID:", id);

        if (!id) {
          throw new Error("No project ID was provided.");
        }

        const projectId = decodeURIComponent(id);

        const response = await fetch(
          `${API_URL}/projects/${encodeURIComponent(projectId)}`
        );

        console.log("Backend status:", response.status);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(
              `Project ${projectId} was not found in the dataset.`
            );
          }

          throw new Error(
            `Backend returned HTTP ${response.status}.`
          );
        }

        const data = await response.json();

        console.log("Project response:", data);

        if (!data || !data.project) {
          throw new Error(
            "Backend response does not contain project data."
          );
        }

        setProject(data.project);
      } catch (err) {
        console.error("Project details error:", err);

        setError(
          err.message || "Unable to fetch project data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // ==========================================================
  // SAFE NUMBER
  // ==========================================================

  const numberValue = (value, fallback = 0) => {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : fallback;
  };

  // ==========================================================
  // RISK SCORE
  // ==========================================================

  const getRiskScore = () => {
    if (!project) {
      return 0;
    }

    /*
      Current dataset contains delayed = 0/1.

      This keeps the same risk logic used by GIS.
    */

    return numberValue(project.delayed) === 1
      ? 75
      : 25;
  };

  // ==========================================================
  // RISK LEVEL
  // ==========================================================

  const getRiskLevel = () => {
    const score = getRiskScore();

    if (score >= 70) {
      return "High";
    }

    if (score >= 40) {
      return "Medium";
    }

    return "Low";
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <Navbar />

          <section className="dashboard">

            <div className="page-title">
              <h1>Project Details</h1>

              <p>
                Loading project {id}...
              </p>
            </div>

            <div className="dashboard-section">
              <p>
                Please wait while project information is
                retrieved from the backend.
              </p>
            </div>

          </section>
        </main>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !project) {
    return (
      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <Navbar />

          <section className="dashboard">

            <div className="page-title">
              <h1>Project Details</h1>

              <p>
                Detailed land acquisition project information
              </p>
            </div>

            <div
              className="dashboard-section"
              style={{
                padding: "30px",
                background: "#fee2e2",
                color: "#991b1b",
                borderRadius: "10px",
                border: "1px solid #fecaca",
              }}
            >

              <h2
                style={{
                  marginTop: 0,
                  color: "#991b1b",
                }}
              >
                Unable to fetch project data
              </h2>

              <p>
                {error ||
                  "Project information could not be loaded."}
              </p>

              <p>
                <strong>Project ID:</strong>{" "}
                {id
                  ? decodeURIComponent(id)
                  : "Not provided"}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "20px",
                  flexWrap: "wrap",
                }}
              >

                <button
                  onClick={() =>
                    window.location.reload()
                  }
                  style={{
                    padding: "10px 18px",
                    border: "none",
                    borderRadius: "6px",
                    background: "#dc2626",
                    color: "#ffffff",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Retry
                </button>

                <button
                  onClick={() =>
                    navigate("/projects")
                  }
                  style={{
                    padding: "10px 18px",
                    border: "none",
                    borderRadius: "6px",
                    background: "#2563eb",
                    color: "#ffffff",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  ← Back to Projects
                </button>

                <button
                  onClick={() =>
                    navigate("/gis-map")
                  }
                  style={{
                    padding: "10px 18px",
                    border: "1px solid #2563eb",
                    borderRadius: "6px",
                    background: "#ffffff",
                    color: "#2563eb",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  ← Back to GIS Map
                </button>

              </div>

            </div>

          </section>
        </main>
      </div>
    );
  }

  // ==========================================================
  // RISK
  // ==========================================================

  const riskScore = getRiskScore();
  const riskLevel = getRiskLevel();

  // ==========================================================
  // MAIN PAGE
  // ==========================================================

  return (
    <div className="app-layout">

      <Sidebar />

      <main className="main-content">

        <Navbar />

        <section className="dashboard">

          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <div className="page-title">

            <h1>
              Project Details
            </h1>

            <p>
              Detailed land acquisition project information
            </p>

          </div>


          {/* ==================================================
              PROJECT HEADER
          ================================================== */}

          <div className="dashboard-section">

            <div className="section-header">

              <div>

                <h2>
                  {project.project_id}
                </h2>

                <p className="section-description">

                  {project.project_type || "Land Acquisition"}

                  {" • "}

                  {project.district || "Unknown District"}

                  {", "}

                  {project.state || "Unknown State"}

                </p>

              </div>

              <span
                className={`risk-badge ${riskLevel.toLowerCase()}`}
              >
                {riskLevel}
              </span>

            </div>

          </div>


          {/* ==================================================
              PROJECT INFORMATION
          ================================================== */}

          <div className="dashboard-section">

            <h2>
              Project Information
            </h2>

            <div className="settings-info-grid">

              <div className="settings-info-card">

                <span>
                  Project ID
                </span>

                <strong>
                  {project.project_id}
                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Project Type
                </span>

                <strong>
                  {project.project_type || "N/A"}
                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  State
                </span>

                <strong>
                  {project.state || "N/A"}
                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  District
                </span>

                <strong>
                  {project.district || "N/A"}
                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Land Area
                </span>

                <strong>

                  {numberValue(
                    project.land_area_hectares
                  ).toFixed(2)}

                  {" "}ha

                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Affected Families
                </span>

                <strong>

                  {numberValue(
                    project.affected_families
                  ).toLocaleString()}

                </strong>

              </div>

            </div>

          </div>


          {/* ==================================================
              DELAY RISK
          ================================================== */}

          <div className="dashboard-section">

            <h2>
              Delay Risk
            </h2>

            <div className="operational-grid">

              {/* RISK SCORE */}

              <div className="operational-card">

                <div className="operational-icon">
                  ⚠️
                </div>

                <div>

                  <span>
                    Risk Score
                  </span>

                  <strong>
                    {riskScore}%
                  </strong>

                  <small>
                    Predicted acquisition risk
                  </small>

                </div>

              </div>


              {/* DELAY */}

              <div className="operational-card">

                <div className="operational-icon">
                  ⏱️
                </div>

                <div>

                  <span>
                    Delay
                  </span>

                  <strong>

                    {numberValue(
                      project.delay_days
                    )}

                  </strong>

                  <small>
                    Days
                  </small>

                </div>

              </div>


              {/* LEGAL DISPUTES */}

              <div className="operational-card">

                <div className="operational-icon">
                  ⚖️
                </div>

                <div>

                  <span>
                    Legal Disputes
                  </span>

                  <strong>

                    {numberValue(
                      project.legal_disputes
                    )}

                  </strong>

                  <small>
                    Recorded disputes
                  </small>

                </div>

              </div>

            </div>

          </div>


          {/* ==================================================
              ACQUISITION STATUS
          ================================================== */}

          <div className="dashboard-section">

            <h2>
              Acquisition Status
            </h2>

            <div className="settings-info-grid">

              <div className="settings-info-card">

                <span>
                  Current Stage
                </span>

                <strong>
                  {project.current_stage || "N/A"}
                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Pending Approvals
                </span>

                <strong>
                  {numberValue(
                    project.pending_approvals
                  )}
                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Approval Delay
                </span>

                <strong>

                  {numberValue(
                    project.approval_delay_days
                  )}

                  {" "}days

                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Official Benchmark Breaches
                </span>

                <strong>

                  {numberValue(
                    project.official_benchmark_breaches
                  )}

                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Compensation
                </span>

                <strong>

                  {numberValue(
                    project.compensation_percentage
                  )}%

                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Documentation
                </span>

                <strong>

                  {numberValue(
                    project.documentation_percentage
                  )}%

                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Rehabilitation
                </span>

                <strong>

                  {numberValue(
                    project.rehabilitation_percentage
                  )}%

                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Possession
                </span>

                <strong>

                  {numberValue(
                    project.possession_percentage
                  )}%

                </strong>

              </div>

            </div>

          </div>


          {/* ==================================================
              PROJECT PERFORMANCE
          ================================================== */}

          <div className="dashboard-section">

            <h2>
              Project Performance Indicators
            </h2>

            <div className="settings-info-grid">

              <div className="settings-info-card">

                <span>
                  Stakeholder Response
                </span>

                <strong>

                  {numberValue(
                    project.stakeholder_response_percentage
                  )}%

                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Historical Performance
                </span>

                <strong>

                  {numberValue(
                    project.historical_performance_percentage
                  )}%

                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Land Record Update
                </span>

                <strong>

                  {numberValue(
                    project.land_record_update_days
                  )} days

                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Objection Disposal
                </span>

                <strong>

                  {numberValue(
                    project.objection_disposal_days
                  )} days

                </strong>

              </div>

            </div>

          </div>


          {/* ==================================================
              ACQUISITION TIMELINE
          ================================================== */}

          <div className="dashboard-section">

            <h2>
              Acquisition Timeline
            </h2>

            <div className="settings-info-grid">

              <div className="settings-info-card">

                <span>
                  SIA → Preliminary
                </span>

                <strong>

                  {numberValue(
                    project.sia_to_preliminary_months
                  )} months

                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Acquisition Cost Deposit
                </span>

                <strong>

                  {numberValue(
                    project.acquisition_cost_deposit_months
                  )} months

                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Preliminary → Declaration
                </span>

                <strong>

                  {numberValue(
                    project.preliminary_to_declaration_months
                  )} months

                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Award Duration
                </span>

                <strong>

                  {numberValue(
                    project.award_duration_months
                  )} months

                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  RR Implementation
                </span>

                <strong>

                  {numberValue(
                    project.rr_implementation_months
                  )} months

                </strong>

              </div>

            </div>

          </div>


          {/* ==================================================
              GIS INFORMATION
          ================================================== */}

          <div className="dashboard-section">

            <h2>
              GIS Information
            </h2>

            <div className="settings-info-grid">

              <div className="settings-info-card">

                <span>
                  Latitude
                </span>

                <strong>

                  {project.latitude !== ""
                    ? project.latitude
                    : "N/A"}

                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Longitude
                </span>

                <strong>

                  {project.longitude !== ""
                    ? project.longitude
                    : "N/A"}

                </strong>

              </div>

            </div>

          </div>


          {/* ==================================================
              DATA SOURCE
          ================================================== */}

          <div className="dashboard-section">

            <h2>
              Prediction Status
            </h2>

            <div
              style={{
                padding: "18px",
                background: "#f8fafc",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
              }}
            >

              <p
                style={{
                  margin: 0,
                  lineHeight: "1.7",
                }}
              >

                This project is evaluated using the
                land acquisition dataset and the
                configured delay-risk prediction model.

              </p>

              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >

                <span
                  className={`risk-badge ${riskLevel.toLowerCase()}`}
                >
                  {riskLevel} Risk
                </span>

                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    background:
                      "#eff6ff",
                    color:
                      "#1d4ed8",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Risk Score: {riskScore}%
                </span>

              </div>

            </div>

          </div>


          {/* ==================================================
              NAVIGATION BUTTONS
          ================================================== */}

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >

            <button
              onClick={() =>
                navigate("/projects")
              }
              style={{
                padding: "12px 20px",
                border: "none",
                borderRadius: "7px",
                background: "#2563eb",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ← Back to Projects
            </button>


            <button
              onClick={() =>
                navigate("/gis-map")
              }
              style={{
                padding: "12px 20px",
                border: "1px solid #2563eb",
                borderRadius: "7px",
                background: "#ffffff",
                color: "#2563eb",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ← Back to GIS Map
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default ProjectDetails;
