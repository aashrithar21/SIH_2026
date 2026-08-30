import { useEffect, useState } from "react";

import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

const API_URL = "http://127.0.0.1:8000";

function ModelCenter() {

  const [modelInfo, setModelInfo] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ============================================================
  // FETCH MODEL INFORMATION
  // ============================================================

  useEffect(() => {

    const fetchModelInfo = async () => {

      try {

        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/model-info`
        );

        if (!response.ok) {

          throw new Error(
            `Backend returned status ${response.status}`
          );

        }

        const data = await response.json();

        console.log(
          "Model information:",
          data
        );

        setModelInfo(data);

      } catch (err) {

        console.error(
          "Model Center error:",
          err
        );

        setError(
          "Unable to connect to backend. Make sure FastAPI is running on http://127.0.0.1:8000"
        );

      } finally {

        setLoading(false);

      }

    };

    fetchModelInfo();

  }, []);


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <div className="app-layout">

        <Sidebar />

        <main className="main-content">

          <Navbar />

          <section className="dashboard">

            <div className="page-title">

              <h1>
                Model Center
              </h1>

              <p>
                Loading AI model information...
              </p>

            </div>

          </section>

        </main>

      </div>

    );

  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error) {

    return (

      <div className="app-layout">

        <Sidebar />

        <main className="main-content">

          <Navbar />

          <section className="dashboard">

            <div className="page-title">

              <h1>
                Model Center
              </h1>

              <p>
                Monitor AI model readiness and performance
              </p>

            </div>


            <div
              className="dashboard-section"
              style={{
                padding: "25px",
                background: "#fee2e2",
                color: "#991b1b",
                borderRadius: "10px",
              }}
            >

              <h3>
                Unable to connect to backend
              </h3>

              <p>
                {error}
              </p>

              <p>
                Check the FastAPI terminal for errors.
              </p>

            </div>

          </section>

        </main>

      </div>

    );

  }


  // ============================================================
  // MODEL DATA
  // ============================================================

  const datasetRecords =
    Number(modelInfo?.dataset_records || 0);

  const modelLoaded =
    Boolean(modelInfo?.model_loaded);


  // ============================================================
  // MAIN UI
  // ============================================================

  return (

    <div className="app-layout">

      <Sidebar />

      <main className="main-content">

        <Navbar />

        <section className="dashboard">


          {/* PAGE HEADER */}

          <div className="page-title">

            <h1>
              Model Center
            </h1>

            <p>
              Monitor AI model readiness and continuous learning
            </p>

          </div>


          {/* MODEL STATUS */}

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
                  : "Model Not Loaded"}

              </span>

            </div>


            <div className="settings-info-grid">


              <div className="settings-info-card">

                <span>
                  Model Version
                </span>

                <strong>
                  {modelInfo?.model_version || "N/A"}
                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Model Type
                </span>

                <strong>
                  {modelInfo?.model_type || "N/A"}
                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Dataset Records
                </span>

                <strong>
                  {datasetRecords.toLocaleString()}
                </strong>

              </div>


              <div className="settings-info-card">

                <span>
                  Model Status
                </span>

                <strong className="system-online">

                  ●{" "}

                  {modelInfo?.status || "Unknown"}

                </strong>

              </div>

            </div>

          </div>


          {/* DATASET INFORMATION */}

          <div className="dashboard-section">

            <h2>
              Training Dataset
            </h2>

            <p className="section-description">
              Dataset currently available to the prediction system
            </p>


            <div className="operational-grid">

              <div className="operational-card">

                <div className="operational-icon">
                  📊
                </div>

                <div>

                  <span>
                    Total Records
                  </span>

                  <strong>
                    {datasetRecords.toLocaleString()}
                  </strong>

                  <small>
                    Projects available in backend
                  </small>

                </div>

              </div>


              <div className="operational-card">

                <div className="operational-icon">
                  🤖
                </div>

                <div>

                  <span>
                    Prediction Model
                  </span>

                  <strong>
                    {modelLoaded
                      ? "Active"
                      : "Unavailable"}
                  </strong>

                  <small>
                    Land acquisition delay prediction
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
                    Ready
                  </strong>

                  <small>
                    Awaiting future retraining cycle
                  </small>

                </div>

              </div>

            </div>

          </div>


          {/* MODEL WORKFLOW */}

          <div className="dashboard-section">

            <h2>
              Continuous Model Learning
            </h2>

            <p className="section-description">
              Workflow for maintaining and improving the prediction model
            </p>


            <div className="model-workflow">


              <div className="model-step">

                <div className="model-step-number">
                  1
                </div>

                <strong>
                  Data Collection
                </strong>

                <span>
                  Historical and project data
                </span>

              </div>


              <div className="model-step">

                <div className="model-step-number">
                  2
                </div>

                <strong>
                  Model Training
                </strong>

                <span>
                  Retraining with new data
                </span>

              </div>


              <div className="model-step">

                <div className="model-step-number">
                  3
                </div>

                <strong>
                  Validation
                </strong>

                <span>
                  Evaluate model performance
                </span>

              </div>


              <div className="model-step">

                <div className="model-step-number">
                  4
                </div>

                <strong>
                  Deployment
                </strong>

                <span>
                  Publish validated model
                </span>

              </div>


            </div>

          </div>


          {/* MODEL PERFORMANCE */}

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
                    Model Status
                  </span>

                  <strong>
                    {modelLoaded
                      ? "Active"
                      : "Offline"}
                  </strong>

                  <small>
                    Backend model availability
                  </small>

                </div>

              </div>


              <div className="operational-card">

                <div className="operational-icon">
                  📈
                </div>

                <div>

                  <span>
                    Dataset Size
                  </span>

                  <strong>
                    {datasetRecords.toLocaleString()}
                  </strong>

                  <small>
                    Backend records
                  </small>

                </div>

              </div>


              <div className="operational-card">

                <div className="operational-icon">
                  🧠
                </div>

                <div>

                  <span>
                    Model Type
                  </span>

                  <strong>
                    Delay Risk
                  </strong>

                  <small>
                    Acquisition delay prediction
                  </small>

                </div>

              </div>


            </div>

          </div>


          {/* BACKEND STATUS */}

          <div className="info-banner">

            <strong>
              Backend Integration Active
            </strong>

            <p>

              Model Center is connected to the FastAPI
              backend and reading live model information
              from the project dataset.

            </p>

          </div>


        </section>

      </main>

    </div>

  );

}


export default ModelCenter;