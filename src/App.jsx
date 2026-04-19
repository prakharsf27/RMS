import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Candidates from "./pages/Candidates";
import Applications from "./pages/Applications";
import Interviews from "./pages/Interviews";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";
import Notifications from "./pages/Notifications";
import Company from "./pages/Company";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import ResumeAI from "./pages/ResumeAI";
import RecruiterInbox from "./pages/RecruiterInbox";
import InterviewSimulator from "./pages/InterviewSimulator";


function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a global loading spinner
  }

  return (
    <Routes>
      {/* 1. Public Routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />

      {/* 2. Protected Routes (Wrap all internal pages in AppLayout) */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/candidates" element={<Candidates />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/company" element={<Company />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/resume-ai" element={<ResumeAI />} />
        <Route path="/recruiter-inbox" element={<RecruiterInbox />} />
        <Route path="/interview-simulator" element={<InterviewSimulator />} />

        <Route path="/interviews" element={<Interviews />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/audit" element={<Audit />} />
      </Route>
      
      {/* 3. Fallback */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
