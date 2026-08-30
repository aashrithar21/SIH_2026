import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

const API_URL = "http://127.0.0.1:8000";

function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");

  // ============================================================
  // LOAD 12,000 PROJECTS FROM FASTAPI
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
          throw new Error("Backend returned an error");
        }

        const data = await response.json();

        console.log("Projects received:", data);

        setProjects(data.projects || []);
      } catch (err) {
        console.error("Projects API error:", err);

        setError(
          "Unable to load projects. Make sure FastAPI is running on http://127.0.0.1:8000"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // ============================================================
  // RISK SCORE
  // ============================================================

  const getRiskScore = (project) => {
    const delayed = Number(project.delayed);

    if (delayed === 1) {
      return 75;
    }

    return 25;
  };

  // ============================================================
  // RISK LEVEL
  // ============================================================

  const getRiskLevel = (project) => {
    const score = getRiskScore(project);

    if (score >= 70) {
      return "High";
    }

    if (score >= 40) {
      return "Medium";
    }

    return "Low";
  };

  // ============================================================
  // SEARCH + RISK FILTER
  // ============================================================

  const filteredProjects = projects.filter((project) => {
    const searchText = search.toLowerCase().trim();

    const projectId = String(
      project.project_id || ""
    ).toLowerCase();

    const projectType = String(
      project.project_type || ""
    ).toLowerCase();

    const state = String(
      project.state || ""
    ).toLowerCase();

    const district = String(
      project.district || ""
    ).toLowerCase();

    const matchesSearch =
      projectId.includes(searchText) ||
      projectType.includes(searchText) ||
      state.includes(searchText) ||
      district.includes(searchText);

    const riskLevel = getRiskLevel(project);

    const matchesRisk =
      riskFilter === "ALL" ||
      riskLevel.toUpperCase() === riskFilter;

    return matchesSearch && matchesRisk;
  });

  // ============================================================
  // LOADING SCREEN
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
                Projects
              </h1>

              <p>
                Loading 12,000 land acquisition projects...
              </p>

            </div>

            <div
              style={{
                padding: "50px",
                textAlign: "center",
                fontSize: "18px",
              }}
            >
              Loading project dataset...
            </div>

          </section>

        </main>

      </div>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div className="app-layout">

      <Sidebar />

      <main className="main-content">

        <Navbar />

        <section className="dashboard">

          {/* ====================================================
              PAGE HEADER
          ===================================================== */}

          <div className="page-title">

            <h1>
              Projects
            </h1>

            <p>
              Monitor land acquisition projects and delay risks
            </p>

          </div>


          {/* ====================================================
              ERROR
          ===================================================== */}

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


          {/* ====================================================
              SEARCH + FILTER
          ===================================================== */}

          <div
            style={{
              display: "flex",
              gap: "15px",
              marginBottom: "25px",
              flexWrap: "wrap",
            }}
          >

            <input
              type="text"
              placeholder="Search project, state, district..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              style={{
                padding: "12px 15px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                minWidth: "300px",
                fontSize: "14px",
              }}
            />

            <select
              value={riskFilter}
              onChange={(e) =>
                setRiskFilter(e.target.value)
              }
              style={{
                padding: "12px 15px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "14px",
              }}
            >

              <option value="ALL">
                All Risk Levels
              </option>

              <option value="HIGH">
                High Risk
              </option>

              <option value="MEDIUM">
                Medium Risk
              </option>

              <option value="LOW">
                Low Risk
              </option>

            </select>

          </div>


          {/* ====================================================
              PROJECT COUNT
          ===================================================== */}

          <div
            style={{
              marginBottom: "15px",
              fontWeight: "600",
            }}
          >
            Showing{" "}
            {filteredProjects.length.toLocaleString()}{" "}
            of{" "}
            {projects.length.toLocaleString()}{" "}
            projects
          </div>


          {/* ====================================================
              PROJECT TABLE
          ===================================================== */}

          {!error && (
            <div className="dashboard-section">

              <div className="project-table-wrapper">

                <table className="project-table">

                  <thead>

                    <tr>

                      <th>
                        Project ID
                      </th>

                      <th>
                        Project Type
                      </th>

                      <th>
                        Location
                      </th>

                      <th>
                        Land Area
                      </th>

                      <th>
                        Affected Families
                      </th>

                      <th>
                        Delay Days
                      </th>

                      <th>
                        Risk Score
                      </th>

                      <th>
                        Risk Level
                      </th>

                      <th>
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredProjects.map(
                      (project) => {

                        const riskScore =
                          getRiskScore(project);

                        const riskLevel =
                          getRiskLevel(project);

                        return (
                          <tr
                            key={project.project_id}
                          >

                            {/* PROJECT ID */}

                            <td>

                              <strong>
                                {project.project_id}
                              </strong>

                            </td>


                            {/* PROJECT TYPE */}

                            <td>
                              {project.project_type}
                            </td>


                            {/* LOCATION */}

                            <td>

                              <div>
                                {project.district}
                              </div>

                              <div className="project-state">
                                {project.state}
                              </div>

                            </td>


                            {/* LAND AREA */}

                            <td>

                              {Number(
                                project.land_area_hectares
                              ).toFixed(2)}{" "}
                              ha

                            </td>


                            {/* AFFECTED FAMILIES */}

                            <td>

                              {Number(
                                project.affected_families
                              ).toLocaleString()}

                            </td>


                            {/* DELAY DAYS */}

                            <td>

                              {Number(
                                project.delay_days || 0
                              )}{" "}
                              days

                            </td>


                            {/* RISK SCORE */}

                            <td>

                              <div className="risk-score">

                                <strong>
                                  {riskScore}%
                                </strong>

                                <div className="risk-progress">

                                  <div
                                    className="risk-progress-fill"
                                    style={{
                                      width:
                                        `${riskScore}%`,
                                    }}
                                  />

                                </div>

                              </div>

                            </td>


                            {/* RISK LEVEL */}

                            <td>

                              <span
                                className={`risk-badge ${riskLevel.toLowerCase()}`}
                              >
                                {riskLevel}
                              </span>

                            </td>


                            {/* ACTION */}

                            <td>

                              <button
                                className="view-button"
                                onClick={() =>
                                  navigate(
                                    `/projects/${project.project_id}`
                                  )
                                }
                              >
                                View Details
                              </button>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}


          {/* ====================================================
              NO RESULTS
          ===================================================== */}

          {!error &&
            filteredProjects.length === 0 && (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                }}
              >
                No projects found.
              </div>
            )}

        </section>

      </main>

    </div>
  );
}

export default Projects;