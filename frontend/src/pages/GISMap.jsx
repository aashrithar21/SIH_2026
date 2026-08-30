import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";


// ============================================================
// API
// ============================================================

const API_URL = "http://127.0.0.1:8000";


// ============================================================
// FIX LEAFLET MARKER ICONS
// ============================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});


// ============================================================
// GIS MAP
// ============================================================

function GISMap() {

  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------------------------------------
  // LOAD COMPLETE DATASET
  // ----------------------------------------------------------

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

        setProjects(data.projects || []);

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


  // ----------------------------------------------------------
  // RISK LEVEL
  // ----------------------------------------------------------

  const getRiskLevel = (project) => {

    const delayed = Number(project.delayed);

    return delayed === 1 ? "High" : "Low";

  };


  // ----------------------------------------------------------
  // RISK SCORE
  // ----------------------------------------------------------

  const getRiskScore = (project) => {

    const delayed = Number(project.delayed);

    return delayed === 1 ? 75 : 25;

  };


  // ----------------------------------------------------------
  // VALID COORDINATES
  // ----------------------------------------------------------

  const mapProjects = projects.filter((project) => {

    const latitude = Number(project.latitude);
    const longitude = Number(project.longitude);

    return (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );

  });


  // ----------------------------------------------------------
  // STATISTICS
  // ----------------------------------------------------------

  const highRiskProjects = projects.filter(
    (project) => Number(project.delayed) === 1
  );


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="app-layout">

      <Sidebar />

      <main className="main-content">

        <Navbar />

        <section className="dashboard">

          {/* PAGE HEADER */}

          <div className="page-title">

            <h1>GIS Map</h1>

            <p>
              Geographic view of land acquisition projects
            </p>

          </div>


          {/* LOADING */}

          {loading && (

            <div
              className="dashboard-section"
              style={{
                padding: "30px",
                textAlign: "center",
              }}
            >

              Loading GIS data for{" "}

              <strong>
                12,000 projects
              </strong>

              ...

            </div>

          )}


          {/* ERROR */}

          {error && (

            <div
              className="dashboard-section"
              style={{
                padding: "20px",
                color: "#991b1b",
                background: "#fee2e2",
                borderRadius: "10px",
              }}
            >

              {error}

            </div>

          )}


          {/* MAP */}

          {!loading && !error && (

            <div className="dashboard-section">

              <h2>
                Project Risk Map
              </h2>

              <p className="section-description">

                Showing{" "}

                <strong>
                  {mapProjects.length.toLocaleString()}
                </strong>

                {" "}projects with valid geographic coordinates.

              </p>


              {/* MAP CONTAINER */}

              <div
                style={{
                  width: "100%",
                  height: "600px",
                  marginTop: "20px",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >

                <MapContainer

                  center={[
                    20.5937,
                    78.9629,
                  ]}

                  zoom={5}

                  style={{
                    width: "100%",
                    height: "100%",
                  }}

                >

                  <TileLayer

                    attribution="&copy; OpenStreetMap contributors"

                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                  />


                  {/* ==================================================
                      PROJECT MARKERS
                     ================================================== */}

                  {mapProjects.map((project) => {

                    const latitude =
                      Number(project.latitude);

                    const longitude =
                      Number(project.longitude);

                    const riskLevel =
                      getRiskLevel(project);

                    const riskScore =
                      getRiskScore(project);

                    return (

                      <Marker

                        key={String(project.project_id)}

                        position={[
                          latitude,
                          longitude,
                        ]}

                      >

                        <Popup>

                          <div
                            style={{
                              minWidth: "260px",
                              lineHeight: "1.6",
                            }}
                          >

                            <h3
                              style={{
                                margin:
                                  "0 0 10px 0",
                                color:
                                  "#16213e",
                              }}
                            >

                              {project.project_id}

                            </h3>


                            <div>

                              <strong>
                                Project Type:
                              </strong>{" "}

                              {project.project_type}

                            </div>


                            <div>

                              <strong>
                                Location:
                              </strong>{" "}

                              {project.district},{" "}
                              {project.state}

                            </div>


                            <div>

                              <strong>
                                Land Area:
                              </strong>{" "}

                              {Number(
                                project.land_area_hectares
                              ).toFixed(2)} ha

                            </div>


                            <div>

                              <strong>
                                Affected Families:
                              </strong>{" "}

                              {Number(
                                project.affected_families
                              ).toLocaleString()}

                            </div>


                            <div>

                              <strong>
                                Delay:
                              </strong>{" "}

                              {project.delay_days} days

                            </div>


                            <div>

                              <strong>
                                Risk Score:
                              </strong>{" "}

                              {riskScore}%

                            </div>


                            <div>

                              <strong>
                                Risk Level:
                              </strong>{" "}

                              {riskLevel}

                            </div>


                            <div>

                              <strong>
                                Current Stage:
                              </strong>{" "}

                              {project.current_stage}

                            </div>


                            <div>

                              <strong>
                                Coordinates:
                              </strong>{" "}

                              {latitude.toFixed(4)},{" "}
                              {longitude.toFixed(4)}

                            </div>


                            {/* VIEW DETAILS */}

                            <button

                              onClick={() =>
                                navigate(
                                  `/projects/${encodeURIComponent(
                                    String(project.project_id)
                                  )}`
                                )
                              }

                              style={{
                                marginTop: "12px",
                                width: "100%",
                                padding: "9px 12px",
                                border: "none",
                                borderRadius: "6px",
                                background: "#2563eb",
                                color: "#ffffff",
                                fontWeight: "600",
                                cursor: "pointer",
                              }}

                            >

                              View Project Details

                            </button>

                          </div>

                        </Popup>

                      </Marker>

                    );

                  })}

                </MapContainer>

              </div>


              {/* ==================================================
                  MAP SUMMARY
                 ================================================== */}

              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  marginTop: "20px",
                  flexWrap: "wrap",
                }}
              >

                {/* TOTAL */}

                <div
                  style={{
                    padding: "15px 20px",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                  }}
                >

                  <strong>
                    Total Projects
                  </strong>

                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      marginTop: "5px",
                    }}
                  >

                    {projects.length.toLocaleString()}

                  </div>

                </div>


                {/* MAPPED */}

                <div
                  style={{
                    padding: "15px 20px",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                  }}
                >

                  <strong>
                    Mapped Projects
                  </strong>

                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      marginTop: "5px",
                    }}
                  >

                    {mapProjects.length.toLocaleString()}

                  </div>

                </div>


                {/* HIGH RISK */}

                <div
                  style={{
                    padding: "15px 20px",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                  }}
                >

                  <strong>
                    High Risk / Delayed
                  </strong>

                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      marginTop: "5px",
                    }}
                  >

                    {highRiskProjects.length.toLocaleString()}

                  </div>

                </div>

              </div>

            </div>

          )}

        </section>

      </main>

    </div>

  );

}


export default GISMap;