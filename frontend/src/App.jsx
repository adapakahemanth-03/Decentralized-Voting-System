import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AddVoter from "./pages/AddVoter";
import AddCandidate from "./pages/AddCandidate";
import Results from "./pages/Results";
import VoterPage from "./pages/VoterPage";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  if (!token) return <Navigate to="/admin" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VoterPage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/add-voter" element={<ProtectedRoute><AddVoter /></ProtectedRoute>} />
        <Route path="/admin/add-candidate" element={<ProtectedRoute><AddCandidate /></ProtectedRoute>} />
        <Route path="/admin/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
