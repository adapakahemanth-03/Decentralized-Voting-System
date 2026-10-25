import { useState } from "react";
import Header from "../components/Header";
import RoleSwitch from "../components/RoleSwitch";
import ElectionStatusCard from "../components/ElectionStatusCard";
import { voterLookup, getCandidates, castVote } from "../services/api";

export default function VoterPage() {
  const [step, setStep] = useState(1);
  const [voterId, setVoterId] = useState("");
  const [voterInfo, setVoterInfo] = useState(null);
  const [sessionToken, setSessionToken] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [electionData, setElectionData] = useState(null);

  const isElectionLive = Boolean(electionData?.isRunning || electionData?.status === "Running");

  function resetToStart() {
    setStep(1);
    setVoterId("");
    setVoterInfo(null);
    setSessionToken("");
    setCandidates([]);
    setError("");
    setLoading(false);
  }

  async function handleLookup(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!isElectionLive) {
      setError("Voting is currently closed. Election is not active.");
      return;
    }

    setLoading(true);
    try {
      const result = await voterLookup(voterId);
      setSessionToken(result.token);
      setVoterInfo({
        name: result.name,
        doorNumber: result.doorNumber,
        aadharId: result.aadharId,
        address: result.address,
        district: result.district,
        state: result.state,
      });
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    setError("");
    if (!isElectionLive) {
      setError("Election is no longer active. Voting period has expired.");
      return;
    }
    setLoading(true);
    try {
      const result = await getCandidates(sessionToken);
      setCandidates(result.candidates);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(candidateId) {
    setError("");
    if (!isElectionLive) {
      setError("Voting time has expired. Your ballot cannot be cast.");
      return;
    }
    setLoading(true);
    try {
      await castVote(sessionToken, candidateId);
      resetToStart();
      setMessage("✅ Your vote has been cast and recorded on the blockchain! The screen has returned to start for the next voter.");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className={step === 3 ? "container-wide" : "container-form"}>
      <Header />
      <RoleSwitch activeRole="user" />

      {/* Prominent Election Status & 15-Hour Timer */}
      <ElectionStatusCard onStatusUpdate={(data) => setElectionData(data)} />

      {error && <div className="msg-error">{error}</div>}
      {message && <div className="msg-success">{message}</div>}

      {step === 1 && (
        <form onSubmit={handleLookup} className="form-card">
          <h2 style={{ fontSize: "17px", marginBottom: "8px" }}>Voter Identification</h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
            {isElectionLive
              ? "Enter your unique Voter ID to verify your eligibility and cast your vote."
              : "Voting is currently closed. It will open once the administrator starts the election."}
          </p>

          <div className="form-group">
            <label htmlFor="voter-id">Voter ID</label>
            <input
              id="voter-id"
              type="text"
              value={voterId}
              onChange={(e) => setVoterId(e.target.value)}
              disabled={!isElectionLive || loading}
              required
            />
          </div>

          <button
            className="btn"
            type="submit"
            disabled={!isElectionLive || loading}
            style={{ width: "100%" }}
          >
            {loading ? "Verifying..." : !isElectionLive ? "Voting Inactive" : "Continue to Verify"}
          </button>
        </form>
      )}

      {step === 2 && voterInfo && (
        <div className="box-section">
          <h2 style={{ marginBottom: "16px" }}>Verify Voter Details</h2>
          <div className="detail-row">
            <span className="detail-label">Name:</span>
            <span>{voterInfo.name}</span>
          </div>
          {voterInfo.doorNumber && (
            <div className="detail-row">
              <span className="detail-label">Door Number:</span>
              <span>{voterInfo.doorNumber}</span>
            </div>
          )}
          {voterInfo.aadharId && (
            <div className="detail-row">
              <span className="detail-label">Aadhar ID:</span>
              <span>{voterInfo.aadharId}</span>
            </div>
          )}
          {voterInfo.address && (
            <div className="detail-row">
              <span className="detail-label">Address:</span>
              <span>{voterInfo.address}</span>
            </div>
          )}

          <div className="button-group" style={{ marginTop: "20px" }}>
            <button
              className="btn"
              type="button"
              onClick={handleConfirm}
              disabled={!isElectionLive || loading}
            >
              {isElectionLive ? "Confirm & View Candidates" : "Voting Expired"}
            </button>
            <button
              className="btn btn-outline"
              type="button"
              onClick={resetToStart}
              disabled={loading}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="box-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h2>Election Candidates</h2>
            <button className="btn btn-outline" style={{ fontSize: "12px", padding: "4px 10px" }} onClick={resetToStart}>
              Cancel / Exit
            </button>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
            Select one candidate to cast your ballot. Your choice is encrypted and anonymously stored on the blockchain.
          </p>

          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Party</th>
                <th>Symbol</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.party}</td>
                  <td>
                    <span className="symbol-pill">{c.symbol}</span>
                  </td>
                  <td>
                    <button
                      className="btn"
                      type="button"
                      onClick={() => handleVote(c.id)}
                      disabled={!isElectionLive || loading}
                    >
                      {loading ? "Recording..." : !isElectionLive ? "Expired" : "Vote"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

