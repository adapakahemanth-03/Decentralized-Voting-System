import { Link, useNavigate } from "react-router-dom";

export default function AdminNav() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    navigate("/admin");
  }

  return (
    <nav className="admin-nav">
      <Link to="/admin/dashboard">Dashboard</Link>
      <Link to="/admin/add-voter">Add Voter</Link>
      <Link to="/admin/add-candidate">Add Candidate</Link>
      <Link to="/admin/results">Results</Link>
      <button type="button" onClick={handleLogout}>Logout</button>
    </nav>
  );
}
