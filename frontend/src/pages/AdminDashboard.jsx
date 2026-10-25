import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminNav from "../components/AdminNav";
import ElectionStatusCard from "../components/ElectionStatusCard";
import { getDashboard, startElection, stopElection } from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [startMsg, setStartMsg] = useState("");
  const [startError, setStartError] = useState("");
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [showConfirmStop, setShowConfirmStop] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const data = await getDashboard();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStart() {
    setStartError("");
    setStartMsg("");

    if (!stats || stats.candidateCount === 0) {
      setStartError("Please add at least one candidate first before starting.");
      return;
    }

    setStarting(true);
    try {
      await startElection(15);
      setStartMsg("Election started! 15-hour countdown is now active.");
      await loadDashboard();
    } catch (err) {
      setStartError(err.message);
    } finally {
      setStarting(false);
    }
  }

  async function handleConfirmStop() {
    setStopping(true);
    setStartError("");
    setStartMsg("");
    try {
      await stopElection();
      setStartMsg("Election has been stopped by admin. Voting is now officially closed.");
      setShowConfirmStop(false);
      await loadDashboard();
    } catch (err) {
      setStartError(err.message);
    } finally {
      setStopping(false);
    }
  }

  return (
    <div className="container-wide">
      <AdminNav />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h1>Admin Control Dashboard</h1>
        <button className="btn btn-outline" style={{ fontSize: "13px" }} onClick={loadDashboard}>
          🔄 Refresh
        </button>
      </div>

      {error && <div className="msg-error">{error}</div>}
      {loading && <div style={{ marginBottom: "20px" }}>Loading dashboard...</div>}

      {stats && !loading && (
        <>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-title">Total Registered Voters</div>
              <div className="stat-num">{stats.totalVoters}</div>
            </div>
            <div className="stat-box">
              <div className="stat-title">Total Ballots Cast</div>
              <div className="stat-num">{stats.totalVotes}</div>
            </div>
            <div className="stat-box">
              <div className="stat-title">Voter Turnout</div>
              <div className="stat-num">{stats.turnout}%</div>
            </div>
            <div className="stat-box">
              <div className="stat-title">Registered Candidates</div>
              <div className="stat-num">{stats.candidateCount}</div>
            </div>
          </div>

          {/* Clean Start / Stop Button Section */}
          <div className="start-election-panel">
            {!stats.isRunning ? (
              <div className="start-action-box">
                {startError && <div className="msg-error">{startError}</div>}
                {startMsg && <div className="msg-success">{startMsg}</div>}
                <button
                  className="btn btn-start-hero"
                  type="button"
                  onClick={handleStart}
                  disabled={stats.candidateCount === 0 || starting}
                >
                  {starting ? "Starting Election..." : "Start Election"}
                </button>
                {stats.candidateCount === 0 && (
                  <p className="start-candidate-hint">
                    Add at least one candidate before starting. <Link to="/admin/add-candidate">Add Candidate</Link>
                  </p>
                )}
              </div>
            ) : (
              <div className="stop-action-box" style={{ textAlign: "center", marginBottom: "16px" }}>
                {startError && <div className="msg-error">{startError}</div>}
                {startMsg && <div className="msg-success">{startMsg}</div>}

                {!showConfirmStop ? (
                  <button
                    className="btn btn-danger-hero"
                    type="button"
                    onClick={() => setShowConfirmStop(true)}
                  >
                    🛑 Stop Election
                  </button>
                ) : (
                  <div className="box-section" style={{ display: "inline-block", maxWidth: "460px", padding: "16px", backgroundColor: "#fef2f2", borderColor: "#fca5a5" }}>
                    <p style={{ fontWeight: 600, color: "#991b1b", marginBottom: "12px" }}>
                      ⚠️ Are you sure you want to stop the election? Voting will close and the system will return to normal.
                    </p>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                      <button
                        className="btn btn-danger-hero"
                        style={{ padding: "8px 18px", fontSize: "14px" }}
                        type="button"
                        onClick={handleConfirmStop}
                        disabled={stopping}
                      >
                        {stopping ? "Stopping..." : "Yes, Stop Election"}
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ padding: "8px 18px", fontSize: "14px" }}
                        type="button"
                        onClick={() => setShowConfirmStop(false)}
                        disabled={stopping}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Directly below the Start/Stop button: Status Card */}
            <ElectionStatusCard onStatusUpdate={() => {}} />

            <div style={{ textAlign: "center", marginTop: "18px" }}>
              <Link to="/admin/results" className="btn btn-outline" style={{ padding: "8px 20px" }}>
                📊 View Election Results
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
