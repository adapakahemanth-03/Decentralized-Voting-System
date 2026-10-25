const express = require("express");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const getDb = require("../config/db");
const contract = require("../config/contract");
const { hashVoterId } = require("../utils/hashHelper");

const router = express.Router();

const sessionTokens = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [token, data] of sessionTokens.entries()) {
    if (now > data.expiresAt) {
      sessionTokens.delete(token);
    }
  }
}, 60 * 1000);

const failedAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 10 * 60 * 1000;

const lookupRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many attempts. Please wait a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/status", async (req, res) => {
  try {
    const dashboard = await contract.getDashboard();
    const totalVoters = Number(dashboard[0]);
    const totalVotes = Number(dashboard[1]);
    const candidateCount = Number(dashboard[2]);
    const startTime = Number(dashboard[3]);
    const endTime = Number(dashboard[4]);
    const isRunning = Boolean(dashboard[5]);
    const now = Math.floor(Date.now() / 1000);

    let status = isRunning ? "Running" : (startTime === 0 ? "Not Started" : "Stopped");
    let isVotingOpen = isRunning;

    return res.json({
      status,
      isVotingOpen,
      isRunning,
      startTime,
      endTime,
      candidateCount,
      totalVoters,
      totalVotes,
      currentTime: now,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch election status: " + error.message });
  }
});

router.post("/lookup", lookupRateLimit, async (req, res) => {
  const { voterId } = req.body;

  if (!voterId || typeof voterId !== "string" || !voterId.trim()) {
    return res.status(401).json({ error: "Invalid details" });
  }

  const voterKey = hashVoterId(voterId);

  const attemptData = failedAttempts.get(voterKey);
  if (attemptData && attemptData.lockedUntil > Date.now()) {
    const minutesLeft = Math.ceil((attemptData.lockedUntil - Date.now()) / 60000);
    return res.status(401).json({
      error: `Account temporarily locked. Try again in ${minutesLeft} minute(s).`,
    });
  }

  try {
    const db = await getDb();
    const voter = db.get("SELECT * FROM voters WHERE voter_id_hash = ?", voterKey);

    if (!voter) {
      const current = failedAttempts.get(voterKey) || { count: 0, lockedUntil: 0 };
      current.count += 1;
      if (current.count >= MAX_ATTEMPTS) {
        current.lockedUntil = Date.now() + LOCKOUT_MS;
      }
      failedAttempts.set(voterKey, current);
      return res.status(401).json({ error: "Invalid details" });
    }

    const dashboard = await contract.getDashboard();
    const isRunning = Boolean(dashboard[5]);

    if (!isRunning) {
      return res.status(403).json({ error: "Voting is closed. Election is not currently active." });
    }

    const voterStatus = await contract.getVoterStatus(voterKey);
    if (!voterStatus[0]) {
      const current = failedAttempts.get(voterKey) || { count: 0, lockedUntil: 0 };
      current.count += 1;
      if (current.count >= MAX_ATTEMPTS) {
        current.lockedUntil = Date.now() + LOCKOUT_MS;
      }
      failedAttempts.set(voterKey, current);
      return res.status(401).json({ error: "Voter details not recognized on the blockchain." });
    }

    if (voterStatus[1]) {
      return res.status(403).json({ error: "You have already cast your vote in this election. Each citizen can only vote once." });
    }

    failedAttempts.delete(voterKey);

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 5 * 60 * 1000;

    sessionTokens.set(sessionToken, {
      voterKey,
      districtId: voter.district_id,
      expiresAt,
    });

    return res.json({
      token: sessionToken,
      name: voter.name,
      doorNumber: voter.door_number,
      aadharId: voter.aadhar_id,
      address: voter.address,
      district: voter.district_name,
      state: voter.state,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server error: " + error.message });
  }
});

router.get("/candidates", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "token is required" });
  }

  const session = sessionTokens.get(token);
  if (!session || Date.now() > session.expiresAt) {
    return res.status(401).json({ error: "Invalid or expired session token" });
  }

  try {
    let result;
    try {
      result = await contract.getAllCandidates();
    } catch (_) {
      result = await contract.getCandidatesByDistrict(session.districtId);
    }

    const ids = result[0].map(Number);
    const names = result[1];
    const parties = result[2];
    const symbols = result[3];

    const candidates = ids.map((id, index) => ({
      id,
      name: names[index],
      party: parties[index],
      symbol: symbols[index],
    }));

    return res.json({ candidates });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch candidates: " + error.message });
  }
});

router.post("/vote", async (req, res) => {
  const { token, candidateId } = req.body;

  if (!token || candidateId === undefined) {
    return res.status(400).json({ error: "token and candidateId are required" });
  }

  const session = sessionTokens.get(token);
  if (!session || Date.now() > session.expiresAt) {
    return res.status(401).json({ error: "Invalid or expired session token" });
  }

  sessionTokens.delete(token);

  try {
    const dashboard = await contract.getDashboard();
    const isRunning = Boolean(dashboard[5]);

    if (!isRunning) {
      return res.status(403).json({ error: "Voting is closed. Election is not currently running." });
    }

    const tx = await contract.vote(session.voterKey, candidateId);
    await tx.wait();
    return res.json({ message: "Vote cast successfully" });
  } catch (error) {
    const msg = error.message || "";
    if (msg.includes("Already voted")) return res.status(400).json({ error: "You have already voted" });
    if (msg.includes("Election is not running")) return res.status(400).json({ error: "The 15-hour voting period has completed. Voting is closed." });
    if (msg.includes("Candidate not in voter's district")) return res.status(400).json({ error: "This candidate is not in your district" });
    if (msg.includes("Voter not registered")) return res.status(400).json({ error: "Voter not registered on blockchain" });
    return res.status(500).json({ error: "Failed to cast vote: " + error.message });
  }
});

module.exports = router;
