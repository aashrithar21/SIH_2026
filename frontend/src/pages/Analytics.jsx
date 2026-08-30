import { useEffect, useState } from "react";

import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

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

function Analytics() {

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    fetch(`${API_URL}/analytics`)
      .then((response) => {

        if (!response.ok) {
          throw new Error("Failed to load analytics");
        }

        return response.json();
      })
      .then((data) => {

        setAnalytics(data);
        setLoading(false);

      })
      .catch((err) => {

        console.error(err);

        setError(
          "Unable to connect to backend."
        );

        setLoading(false);
      });

  }, []);


  if (loading) {

    return (
      <div className="app-layout">

        <Sidebar />

        <main className="main-content">

          <Navbar />

          <section className="dashboard">

            <h1>Analytics</h1>

            <p>
              Loading analytics from 12,000 projects...
            </p>

          </section>

        </main>

      </div>
    );
  }


  if (error) {

    return (
      <div className="app-layout">

        <Sidebar />

        <main className="main-content">

          <Navbar />

          <section className="dashboard">

            <h1>Analytics</h1>

            <div
              style={{
                padding: "20px",
                background: "#fee2e2",
                color: "#991b1b",
                borderRadius: "8px",
              }}
            >
              {error}
            </div>

          </section>

        </main>

      </div>
    );
  }


  const summary = analytics?.summary || {};

  const stateData =
    analytics?.state_statistics || [];

  const districtData =
    analytics?.district_statistics || [];

  const projectTypeData =
    analytics?.project_type_statistics || [];


  return (

    <div className="app-layout">

      <Sidebar />

      <main className="main-content">

        <Navbar />

        <section className="dashboard">

          <div className="page-title">

            <h1>Analytics</h1>

            <p>
              Predictive analytics across the complete
              land acquisition dataset
            </p>

          </div>


          {/* SUMMARY */}

          <div className="stats-grid">

            <div className="stat-card">

              <h3>Total Projects</h3>

              <strong>
                {summary.total_projects?.toLocaleString()}
              </strong>

            </div>


            <div className="stat-card">

              <h3>Delayed Projects</h3>

              <strong>
                {summary.delayed_projects?.toLocaleString()}
              </strong>

            </div>


            <div className="stat-card">

              <h3>Not Delayed</h3>

              <strong>
                {summary.not_delayed_projects?.toLocaleString()}
              </strong>

            </div>


            <div className="stat-card">

              <h3>Overall Delay Rate</h3>

              <strong>
                {summary.delay_rate}%
              </strong>

            </div>

          </div>


          {/* STATE ANALYSIS */}

          <div className="dashboard-section">

            <h2>
              State-wise Delay Analysis
            </h2>

            <p className="section-description">
              Delay rate calculated from the complete
              dataset
            </p>

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height={350}
              >

                <BarChart data={stateData}>

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

                  <Tooltip />

                  <Bar
                    dataKey="delay_rate"
                    name="Delay Rate"
                    radius={[6, 6, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>


          {/* STATE TABLE */}

          <div className="dashboard-section">

            <h2>
              State Statistics
            </h2>

            <div className="project-table-wrapper">

              <table className="project-table">

                <thead>

                  <tr>

                    <th>State</th>

                    <th>Total Projects</th>

                    <th>Delayed</th>

                    <th>Delay Rate</th>

                    <th>Avg Delay</th>

                  </tr>

                </thead>

                <tbody>

                  {stateData.map((item) => (

                    <tr key={item.state}>

                      <td>
                        {item.state}
                      </td>

                      <td>
                        {Number(
                          item.total_projects
                        ).toLocaleString()}
                      </td>

                      <td>
                        {Number(
                          item.delayed_projects
                        ).toLocaleString()}
                      </td>

                      <td>
                        {item.delay_rate}%
                      </td>

                      <td>
                        {Number(
                          item.average_delay_days
                        ).toFixed(1)} days
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>


          {/* DISTRICT ANALYSIS */}

          <div className="dashboard-section">

            <h2>
              District-wise Analysis
            </h2>

            <div className="project-table-wrapper">

              <table className="project-table">

                <thead>

                  <tr>

                    <th>District</th>

                    <th>Total Projects</th>

                    <th>Delayed</th>

                    <th>Delay Rate</th>

                    <th>Avg Delay</th>

                  </tr>

                </thead>

                <tbody>

                  {districtData.map((item) => (

                    <tr key={item.district}>

                      <td>
                        {item.district}
                      </td>

                      <td>
                        {Number(
                          item.total_projects
                        ).toLocaleString()}
                      </td>

                      <td>
                        {Number(
                          item.delayed_projects
                        ).toLocaleString()}
                      </td>

                      <td>
                        {item.delay_rate}%
                      </td>

                      <td>
                        {Number(
                          item.average_delay_days
                        ).toFixed(1)} days
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>


          {/* PROJECT TYPE */}

          <div className="dashboard-section">

            <h2>
              Project Type Analysis
            </h2>

            <div className="project-table-wrapper">

              <table className="project-table">

                <thead>

                  <tr>

                    <th>Project Type</th>

                    <th>Total</th>

                    <th>Delayed</th>

                    <th>Delay Rate</th>

                  </tr>

                </thead>

                <tbody>

                  {projectTypeData.map((item) => (

                    <tr key={item.project_type}>

                      <td>
                        {item.project_type}
                      </td>

                      <td>
                        {Number(
                          item.total_projects
                        ).toLocaleString()}
                      </td>

                      <td>
                        {Number(
                          item.delayed_projects
                        ).toLocaleString()}
                      </td>

                      <td>
                        {item.delay_rate}%
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

export default Analytics;