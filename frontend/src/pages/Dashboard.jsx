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

import { projects } from "../data/mockData";

function Dashboard() {

  // =========================
  // STATE-WISE RISK DATA
  // =========================

  const stateRiskData = [
    {
      state: "Maharashtra",
      risk: 72,
    },
    {
      state: "Karnataka",
      risk: 54,
    },
    {
      state: "Tamil Nadu",
      risk: 64,
    },
    {
      state: "Haryana",
      risk: 48,
    },
  ];


  // =========================
  // DASHBOARD STATISTICS
  // =========================

  const totalProjects = projects.length;

  const highRiskProjects = projects.filter(
    (project) =>
      project.riskLevel === "High" ||
      project.riskLevel === "Critical"
  ).length;

  const criticalProjects = projects.filter(
    (project) =>
      project.riskLevel === "Critical"
  ).length;

  const averageRisk = Math.round(
    projects.reduce(
      (total, project) =>
        total + project.riskScore,
      0
    ) / projects.length
  );


  // =========================
  // VIEW PROJECT
  // =========================

  const handleViewProject = (project) => {

    alert(
      `Project: ${project.name}\n\nRisk Score: ${project.riskScore}%\nRisk Level: ${project.riskLevel}`
    );

  };


  return (

    <div className="app-layout">

      {/* =========================
          SIDEBAR
      ========================= */}

      <Sidebar />


      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="main-content">

        <Navbar />


        <section className="dashboard">


          {/* =========================
              PAGE TITLE
          ========================= */}

          <div className="page-title">

            <h1>
              Dashboard
            </h1>

            <p>
              Monitor and predict land acquisition delays
            </p>

          </div>


          {/* =========================
              STATISTICS
          ========================= */}

          <div className="stats-grid">

            <StatCard
              title="Total Projects"
              value={totalProjects}
              description="Projects monitored"
            />

            <StatCard
              title="High Risk"
              value={highRiskProjects}
              description="Projects requiring attention"
            />

            <StatCard
              title="Critical"
              value={criticalProjects}
              description="Immediate intervention required"
            />

            <StatCard
              title="Average Risk"
              value={`${averageRisk}%`}
              description="Overall delay probability"
            />

          </div>


          {/* =========================
              STATE-WISE RISK CHART
          ========================= */}

          <div className="dashboard-section">

            <h2>
              State-wise Risk Analysis
            </h2>

            <p className="section-description">
              Average predicted delay risk across selected states
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
                    formatter={(value) =>
                      [`${value}%`, "Delay Risk"]
                    }
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


          {/* =========================
              HIGH RISK PROJECTS
          ========================= */}

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

                  {projects
                    .filter(
                      (project) =>
                        project.riskScore >= 60
                    )
                    .map((project) => (

                      <tr
                        key={project.id}
                      >


                        {/* PROJECT */}

                        <td>

                          <div className="project-name">

                            {project.name}

                          </div>

                          <div className="project-id">

                            ID: {project.id}

                          </div>

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


                        {/* RISK SCORE */}

                        <td>

                          <div className="risk-score">

                            <strong>
                              {project.riskScore}%
                            </strong>


                            <div className="risk-progress">

                              <div
                                className="risk-progress-fill"
                                style={{
                                  width: `${project.riskScore}%`,
                                }}
                              />

                            </div>

                          </div>

                        </td>


                        {/* RISK LEVEL */}

                        <td>

                          <span
                            className={`risk-badge ${project.riskLevel.toLowerCase()}`}
                          >

                            {project.riskLevel}

                          </span>

                        </td>


                        {/* ACTION */}

                        <td>

                          <button
                            className="view-button"
                            onClick={() =>
                              handleViewProject(
                                project
                              )
                            }
                          >

                            View

                          </button>

                        </td>

                      </tr>

                    ))}

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