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
import Landing from "./pages/Landing";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a global loading spinner
  }

  return (
    <Routes>
      {/* 1. Public Routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/landing" element={<Landing />} />

      {/* 2. Protected Routes (Wrap all internal pages in AppLayout) */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/candidates" element={<Candidates />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/company" element={<Company />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/interviews" element={<Interviews />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/audit" element={<Audit />} />
      </Route>
      
      {/* 3. Fallback */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}

export default App;
