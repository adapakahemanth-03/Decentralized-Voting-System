import { useState, useEffect } from "react";
import { getElectionStatus } from "../services/api";

export default function ElectionStatusCard({ onStatusUpdate, compact = false }) {
  const [electionInfo, setElectionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchStatus() {
    try {
      const data = await getElectionStatus();
      setElectionInfo(data);
      if (onStatusUpdate) {
        onStatusUpdate(data);
      }
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load election status");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
    const syncInterval = setInterval(fetchStatus, 3000);
    return () => clearInterval(syncInterval);
  }, []);

  if (loading && !electionInfo) {
    return (
      <div className="status-card status-loading">
        <div className="status-spinner"></div>
        <span>Checking election status...</span>
      </div>
    );
  }

  if (error && !electionInfo) {
    return (
      <div className="status-card status-error">
        <span className="status-badge badge-error">Status Error</span>
        <p className="status-text">{error}</p>
      </div>
    );
  }

  const isRunning = Boolean(electionInfo?.isRunning || electionInfo?.status === "Running");

  return (
    <div className={`status-card ${isRunning ? "status-running" : "status-setup"} ${compact ? "compact" : ""}`}>
      <div className="status-card-header">
        <div className="status-meta">
          <span className="status-label">Election Status</span>
          <div className="status-badge-wrapper">
            {isRunning ? (
              <span className="status-badge badge-running">
                <span className="dot dot-pulse"></span> VOTING LIVE (ELECTION ACTIVE)
              </span>
            ) : (
              <span className="status-badge badge-setup">
                <span className="dot dot-amber"></span> ELECTION INACTIVE
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="status-body" style={{ padding: "14px 18px" }}>
        {isRunning ? (
          <div style={{ color: "#166534", fontSize: "14px", lineHeight: "1.5" }}>
            <strong>🗳️ Voting is actively open:</strong> Citizens can enter their unique Voter ID, verify details, and cast their ballot. Candidate and voter registration are locked until the election is stopped.
          </div>
        ) : (
          <div style={{ color: "#475569", fontSize: "14px", lineHeight: "1.5" }}>
            <strong>⏸️ Election is currently stopped:</strong> Voting is closed. Admin can freely add voters and candidates, or start the election when ready.
          </div>
        )}
      </div>
    </div>
  );
}
