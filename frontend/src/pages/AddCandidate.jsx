import { useState, useEffect } from "react";
import AdminNav from "../components/AdminNav";
import { addCandidate, getElectionStatus } from "../services/api";

const EMOJI_CATEGORIES = {
  Flowers: [
    { emoji: "🌸", label: "Lotus" },
    { emoji: "🌹", label: "Rose" },
    { emoji: "🌻", label: "Sunflower" },
    { emoji: "🌺", label: "Hibiscus" },
    { emoji: "🌳", label: "Tree" },
    { emoji: "🌾", label: "Grain" },
    { emoji: "🌴", label: "Palm" },
    { emoji: "🍀", label: "Clover" },
  ],
  Animals: [
    { emoji: "🦁", label: "Lion" },
    { emoji: "🐘", label: "Elephant" },
    { emoji: "🐎", label: "Horse" },
    { emoji: "🦅", label: "Eagle" },
    { emoji: "🐅", label: "Tiger" },
    { emoji: "🕊️", label: "Dove" },
    { emoji: "🦚", label: "Peacock" },
    { emoji: "🐂", label: "Bull" },
  ],
  Objects: [
    { emoji: "⚖️", label: "Scales" },
    { emoji: "🏹", label: "Bow & Arrow" },
    { emoji: "🕯️", label: "Candle" },
    { emoji: "☀️", label: "Sun" },
    { emoji: "🔔", label: "Bell" },
    { emoji: "⚓", label: "Anchor" },
    { emoji: "🚀", label: "Rocket" },
    { emoji: "💡", label: "Lamp" },
    { emoji: "🔑", label: "Key" },
    { emoji: "🚗", label: "Car" },
    { emoji: "🚲", label: "Bicycle" },
    { emoji: "🏏", label: "Bat" },
  ],
};

export default function AddCandidate() {
  const [name, setName] = useState("");
  const [party, setParty] = useState("");
  const [symbol, setSymbol] = useState("");
  const [activeCategory, setActiveCategory] = useState("Flowers");
  const [success, setSuccess] = useState("");
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

  function handleSelectSymbol(item) {
    if (isLocked) return;
    const symbolText = `${item.emoji} ${item.label}`;
    setSymbol(symbolText);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isLocked) {
      setError("Candidate registration is locked while the election is active.");
      return;
    }

    if (!symbol.trim()) {
      setError("Please select or enter a candidate symbol");
      return;
    }

    setLoading(true);
    try {
      await addCandidate(name, party, symbol.trim(), 1);
      setSuccess(`Candidate "${name}" added successfully with symbol ${symbol}!`);
      setName("");
      setParty("");
      setSymbol("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-wide">
      <AdminNav />
      <div className="container-form" style={{ maxWidth: "520px" }}>
        <h1>Add Candidate</h1>

        {isLocked && (
          <div className="msg-error" style={{ backgroundColor: "#fef2f2", border: "1.5px solid #fca5a5" }}>
            🔒 <strong>Candidate Registration Locked:</strong> An election is currently in progress. Candidates cannot be added during an active election.
          </div>
        )}

        {error && <div className="msg-error">{error}</div>}
        {success && <div className="msg-success">{success}</div>}

        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-group">
            <label htmlFor="candidate-name">Candidate Name</label>
            <input
              id="candidate-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLocked || loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="candidate-party">Political Party</label>
            <input
              id="candidate-party"
              type="text"
              value={party}
              onChange={(e) => setParty(e.target.value)}
              disabled={isLocked || loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="candidate-symbol">Election Symbol</label>
            <input
              id="candidate-symbol"
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              disabled={isLocked || loading}
              required
            />
          </div>

          {/* Quick Emoji / Symbol Picker */}
          <div className="symbol-picker-wrapper" style={{ opacity: isLocked ? 0.6 : 1, pointerEvents: isLocked ? "none" : "auto" }}>
            <div className="symbol-picker-header">
              <span className="symbol-picker-title">Choose from Popular Symbols:</span>
              <div className="symbol-tabs">
                {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`symbol-tab-btn ${activeCategory === cat ? "active" : ""}`}
                    onClick={() => setActiveCategory(cat)}
                    disabled={isLocked}
                  >
                    {cat === "Flowers" && "🌸"} {cat === "Animals" && "🦁"} {cat === "Objects" && "⚡"} {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="symbol-grid">
              {EMOJI_CATEGORIES[activeCategory].map((item) => {
                const isSelected = symbol.includes(item.emoji);
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`symbol-chip ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelectSymbol(item)}
                    disabled={isLocked}
                  >
                    <span className="chip-emoji">{item.emoji}</span>
                    <span className="chip-label">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            className="btn"
            type="submit"
            disabled={isLocked || loading}
            style={{ width: "100%", marginTop: "18px", padding: "12px" }}
          >
            {loading ? "Adding Candidate..." : isLocked ? "Registration Locked" : "Add Candidate"}
          </button>
        </form>
      </div>
    </div>
  );
}
