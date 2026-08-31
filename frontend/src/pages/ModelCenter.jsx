import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

const API_URL = "http://127.0.0.1:8000";

function ModelCenter() {
  const navigate = useNavigate();

  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState("");

  // ==========================================================
  // FETCH MODEL INFORMATION
  // ==========================================================

  useEffect(() => {
    const fetchModelInfo = async () => {
      try {
        setLoading(true);
        setBackendError("");

        const response = await fetch(
          `${API_URL}/model-info`
        );

        if (!response.ok) {
          throw new Error(
            "Unable to retrieve model information from backend."
          );
        }

        const data = await response.json();

        setModelInfo(data);
      } catch (err) {
        console.error("Model Center error:", err);

        setBackendError(
          err.message ||
            "Unable to connect to backend."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchModelInfo();
  }, []);

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
              <span className="page-eyebrow">
                AI MANAGEMENT
              </span>

              <h1>Model Center</h1>

              <p>
                Monitor AI model readiness and continuous
                learning
              </p>
            </div>

            <div className="dashboard-section">
              <div
                style={{
                  padding: "30px",
                  textAlign: "center",
                }}
              >
                <h2>Loading Model Information...</h2>

                <p className="section-description">
                  Connecting to the prediction service.
                </p>
              </div>
            </div>

          </section>
        </main>
      </div>
    );
  }

  // ==========================================================
  // BACKEND CONNECTION ERROR
  // ==========================================================

  if (backendError) {
    return (
      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <Navbar />

          <section className="dashboard">

            <div className="page-title">
              <span className="page-eyebrow">
                AI MANAGEMENT
              </span>

              <h1>Model Center</h1>

              <p>
                Monitor AI model readiness and continuous
                learning
              </p>
            </div>

            <div className="dashboard-section">

              <div
                style={{
                  padding: "30px",
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                  borderRadius: "12px",
                }}
              >

                <div
                  style={{
                    fontSize: "42px",
                    marginBottom: "10px",
                  }}
                >
                  ⚠️
                </div>

                <h2>
                  AI Model Currently Unavailable
                </h2>

                <p
                  className="section-description"
                  style={{
                    maxWidth: "700px",
                  }}
                >
                  The prediction model could not be reached
                  at this time. Project information is still
                  available from the existing dataset.
                </p>

                <p
                  style={{
                    color: "#9a3412",
                    marginTop: "12px",
                  }}
                >
                  {backendError}
                </p>

                <button
                  onClick={() =>
                    navigate("/projects")
                  }
                  style={{
                    marginTop: "15px",
                    padding: "12px 20px",
                    border: "none",
                    borderRadius: "7px",
                    background: "#2563eb",
                    color: "#ffffff",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  View Project Data Manually →
                </button>

              </div>

            </div>

            {/* MANUAL DATA INFORMATION */}

            <div className="dashboard-section">

              <h2>
                Manual Project Information
              </h2>

              <p className="section-description">
                Officials can still review existing land
                acquisition records even when AI prediction
                services are unavailable.
              </p>

              <div className="operational-grid">

                <div className="operational-card">

                  <div className="operational-icon">
                    📋
                  </div>

                  <div>
                    <span>
                      Project Records
                    </span>

                    <strong>
                      Available
                    </strong>

                    <small>
                      Existing dataset information
                    </small>
                  </div>

                </div>

                <div className="operational-card">

                  <div className="operational-icon">
                    🗺️
                  </div>

                  <div>
                    <span>
                      GIS Information
                    </span>

                    <strong>
                      Available
                    </strong>

                    <small>
                      Geographic project records
                    </small>
                  </div>

                </div>

                <div className="operational-card">

                  <div className="operational-icon">
                    🔎
                  </div>

                  <div>
                    <span>
                      Project Details
                    </span>

                    <strong>
                      Accessible
                    </strong>

                    <small>
                      Review individual projects
                    </small>
                  </div>

                </div>

              </div>

            </div>

          </section>
        </main>
      </div>
    );
  }

  // ==========================================================
  // MODEL LOADED STATUS
  // ==========================================================

  const modelLoaded =
    modelInfo?.model_loaded === true;

  const modelStatus =
    modelInfo?.status || "Unavailable";

  // ==========================================================
  // MAIN MODEL CENTER
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

            <span className="page-eyebrow">
              AI MANAGEMENT
            </span>

            <h1>
              Model Center
            </h1>

            <p>
              Monitor AI model readiness and continuous
              learning
            </p>

          </div>


          {/* ==================================================
              MODEL STATUS
          ================================================== */}

          <div className="dashboard-section">

            <div className="section-header">

              <div>

                <h2>
                  AI Model Status
                </h2>

                <p className="section-description">
                  Current prediction model information
                </p>

              </div>

              <span
                className={`status-badge ${
                  modelLoaded
                    ? "online"
                    : "offline"
                }`}
              >
                ●{" "}
                {modelLoaded
                  ? "Model Ready"
                  : "Model Unavailable"}
              </span>

            </div>


            <div className="settings-info-grid">

              <div className="settings-info-card">

                <span>
                  Model Version
                </span>

                <strong>
                  {modelInfo?.model_version ||
                    "Not Available"}
                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Model Type
                </span>

                <strong>
                  {modelInfo?.model_type ||
                    "Not Available"}
                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Dataset Records
                </span>

                <strong>
                  {Number(
                    modelInfo?.dataset_records || 0
                  ).toLocaleString()}
                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Model Status
                </span>

                <strong
                  className={
                    modelLoaded
                      ? "system-online"
                      : ""
                  }
                >
                  ● {modelStatus}
                </strong>

              </div>

            </div>

          </div>


          {/* ==================================================
              MODEL AVAILABILITY
          ================================================== */}

          {!modelLoaded && (

            <div className="dashboard-section">

              <div
                style={{
                  padding: "25px",
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                  borderRadius: "10px",
                }}
              >

                <h2>
                  Prediction Service Unavailable
                </h2>

                <p className="section-description">
                  The AI model is currently unavailable.
                  However, officials can still access
                  manually recorded project information.
                </p>

                <button
                  onClick={() =>
                    navigate("/projects")
                  }
                  style={{
                    marginTop: "15px",
                    padding: "11px 18px",
                    border: "none",
                    borderRadius: "7px",
                    background: "#2563eb",
                    color: "#ffffff",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  View Project Data Manually →
                </button>

              </div>

            </div>

          )}


          {/* ==================================================
              CONTINUOUS LEARNING
          ================================================== */}

          <div className="dashboard-section">

            <h2>
              Continuous Model Learning
            </h2>

            <p className="section-description">
              Model lifecycle for future retraining and
              deployment.
            </p>


            <div className="model-workflow">

              <div className="model-step">

                <div className="model-step-number">
                  1. <strong>Data Collection</strong>
                </div>

                <span>
                  Historical and project data
                </span>

              </div>
                 <br></br>

              <div className="model-step">

                <div className="model-step-number">
                  2. <strong>
                  Model Training
                </strong>
                </div>
                                
                <span>
                  Retraining with new data
                </span>

              </div>
                   <br></br>

              <div className="model-step">

                <div className="model-step-number">
                  3. <strong>
                  Validation
                </strong>
                </div>

                <span>
                  Evaluate model performance
                </span>

              </div>
                 <br></br>

              <div className="model-step">

                <div className="model-step-number">
                  4. <strong>
                  Deployment
                </strong>
                </div>

                <span>
                  Publish validated model
                </span>

              </div>
      
            </div>

          </div>


          {/* ==================================================
              MODEL PERFORMANCE
          ================================================== */}

          <div className="dashboard-section">

            <h2>
              Model Performance Indicators
            </h2>

            <div className="operational-grid">

              <div className="operational-card">

                <div className="operational-icon">
                  🎯
                </div>

                <div>

                  <span>
                    Prediction Accuracy
                  </span>

                  <strong>
                    91%
                  </strong>

                  <small>
                    Validation performance
                  </small>

                </div>

              </div>


              <div className="operational-card">

                <div className="operational-icon">
                  📊
                </div>

                <div>

                  <span>
                    Training Records
                  </span>

                  <strong>
                    {Number(
                      modelInfo?.dataset_records || 0
                    ).toLocaleString()}
                  </strong>

                  <small>
                    Available records
                  </small>

                </div>

              </div>


              <div className="operational-card">

                <div className="operational-icon">
                  🔄
                </div>

                <div>

                  <span>
                    Learning Status
                  </span>

                  <strong>
                    {modelLoaded
                      ? "Ready"
                      : "Unavailable"}
                  </strong>

                  <small>
                    {modelLoaded
                      ? "Awaiting new training cycle"
                      : "Prediction service unavailable"}
                  </small>

                </div>

              </div>

            </div>

          </div>


          {/* ==================================================
              MANUAL FALLBACK
          ================================================== */}

          <div className="info-banner">

            <strong>
              Manual Data Fallback
            </strong>

            <p>
              AI predictions are an additional decision
              support mechanism. Existing project records
              remain accessible for manual review when the
              prediction model is unavailable.
            </p>

            <button
              onClick={() =>
                navigate("/projects")
              }
              style={{
                marginTop: "10px",
                padding: "10px 16px",
                border: "none",
                borderRadius: "6px",
                background: "#2563eb",
                color: "#ffffff",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Open Project Records
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default ModelCenter;