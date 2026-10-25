import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import RoleSwitch from "../components/RoleSwitch";
import { adminLogin, adminRegister } from "../services/api";

export default function AdminLogin() {
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const result = await adminLogin(loginEmail, loginPassword);
      localStorage.setItem("adminToken", result.token);
      localStorage.setItem("adminEmail", result.email);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await adminRegister(regName, regEmail, regPassword);
      setSuccess("Admin account created successfully. Please log in.");
      setActiveTab("login");
      setLoginEmail(regEmail);
      setRegName("");
      setRegEmail("");
      setRegPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function switchTab(tab) {
    setActiveTab(tab);
    setError("");
    setSuccess("");
  }

  return (
    <div className="container-form">
      <Header />
      <RoleSwitch activeRole="admin" />

      <div className="button-group">
        <button
          type="button"
          className={activeTab === "login" ? "btn" : "btn btn-outline"}
          onClick={() => switchTab("login")}
        >
          Login
        </button>
        <button
          type="button"
          className={activeTab === "register" ? "btn" : "btn btn-outline"}
          onClick={() => switchTab("register")}
        >
          Register
        </button>
      </div>

      {error && <div className="msg-error">{error}</div>}
      {success && <div className="msg-success">{success}</div>}

      {activeTab === "login" && (
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="login-email">Email or Username</label>
            <input
              id="login-email"
              type="text"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>
      )}

      {activeTab === "register" && (
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="reg-name">Name</label>
            <input
              id="reg-name"
              type="text"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Please wait..." : "Register"}
          </button>
        </form>
      )}
    </div>
  );
}
