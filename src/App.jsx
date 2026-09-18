// App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "./Context/UserContext.jsx";

import LandingPage from "./Pages/LandingPage/LandingPage";
import MainDashboard from "./Pages/Dashboard/MainDashboard.jsx";
import StudentDashboard from "./Pages/Dashboard/StudentDashboard.jsx";
import LoginSignup from "./Pages/Auth/Login.jsx";
import SessionHistory from "./Pages/Session-History/SessionHistory";
import Analytics from "./Pages/Analytics/Analytics";
import ResumeManager from "./Pages/ResumeManager/ResumeManager.jsx";
import InterviewPage from "./Pages/Interview/InterviewPage.jsx";
import ProfilePage from "./Pages/Profile/ProfilePage.jsx";
import Test2 from "./test2.jsx";
import { ROUTE_PATHS } from "./Routes/paths.js";

// ---------------------------------------------
// Loading Screen Component (Reusable)
// ---------------------------------------------
const FullScreenLoader = () => (
  <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
    <div className="w-16 h-16 border-4 border-[#E5E7EB] border-t-[#4F46E5] rounded-full animate-spin"></div>
  </div>
);

// ---------------------------------------------
// Protected Route
// ---------------------------------------------
const ProtectedRoute = ({ children }) => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("ProtectedRoute must be used inside UserProvider");
  }

  const { user, loading } = context;

  if (loading) return <FullScreenLoader />;

  if (!user) return <Navigate to={ROUTE_PATHS.LOGIN} replace />;

  return children;
};

// ---------------------------------------------
// Public Route
// ---------------------------------------------
const PublicRoute = ({ children }) => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("PublicRoute must be used inside UserProvider");
  }

  const { user, loading } = context;

  if (loading) return <FullScreenLoader />;

  if (user) return <Navigate to={ROUTE_PATHS.USER_DASHBOARD} replace />;

  return children;
};

// ---------------------------------------------
// Query Param Guard
// ---------------------------------------------
const EnsureQueryParams = ({ children, requiredParams }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  let shouldRedirect = false;

  Object.entries(requiredParams).forEach(([key, value]) => {
    if (searchParams.get(key) !== value) {
      searchParams.set(key, value);
      shouldRedirect = true;
    }
  });

  if (shouldRedirect) {
    const normalizedSearch = searchParams.toString();
    return (
      <Navigate
        to={`${location.pathname}${normalizedSearch ? `?${normalizedSearch}` : ""}`}
        replace
        state={location.state}
      />
    );
  }

  return children;
};

// ---------------------------------------------
// Interview Param Guard
// ---------------------------------------------
const EnsureValidInterviewRoute = ({ children }) => {
  const { interviewId, interviewType } = useParams();
  const isValidMongoObjectId = /^[a-fA-F0-9]{24}$/.test(interviewId || "");
  const validInterviewTypes = new Set(["behavioral", "technical", "coding"]);
  const isValidInterviewType = validInterviewTypes.has((interviewType || "").toLowerCase());

  if (!isValidMongoObjectId || !isValidInterviewType) {
    return <Navigate to={ROUTE_PATHS.USER_START_INTERVIEW} replace />;
  }

  return children;
};

const LegacyInterviewRedirect = () => {
  const { interviewId, interviewType } = useParams();
  return <Navigate to={`/interview/${interviewId}/${interviewType}`} replace />;
};

// ---------------------------------------------
// Routes
// ---------------------------------------------
function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTE_PATHS.HOME} element={
        <PublicRoute>
           <LandingPage />
        </PublicRoute>
        } />

      <Route
        path={ROUTE_PATHS.LOGIN}
        element={
          <PublicRoute>
            <LoginSignup />
          </PublicRoute>
        }
      />

      <Route
        path={ROUTE_PATHS.USER_BASE}
        element={
          <ProtectedRoute>
            <EnsureQueryParams requiredParams={{ user: "true" }}>
              <MainDashboard />
            </EnsureQueryParams>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard?user=true" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="startinterview" element={<InterviewPage />} />
        <Route
          path="interview/:interviewId/:interviewType"
          element={<LegacyInterviewRedirect />}
        />
        <Route path="resume-manager" element={<ResumeManager />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="session-history" element={<SessionHistory />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route
        path="/interview/:interviewId/:interviewType"
        element={
          <ProtectedRoute>
            <EnsureValidInterviewRoute>
              <InterviewPage />
            </EnsureValidInterviewRoute>
          </ProtectedRoute>
        }
      />

      <Route path="/dashboard" element={<Navigate to={ROUTE_PATHS.USER_DASHBOARD} replace />} />
      <Route path="/session-history" element={<Navigate to={ROUTE_PATHS.USER_SESSION_HISTORY} replace />} />
      <Route path="/analytics" element={<Navigate to={ROUTE_PATHS.USER_ANALYTICS} replace />} />
      <Route path="/test2" element={<Test2 />} />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to={ROUTE_PATHS.HOME} replace />} />
    </Routes>
  );
}

// ---------------------------------------------
// Main App
// ---------------------------------------------
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
