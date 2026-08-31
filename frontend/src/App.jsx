import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Analytics from "./pages/Analytics";
import GISMap from "./pages/GISMap";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import ModelCenter from "./pages/ModelCenter";
import Governance from "./pages/Governance";
import DataUpload from "./pages/DataUpload";

import ProtectedRoute from "./ProtectedRoute";


// ============================================================
// ADMINISTRATOR ROUTE
// ============================================================

function AdministratorRoute({ children }) {

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // Not logged in
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Logged in but not Administrator
  if (user.role !== "Administrator") {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}


// ============================================================
// APP
// ============================================================

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* =====================================================
            LOGIN
        ====================================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={
            <Login />
          }
        />


        {/* =====================================================
            DASHBOARD
        ====================================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            PROJECTS
        ====================================================== */}

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            PROJECT DETAILS

            IMPORTANT:
            Your Projects page navigates using:

            /projects/:id

            Therefore we use "id" here.
        ====================================================== */}

        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectDetails />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            ANALYTICS
        ====================================================== */}

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            GIS MAP
        ====================================================== */}

        <Route
          path="/gis-map"
          element={
            <ProtectedRoute>
              <GISMap />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            ALERTS
        ====================================================== */}

        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            SETTINGS
        ====================================================== */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            MODEL CENTER
        ====================================================== */}

        <Route
          path="/model-center"
          element={
            <ProtectedRoute>
              <ModelCenter />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            GOVERNANCE
        ====================================================== */}

        <Route
          path="/governance"
          element={
            <ProtectedRoute>
              <Governance />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            DATA UPLOAD

            ADMINISTRATOR ONLY
        ====================================================== */}

        <Route
          path="/data-upload"
          element={
            <AdministratorRoute>
              <DataUpload />
            </AdministratorRoute>
          }
        />


        {/* =====================================================
            UNKNOWN URL
        ====================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;