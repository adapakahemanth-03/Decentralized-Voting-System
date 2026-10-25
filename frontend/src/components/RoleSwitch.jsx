import { useNavigate } from "react-router-dom";

export default function RoleSwitch({ activeRole }) {
  const navigate = useNavigate();

  return (
    <div className="button-group">
      <button
        type="button"
        className={activeRole === "user" ? "btn" : "btn btn-outline"}
        onClick={() => navigate("/")}
      >
        User
      </button>
      <button
        type="button"
        className={activeRole === "admin" ? "btn" : "btn btn-outline"}
        onClick={() => navigate("/admin")}
      >
        Admin
      </button>
    </div>
  );
}
