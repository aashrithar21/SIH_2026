import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/Statcard";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = "http://127.0.0.1:8000";

function Dashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD ALL PROJECTS FROM BACKEND
  // ==========================================

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

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
          "Unable to connect to backend. Make sure FastAPI is running on port 8000."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // ==========================================
  // RISK CALCULATIONS
  // ==========================================

  const getRiskScore = (project) => {
    const delayed = Number(project.delayed);

    if (delayed === 1) {
      return 75;
    }

    return 25;
  };

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

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================

  const totalProjects = projects.length;

  const highRiskProjects = projects.filter(
    (project) => getRiskLevel(project) === "High"
  ).length;

  const criticalProjects = projects.filter(
    (project) => Number(project.delayed) === 1
  ).length;

  const averageRisk =
    totalProjects > 0
      ? Math.round(
          projects.reduce(
            (total, project) =>
              total + getRiskScore(project),
            0
          ) / totalProjects
        )
      : 0;

  // ==========================================
  // STATE-WISE RISK DATA
  // ==========================================

  const stateRiskData = Object.values(
    projects.reduce((acc, project) => {
      const state = project.state || "Unknown";

      if (!acc[state]) {
        acc[state] = {
          state,
          total: 0,
          delayed: 0,
        };
      }

      acc[state].total += 1;

      if (Number(project.delayed) === 1) {
        acc[state].delayed += 1;
      }

      return acc;
    }, {})
  )
    .map((item) => ({
      state: item.state,
      risk:
        item.total > 0
          ? Math.round(
              (item.delayed / item.total) * 100
            )
          : 0,
    }))
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 10);

  // ==========================================
  // HIGH-RISK PROJECTS
  // ==========================================

  const highRiskList = projects
    .filter(
      (project) =>
        getRiskLevel(project) === "High"
    )
    .slice(0, 10);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <Navbar />

          <section className="dashboard">
            <div className="page-title">
              <h1>Dashboard</h1>
              <p>
                Loading land acquisition project data...
              </p>
            </div>

            <div
              style={{
                padding: "50px",
                textAlign: "center",
              }}
            >
              Loading 12,000 projects...
            </div>
          </section>
        </main>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <div className="app-layout">

      <Sidebar />

      <main className="main-content">

        <Navbar />

        <section className="dashboard">

          {/* PAGE TITLE */}

          <div className="page-title">

            <h1>Dashboard</h1>

            <p>
              Monitor and predict land acquisition delays
            </p>

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

          {/* STATISTICS */}

          <div className="stats-grid">

            <StatCard
              title="Total Projects"
              value={totalProjects.toLocaleString()}
              description="Projects monitored"
            />

            <StatCard
              title="High Risk"
              value={highRiskProjects.toLocaleString()}
              description="Projects requiring attention"
            />

            <StatCard
              title="Delayed Projects"
              value={criticalProjects.toLocaleString()}
              description="Projects marked as delayed"
            />

            <StatCard
              title="Average Risk"
              value={`${averageRisk}%`}
              description="Overall delay risk"
            />

          </div>

          {/* STATE-WISE CHART */}

          <div className="dashboard-section">

            <h2>
              State-wise Risk Analysis
            </h2>

            <p className="section-description">
              Delay rate calculated from the complete training dataset
            </p>

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <BarChart
                  data={stateRiskData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 10,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="state"
                  />

                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value) =>
                      `${value}%`
                    }
                  />

                  <Tooltip
                    formatter={(value) => [
                      `${value}%`,
                      "Delay Rate",
                    ]}
                  />

                  <Bar
                    dataKey="risk"
                    name="Delay Risk"
                    radius={[6, 6, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* HIGH RISK PROJECTS */}

          <div className="dashboard-section">

            <div className="section-header">

              <div>

                <h2>
                  High Risk Projects
                </h2>

                <p className="section-description">
                  Projects requiring monitoring and intervention
                </p>

              </div>

              <span className="project-count">
                {highRiskProjects} Projects
              </span>

            </div>

            <div className="project-table-wrapper">

              <table className="project-table">

                <thead>

                  <tr>

                    <th>
                      Project
                    </th>

                    <th>
                      Location
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

                  {highRiskList.map((project) => {

                    const riskScore =
                      getRiskScore(project);

                    const riskLevel =
                      getRiskLevel(project);

                    return (
                      <tr
                        key={project.project_id}
                      >

                        <td>

                          <div className="project-name">
                            {project.project_id}
                          </div>

                          <div className="project-id">
                            ID: {project.project_id}
                          </div>

                        </td>

                        <td>

                          <div>
                            {project.district}
                          </div>

                          <div className="project-state">
                            {project.state}
                          </div>

                        </td>

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

                        <td>

                          <span
                            className={`risk-badge ${riskLevel.toLowerCase()}`}
                          >
                            {riskLevel}
                          </span>

                        </td>

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
                  })}

                </tbody>

              </table>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;