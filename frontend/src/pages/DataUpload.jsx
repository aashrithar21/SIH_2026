import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

const API_URL = "http://127.0.0.1:8000";

function DataUpload() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================================
  // CHECK LOGGED-IN USER
  // ==========================================================

  const userData = localStorage.getItem("user");

  let user = null;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch {
    user = null;
  }

  const isAdmin = user?.role === "Administrator";

  // ==========================================================
  // BLOCK NON-ADMIN USERS
  // ==========================================================

  if (!isAdmin) {
    return (
      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <Navbar />

          <section className="dashboard">

            <div className="page-title">
              <h1>Data Management</h1>

              <p>
                Dataset administration and project data upload
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
              <h2>Access Restricted</h2>

              <p>
                Only Administrators are authorized to upload
                project datasets.
              </p>

              <button
                onClick={() => navigate("/dashboard")}
                style={{
                  marginTop: "15px",
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "6px",
                  background: "#2563eb",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                ← Back to Dashboard
              </button>
            </div>

          </section>
        </main>
      </div>
    );
  }

  // ==========================================================
  // FILE SELECTION
  // ==========================================================

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    setMessage("");
    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Only CSV files
    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setFile(null);

      event.target.value = "";

      setError("Only CSV files are allowed.");

      return;
    }

    setFile(selectedFile);
  };

  // ==========================================================
  // UPLOAD DATASET
  // ==========================================================

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");
      setError("");

      const formData = new FormData();

      formData.append("file", file);

      // Send logged-in role to backend
      formData.append("role", user.role);

      // IMPORTANT:
      // Backend endpoint is /upload-dataset
      const response = await fetch(
        `${API_URL}/upload-dataset`,
        {
          method: "POST",
          body: formData,
        }
      );

      // Try to read backend response
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.message ||
          "Dataset upload failed."
        );
      }

      // Successful upload
      setMessage(
        `Successfully uploaded ${
          data.inserted_records ??
          data.uploaded_records ??
          data.records_added ??
          0
        } project records.`
      );

      // Clear selected file
      setFile(null);

      const input =
        document.getElementById("dataset-file");

      if (input) {
        input.value = "";
      }

    } catch (err) {
      console.error("Upload error:", err);

      setError(
        err.message ||
        "Unable to upload dataset. Make sure the FastAPI backend is running."
      );

    } finally {
      setUploading(false);
    }
  };

  // ==========================================================
  // PAGE
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
              ADMINISTRATION
            </span>

            <h1>
              Data Management
            </h1>

            <p>
              Upload new land acquisition project data
              for analysis and prediction.
            </p>

          </div>


          {/* ==================================================
              UPLOAD SECTION
          ================================================== */}

          <div className="dashboard-section">

            <div className="section-header">

              <div>

                <h2>
                  Upload Project Dataset
                </h2>

                <p className="section-description">
                  Add new project records to the existing
                  land acquisition dataset.
                </p>

              </div>

              <span className="status-badge online">
                ● Administrator
              </span>

            </div>


            {/* ==================================================
                CSV REQUIREMENTS
            ================================================== */}

            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                background: "#eff6ff",
                borderRadius: "10px",
                border: "1px solid #bfdbfe",
                color: "#1e3a8a",
              }}
            >

              <strong>
                CSV Upload Requirements
              </strong>

              <p
                style={{
                  marginBottom: 0,
                  marginTop: "8px",
                }}
              >
                Upload a CSV file containing land acquisition
                project records. The CSV should follow the
                same column structure as the existing dataset.
              </p>

            </div>


            {/* ==================================================
                FILE INPUT
            ================================================== */}

            <div
              style={{
                marginTop: "25px",
                padding: "30px",
                border: "2px dashed #cbd5e1",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >

              <div
                style={{
                  fontSize: "42px",
                  marginBottom: "10px",
                }}
              >
                📁
              </div>

              <h3>
                Select CSV Dataset
              </h3>

              <p
                style={{
                  color: "#64748b",
                }}
              >
                Only .csv files are accepted
              </p>

              <input
                id="dataset-file"
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                style={{
                  marginTop: "15px",
                }}
              />

            </div>


            {/* ==================================================
                SELECTED FILE
            ================================================== */}

            {file && (

              <div
                style={{
                  marginTop: "20px",
                  padding: "15px 20px",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                }}
              >

                <strong>
                  Selected File
                </strong>

                <p
                  style={{
                    marginBottom: "5px",
                    marginTop: "8px",
                  }}
                >
                  {file.name}
                </p>

                <small>
                  {(file.size / 1024).toFixed(2)} KB
                </small>

              </div>

            )}


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  background: "#fee2e2",
                  color: "#991b1b",
                  borderRadius: "8px",
                  border: "1px solid #fecaca",
                }}
              >

                <strong>
                  Upload Error
                </strong>

                <p
                  style={{
                    marginBottom: 0,
                    marginTop: "5px",
                  }}
                >
                  {error}
                </p>

              </div>

            )}


            {/* ==================================================
                SUCCESS
            ================================================== */}

            {message && (

              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  background: "#dcfce7",
                  color: "#166534",
                  borderRadius: "8px",
                  border: "1px solid #bbf7d0",
                }}
              >

                ✓ {message}

                <p
                  style={{
                    marginBottom: 0,
                    marginTop: "8px",
                  }}
                >
                  The uploaded project data can now be
                  viewed in the Projects section.
                </p>

              </div>

            )}


            {/* ==================================================
                UPLOAD BUTTON
            ================================================== */}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              style={{
                marginTop: "20px",
                padding: "12px 22px",
                border: "none",
                borderRadius: "7px",
                background:
                  !file || uploading
                    ? "#94a3b8"
                    : "#2563eb",
                color: "#fff",
                fontWeight: "600",
                cursor:
                  !file || uploading
                    ? "not-allowed"
                    : "pointer",
              }}
            >

              {uploading
                ? "Uploading Dataset..."
                : "Upload Dataset"}

            </button>

          </div>


          {/* ==================================================
              DATA PROCESSING WORKFLOW
          ================================================== */}

          <div className="dashboard-section">

            <h2>
              Data Processing Workflow
            </h2>

            <p className="section-description">
              Uploaded project data becomes available
              across the AcquiVision platform.
            </p>

            <div className="model-workflow">

              <div className="model-step">

                <div className="model-step-number">
                  1.{" "}
                  <strong>
                    CSV Upload
                  </strong>
                </div>

                <span>
                  Administrator uploads project data
                </span>

              </div>

              <br />

              <div className="model-step">

                <div className="model-step-number">
                  2.{" "}
                  <strong>
                    Validation
                  </strong>
                </div>

                <span>
                  Backend checks dataset structure
                </span>

              </div>

              <br />

              <div className="model-step">

                <div className="model-step-number">
                  3.{" "}
                  <strong>
                    AI Prediction
                  </strong>
                </div>

                <span>
                  Delay risk is calculated
                </span>

              </div>

              <br />

              <div className="model-step">

                <div className="model-step-number">
                  4.{" "}
                  <strong>
                    Dashboard
                  </strong>
                </div>

                <span>
                  Data appears in project analytics
                </span>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default DataUpload;