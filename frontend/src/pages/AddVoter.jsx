import { useState, useEffect } from "react";
import AdminNav from "../components/AdminNav";
import { addVoter, getElectionStatus } from "../services/api";

export default function AddVoter() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [doorNumber, setDoorNumber] = useState("");
  const [aadharId, setAadharId] = useState("");
  const [address, setAddress] = useState("");
  const [generatedId, setGeneratedId] = useState("");
  const [registeredVoterName, setRegisteredVoterName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [electionStatus, setElectionStatus] = useState("Setup");

  useEffect(() => {
    checkElectionStatus();
  }, []);

  async function checkElectionStatus() {
    try {
      const data = await getElectionStatus();
      setElectionStatus(data.isRunning ? "Running" : "Setup");
    } catch (_) {}
  }

  const isLocked = electionStatus === "Running";

  function handleClose() {
    setGeneratedId("");
    setRegisteredVoterName("");
    setName("");
    setAge("");
    setDoorNumber("");
    setAadharId("");
    setAddress("");
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setGeneratedId("");

    if (isLocked) {
      setError("Voter registration is locked while the election is active.");
      return;
    }

    setLoading(true);
    try {
      const result = await addVoter(
        name,
        parseInt(age, 10),
        doorNumber,
        aadharId,
        address
      );
      setGeneratedId(result.voterId);
      setRegisteredVoterName(name.trim());
      setName("");
      setAge("");
      setDoorNumber("");
      setAadharId("");
      setAddress("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-wide">
      <AdminNav />
      <div className="container-form">
        <h1>Add Voter</h1>

        {isLocked && !generatedId && (
          <div className="msg-error" style={{ backgroundColor: "#fef2f2", border: "1.5px solid #fca5a5" }}>
            🔒 <strong>Voter Registration Locked:</strong> An election is currently in progress. Voters cannot be registered during an active election.
          </div>
        )}

        {error && <div className="msg-error">{error}</div>}

        {/* Separate Page / View for Generated Unique Voter ID */}
        {generatedId ? (
          <div className="box-section" style={{ textAlign: "center", padding: "36px 20px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
            <h2 style={{ fontSize: "20px", marginBottom: "6px", color: "var(--text-main)" }}>
              Voter Registered Successfully
            </h2>
            {registeredVoterName && (
              <p style={{ fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "16px" }}>
                Voter: {registeredVoterName}
              </p>
            )}
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "22px" }}>
              Please copy or note the unique Voter ID below. The citizen needs this ID to verify and cast their vote.
            </p>

            <div
              style={{
                background: "#f0fdf4",
                border: "2px dashed #86efac",
                borderRadius: "12px",
                padding: "18px 28px",
                display: "inline-block",
                marginBottom: "28px",
              }}
            >
              <div style={{ fontSize: "11.5px", textTransform: "uppercase", fontWeight: "700", color: "#166534", letterSpacing: "0.06em", marginBottom: "6px" }}>
                Unique Voter ID
              </div>
              <div style={{ fontSize: "30px", fontWeight: "800", fontFamily: "var(--font-mono)", color: "#15803d", letterSpacing: "0.05em" }}>
                {generatedId}
              </div>
            </div>

            <div>
              <button
                className="btn"
                type="button"
                onClick={handleClose}
                style={{ minWidth: "150px", padding: "10px 28px", fontSize: "14px" }}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="form-card">
            <div className="form-group">
              <label htmlFor="voter-name">Full Name</label>
              <input
                id="voter-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLocked || loading}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="voter-age">Age</label>
              <input
                id="voter-age"
                type="number"
                min="18"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={isLocked || loading}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="voter-doornumber">Door Number</label>
              <input
                id="voter-doornumber"
                type="text"
                value={doorNumber}
                onChange={(e) => setDoorNumber(e.target.value)}
                disabled={isLocked || loading}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="voter-aadhar">Aadhar ID</label>
              <input
                id="voter-aadhar"
                type="text"
                value={aadharId}
                onChange={(e) => setAadharId(e.target.value)}
                disabled={isLocked || loading}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="voter-address">Address</label>
              <input
                id="voter-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isLocked || loading}
                required
              />
            </div>
            <button
              className="btn"
              type="submit"
              disabled={isLocked || loading}
              style={{ width: "100%", marginTop: "6px", padding: "12px" }}
            >
              {loading ? "Registering Voter..." : isLocked ? "Registration Locked" : "Add Voter"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
