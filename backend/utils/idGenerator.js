const { hashVoterId } = require("./hashHelper");

function generateVoterId(db) {
  if (db) {
    const row = db.get("SELECT COUNT(*) as count FROM voters");
    const count = row ? Number(row.count) : 0;
    if (count === 0) {
      return "VID202601";
    }
  }

  for (let attempt = 0; attempt < 100; attempt++) {
    const num = Math.floor(1 + Math.random() * 99);
    const suffix = String(num).padStart(2, "0");
    const candidateId = `VID2026${suffix}`;
    if (!db) return candidateId;

    const exists = db.get("SELECT id FROM voters WHERE voter_id_hash = ?", hashVoterId(candidateId));
    if (!exists) {
      return candidateId;
    }
  }

  for (let i = 1; i <= 99; i++) {
    const suffix = String(i).padStart(2, "0");
    const candidateId = `VID2026${suffix}`;
    if (!db) return candidateId;

    const exists = db.get("SELECT id FROM voters WHERE voter_id_hash = ?", hashVoterId(candidateId));
    if (!exists) {
      return candidateId;
    }
  }

  return `VID2026${Date.now().toString().slice(-2)}`;
}

module.exports = { generateVoterId };
