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

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      
      {/* Protected Routes Wrapper */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="candidates" element={<Candidates />} />
        <Route path="applications" element={<Applications />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="company" element={<Company />} />
        <Route path="profile" element={<Profile />} />
        <Route path="interviews" element={<Interviews />} />
        <Route path="reports" element={<Reports />} />
        <Route path="audit" element={<Audit />} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

export default App;
