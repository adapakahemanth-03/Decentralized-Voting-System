import { useState, useEffect } from "react";
import AdminNav from "../components/AdminNav";
import { getResults } from "../services/api";

export default function Results() {
  const [candidates, setCandidates] = useState([]);
  const [lockedMsg, setLockedMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  async function loadResults() {
    setLoading(true);
    setError("");
    setLockedMsg("");
    try {
      const data = await getResults();
      setCandidates(data.candidates);
    } catch (err) {
      if (
        err.message.includes("locked") ||
        err.message.includes("not started") ||
        err.message.includes("not yet") ||
        err.message.includes("active") ||
        err.message.includes("stopped")
      ) {
        setLockedMsg(err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-wide">
      <AdminNav />
      <h1>Results</h1>

      {loading && <div>Loading results...</div>}
      {error && !loading && <div className="msg-error">{error}</div>}

      {lockedMsg && !loading && (
        <div className="box-section">
          <p>{lockedMsg}</p>
        </div>
      )}

      {candidates.length > 0 && !loading && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Candidate Name</th>
              <th>Party</th>
              <th>Symbol</th>
              <th>Votes</th>
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
                <td style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{c.votes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
