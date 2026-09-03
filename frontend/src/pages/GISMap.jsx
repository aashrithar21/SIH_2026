import { useEffect, useMemo, useState } from "react";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";


// =====================================================
// DEMO PROJECT DATA
// =====================================================

const DEMO_PROJECTS = [
  {
    id: 1,
    project_name: "NH-48 Highway Expansion",
    state: "Rajasthan",
    district: "Jaipur",
    latitude: 26.9124,
    longitude: 75.7873,
    risk_score: 86,
    predicted_delay_days: 145,
    status: "High Risk",
  },

  {
    id: 2,
    project_name: "Western Railway Corridor",
    state: "Maharashtra",
    district: "Mumbai",
    latitude: 19.076,
    longitude: 72.8777,
    risk_score: 72,
    predicted_delay_days: 98,
    status: "High Risk",
  },

  {
    id: 3,
    project_name: "Chennai Outer Ring Road",
    state: "Tamil Nadu",
    district: "Chennai",
    latitude: 13.0827,
    longitude: 80.2707,
    risk_score: 64,
    predicted_delay_days: 76,
    status: "Medium Risk",
  },

  {
    id: 4,
    project_name: "Delhi Freight Corridor",
    state: "Delhi",
    district: "New Delhi",
    latitude: 28.6139,
    longitude: 77.209,
    risk_score: 48,
    predicted_delay_days: 51,
    status: "Medium Risk",
  },

  {
    id: 5,
    project_name: "Nagpur Metro Extension",
    state: "Maharashtra",
    district: "Nagpur",
    latitude: 21.1458,
    longitude: 79.0882,
    risk_score: 58,
    predicted_delay_days: 63,
    status: "Medium Risk",
  },

  {
    id: 6,
    project_name: "Bengaluru Ring Road",
    state: "Karnataka",
    district: "Bengaluru",
    latitude: 12.9716,
    longitude: 77.5946,
    risk_score: 35,
    predicted_delay_days: 32,
    status: "Low Risk",
  },

  {
    id: 7,
    project_name: "Hyderabad Regional Road",
    state: "Telangana",
    district: "Hyderabad",
    latitude: 17.385,
    longitude: 78.4867,
    risk_score: 61,
    predicted_delay_days: 71,
    status: "Medium Risk",
  },

  {
    id: 8,
    project_name: "Ahmedabad Freight Link",
    state: "Gujarat",
    district: "Ahmedabad",
    latitude: 23.0225,
    longitude: 72.5714,
    risk_score: 43,
    predicted_delay_days: 44,
    status: "Medium Risk",
  },

  {
    id: 9,
    project_name: "Kolkata Metro Expansion",
    state: "West Bengal",
    district: "Kolkata",
    latitude: 22.5726,
    longitude: 88.3639,
    risk_score: 29,
    predicted_delay_days: 25,
    status: "Low Risk",
  },

  {
    id: 10,
    project_name: "Pune Expressway Extension",
    state: "Maharashtra",
    district: "Pune",
    latitude: 18.5204,
    longitude: 73.8567,
    risk_score: 68,
    predicted_delay_days: 82,
    status: "Medium Risk",
  },

  {
    id: 11,
    project_name: "Lucknow Infrastructure Corridor",
    state: "Uttar Pradesh",
    district: "Lucknow",
    latitude: 26.8467,
    longitude: 80.9462,
    risk_score: 54,
    predicted_delay_days: 59,
    status: "Medium Risk",
  },

  {
    id: 12,
    project_name: "Bhopal Bypass Project",
    state: "Madhya Pradesh",
    district: "Bhopal",
    latitude: 23.2599,
    longitude: 77.4126,
    risk_score: 31,
    predicted_delay_days: 28,
    status: "Low Risk",
  },
];


// =====================================================
// RISK COLOR
// =====================================================

function getRiskColor(score) {
  const value = Number(score);

  if (value >= 70) {
    return "#dc2626";
  }

  if (value >= 40) {
    return "#f59e0b";
  }

  return "#16a34a";
}


// =====================================================
// RISK LABEL
// =====================================================

function getRiskLabel(score) {
  const value = Number(score);

  if (value >= 70) {
    return "High Risk";
  }

  if (value >= 40) {
    return "Medium Risk";
  }

  return "Low Risk";
}


// =====================================================
// CONVERT RISK TEXT TO SCORE
// =====================================================

function riskTextToScore(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).toLowerCase().trim();

  if (text.includes("high") || text.includes("critical")) {
    return 80;
  }

  if (text.includes("medium") || text.includes("moderate")) {
    return 55;
  }

  if (text.includes("low")) {
    return 25;
  }

  return null;
}


// =====================================================
// EXTRACT RISK SCORE
// =====================================================

function extractRiskScore(project) {

  const possibleValues = [
    project.risk_score,
    project.riskScore,
    project.predicted_risk,
    project.predictedRisk,
    project.risk_percentage,
    project.riskPercentage,
    project.risk_probability,
    project.riskProbability,
    project.prediction_score,
    project.predictionScore,
    project.delay_risk,
    project.delayRisk,
  ];

  for (const value of possibleValues) {

    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      !Number.isNaN(Number(value))
    ) {

      let score = Number(value);

      // If backend gives probability between 0 and 1
      if (score > 0 && score <= 1) {
        score = score * 100;
      }

      return Math.max(0, Math.min(100, score));
    }
  }


  // Try risk text fields

  const possibleRiskText = [
    project.status,
    project.risk_level,
    project.riskLevel,
    project.risk_category,
    project.riskCategory,
    project.risk_label,
    project.riskLabel,
    project.prediction,
  ];

  for (const value of possibleRiskText) {

    const converted = riskTextToScore(value);

    if (converted !== null) {
      return converted;
    }
  }


  return null;
}


// =====================================================
// MAP FIT COMPONENT
// =====================================================

function FitMapToProjects({ projects }) {

  const map = useMap();

  useEffect(() => {

    if (!projects || projects.length === 0) {
      return;
    }

    const validProjects = projects.filter(
      (project) =>
        Number.isFinite(Number(project.latitude)) &&
        Number.isFinite(Number(project.longitude))
    );

    if (validProjects.length === 0) {
      return;
    }

    const bounds = validProjects.map((project) => [
      Number(project.latitude),
      Number(project.longitude),
    ]);

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 6,
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 300);

  }, [projects, map]);

  return null;
}


// =====================================================
// NORMALIZE BACKEND DATA
// =====================================================

function normalizeProject(project, index) {

  const latitude =
    project.latitude ??
    project.lat ??
    project.location?.latitude ??
    project.location?.lat;

  const longitude =
    project.longitude ??
    project.lng ??
    project.lon ??
    project.location?.longitude ??
    project.location?.lng;


  const extractedRiskScore = extractRiskScore(project);


  const riskScore =
    extractedRiskScore !== null
      ? extractedRiskScore
      : 0;


  return {

    id:
      project.id ??
      project.project_id ??
      project.projectId ??
      index + 1,


    project_name:
      project.project_name ??
      project.projectName ??
      project.name ??
      `Land Acquisition Project ${index + 1}`,


    state:
      project.state ??
      project.state_name ??
      "Unknown",


    district:
      project.district ??
      project.district_name ??
      "Unknown",


    latitude: Number(latitude),

    longitude: Number(longitude),


    risk_score: Number(riskScore),


    predicted_delay_days:
      project.predicted_delay_days ??
      project.predictedDelayDays ??
      project.delay_days ??
      project.delay ??
      0,


    status:
      getRiskLabel(riskScore),

  };
}


// =====================================================
// MAIN COMPONENT
// =====================================================

function GISMap() {

  const [projects, setProjects] = useState(DEMO_PROJECTS);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [riskFilter, setRiskFilter] = useState("all");

  const [search, setSearch] = useState("");


  // ===================================================
  // LOAD PROJECT DATA
  // ===================================================

  useEffect(() => {

    let cancelled = false;


    async function loadProjects() {

      setLoading(true);

      setError("");


      const endpoints = [
        "http://localhost:8000/projects",
        "http://localhost:8000/api/projects",
        "http://localhost:8000/gis/projects",
      ];


      for (const endpoint of endpoints) {

        try {

          const response = await fetch(endpoint);


          if (!response.ok) {
            continue;
          }


          const data = await response.json();


          let records = [];


          if (Array.isArray(data)) {

            records = data;

          } else if (Array.isArray(data.projects)) {

            records = data.projects;

          } else if (Array.isArray(data.data)) {

            records = data.data;

          } else if (Array.isArray(data.results)) {

            records = data.results;

          }


          if (records.length > 0) {

            const normalized = records
              .map(normalizeProject)
              .filter(
                (project) =>
                  Number.isFinite(project.latitude) &&
                  Number.isFinite(project.longitude)
              );


            if (
              !cancelled &&
              normalized.length > 0
            ) {

              // =========================================
              // CHECK WHETHER BACKEND HAS REAL RISK DATA
              // =========================================

              const hasRiskInformation = normalized.some(
                (project) =>
                  Number(project.risk_score) > 0
              );


              if (hasRiskInformation) {

                setProjects(normalized);

                setLoading(false);

                return;

              }


              // =========================================
              // BACKEND HAS LOCATIONS BUT NO RISK DATA
              // =========================================

              setProjects(DEMO_PROJECTS);

              setError(
                "Live project locations loaded, but risk predictions are unavailable. Showing demonstration risk predictions."
              );

              setLoading(false);

              return;

            }

          }

        } catch {

          // Try next endpoint

        }

      }


      // ===============================================
      // BACKEND UNAVAILABLE
      // ===============================================

      if (!cancelled) {

        setProjects(DEMO_PROJECTS);

        setError(
          "Live project data unavailable. Showing demonstration project locations."
        );

        setLoading(false);

      }

    }


    loadProjects();


    return () => {
      cancelled = true;
    };

  }, []);


  // ===================================================
  // FILTER PROJECTS
  // ===================================================

  const filteredProjects = useMemo(() => {

    return projects.filter((project) => {

      const score = Number(project.risk_score);


      let riskMatch = true;


      if (riskFilter === "high") {

        riskMatch = score >= 70;

      }


      if (riskFilter === "medium") {

        riskMatch =
          score >= 40 &&
          score < 70;

      }


      if (riskFilter === "low") {

        riskMatch = score < 40;

      }


      const searchText =
        search.toLowerCase().trim();


      const searchMatch =
        !searchText ||
        project.project_name
          .toLowerCase()
          .includes(searchText) ||
        project.state
          .toLowerCase()
          .includes(searchText) ||
        project.district
          .toLowerCase()
          .includes(searchText);


      return riskMatch && searchMatch;

    });

  }, [projects, riskFilter, search]);


  // ===================================================
  // STATISTICS
  // ===================================================

  const highRiskCount = projects.filter(
    (project) =>
      Number(project.risk_score) >= 70
  ).length;


  const mediumRiskCount = projects.filter(
    (project) =>
      Number(project.risk_score) >= 40 &&
      Number(project.risk_score) < 70
  ).length;


  const lowRiskCount = projects.filter(
    (project) =>
      Number(project.risk_score) < 40
  ).length;


  // ===================================================
  // MAP CENTER
  // ===================================================

  const center = [22.5, 78.9];


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <div
      className="gis-page"
      style={{
        padding: "24px",
        background: "#f5f7fb",
        minHeight: "100%",
      }}
    >

      {/* =============================================
          HEADER
      ============================================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          marginBottom: "18px",
          flexWrap: "wrap",
        }}
      >

        <div>

          <div
            style={{
              fontSize: "14px",
              color: "#64748b",
              marginBottom: "5px",
              fontWeight: 500,
            }}
          >
            GEOGRAPHIC INTELLIGENCE
          </div>


          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              color: "#0f2747",
            }}
          >
            Project Risk Map
          </h1>


          <p
            style={{
              marginTop: "7px",
              color: "#64748b",
            }}
          >
            View land acquisition projects and
            their predicted risk geographically.
          </p>

        </div>


        {/* SEARCH */}

        <input
          type="text"
          placeholder="Search project or location..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            width: "270px",
            padding: "12px 14px",
            borderRadius: "9px",
            border: "1px solid #d6deea",
            outline: "none",
            background: "white",
            fontSize: "14px",
          }}
        />

      </div>


      {/* =============================================
          MESSAGE
      ============================================= */}

      {error && (

        <div
          style={{
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            color: "#9a3412",
            padding: "11px 14px",
            borderRadius: "8px",
            marginBottom: "15px",
            fontSize: "13px",
          }}
        >
          {error}
        </div>

      )}


      {/* =============================================
          STAT CARDS
      ============================================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "12px",
          marginBottom: "18px",
        }}
      >

        <div className="gis-stat-card">
          <strong>{projects.length}</strong>
          <span>Total Projects</span>
        </div>


        <div className="gis-stat-card">
          <strong>{highRiskCount}</strong>
          <span>High Risk</span>
        </div>


        <div className="gis-stat-card">
          <strong>{mediumRiskCount}</strong>
          <span>Medium Risk</span>
        </div>


        <div className="gis-stat-card">
          <strong>{lowRiskCount}</strong>
          <span>Low Risk</span>
        </div>

      </div>


      {/* =============================================
          FILTERS
      ============================================= */}

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "14px",
          flexWrap: "wrap",
        }}
      >

        <button
          onClick={() =>
            setRiskFilter("all")
          }
          className={
            riskFilter === "all"
              ? "gis-filter active"
              : "gis-filter"
          }
        >
          All Projects
        </button>


        <button
          onClick={() =>
            setRiskFilter("high")
          }
          className={
            riskFilter === "high"
              ? "gis-filter active high"
              : "gis-filter"
          }
        >
          🔴 High Risk
        </button>


        <button
          onClick={() =>
            setRiskFilter("medium")
          }
          className={
            riskFilter === "medium"
              ? "gis-filter active medium"
              : "gis-filter"
          }
        >
          🟠 Medium Risk
        </button>


        <button
          onClick={() =>
            setRiskFilter("low")
          }
          className={
            riskFilter === "low"
              ? "gis-filter active low"
              : "gis-filter"
          }
        >
          🟢 Low Risk
        </button>

      </div>


      {/* =============================================
          MAP
      ============================================= */}

      <div
        style={{
          background: "white",
          borderRadius: "14px",
          padding: "8px",
          boxShadow:
            "0 3px 18px rgba(15, 39, 71, 0.08)",
          overflow: "hidden",
        }}
      >

        <div
          style={{
            position: "relative",
            width: "100%",
            height: "620px",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >

          <MapContainer
            center={center}
            zoom={5}
            minZoom={4}
            maxZoom={12}
            scrollWheelZoom={true}
            style={{
              width: "100%",
              height: "100%",
            }}
          >

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />


            <FitMapToProjects
              projects={filteredProjects}
            />


            {/* =======================================
                PROJECT POINTERS
            ======================================= */}

            {filteredProjects.map((project) => {

              const score =
                Number(project.risk_score);


              const riskColor =
                getRiskColor(score);


              return (

                <CircleMarker
                  key={project.id}
                  center={[
                    Number(project.latitude),
                    Number(project.longitude),
                  ]}
                  radius={10}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 3,
                    fillColor: riskColor,
                    fillOpacity: 0.95,
                  }}
                >

                  <Popup>

                    <div
                      style={{
                        minWidth: "220px",
                        fontFamily:
                          "Arial, sans-serif",
                      }}
                    >

                      <h3
                        style={{
                          margin:
                            "0 0 8px",
                          color: "#0f2747",
                          fontSize: "16px",
                        }}
                      >
                        {project.project_name}
                      </h3>


                      <div
                        style={{
                          marginBottom: "8px",
                          color: "#64748b",
                          fontSize: "13px",
                        }}
                      >
                        📍 {project.district},{" "}
                        {project.state}
                      </div>


                      <div
                        style={{
                          background: riskColor,
                          color: "white",
                          padding:
                            "6px 9px",
                          borderRadius: "5px",
                          display:
                            "inline-block",
                          fontSize: "12px",
                          fontWeight: "bold",
                          marginBottom:
                            "10px",
                        }}
                      >
                        {getRiskLabel(score)}
                      </div>


                      <div
                        style={{
                          borderTop:
                            "1px solid #e2e8f0",
                          paddingTop: "8px",
                        }}
                      >

                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            marginBottom: "5px",
                          }}
                        >

                          <span>
                            Risk Score
                          </span>

                          <strong>
                            {score}%
                          </strong>

                        </div>


                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                          }}
                        >

                          <span>
                            Predicted Delay
                          </span>

                          <strong>
                            {
                              project.predicted_delay_days
                            }{" "}
                            days
                          </strong>

                        </div>

                      </div>

                    </div>

                  </Popup>

                </CircleMarker>

              );

            })}

          </MapContainer>


          {/* =========================================
              MAP LEGEND
          ========================================= */}

          <div
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              zIndex: 1000,
              background: "white",
              padding: "13px 16px",
              borderRadius: "9px",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.18)",
              fontSize: "13px",
            }}
          >

            <strong
              style={{
                display: "block",
                marginBottom: "8px",
              }}
            >
              Risk Level
            </strong>


            <div
              style={{
                marginBottom: "5px",
              }}
            >

              <span
                style={{
                  display:
                    "inline-block",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background:
                    "#dc2626",
                  marginRight: "7px",
                }}
              />

              High Risk
            </div>


            <div
              style={{
                marginBottom: "5px",
              }}
            >

              <span
                style={{
                  display:
                    "inline-block",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background:
                    "#f59e0b",
                  marginRight: "7px",
                }}
              />

              Medium Risk
            </div>


            <div>

              <span
                style={{
                  display:
                    "inline-block",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background:
                    "#16a34a",
                  marginRight: "7px",
                }}
              />

              Low Risk

            </div>

          </div>


          {/* =========================================
              LOADING
          ========================================= */}

          {loading && (

            <div
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                zIndex: 1000,
                background: "white",
                padding:
                  "8px 13px",
                borderRadius: "7px",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.15)",
                fontSize: "13px",
              }}
            >
              Loading projects...
            </div>

          )}

        </div>

      </div>


      {/* =============================================
          PROJECT COUNT
      ============================================= */}

      <div
        style={{
          marginTop: "12px",
          color: "#64748b",
          fontSize: "13px",
        }}
      >

        Showing{" "}

        <strong>
          {filteredProjects.length}
        </strong>{" "}

        projects with valid geographic
        coordinates.

      </div>

    </div>

  );
}


export default GISMap;