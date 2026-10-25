const express = require("express");
const getDb = require("../config/db");
const contract = require("../config/contract");
const requireAdmin = require("../middleware/auth");
const districts = require("../config/districts.json");
const { hashVoterId } = require("../utils/hashHelper");
const { generateVoterId } = require("../utils/idGenerator");

const router = express.Router();

router.use(requireAdmin);

router.get("/districts", (req, res) => {
  res.json(districts);
});

router.post("/voters", async (req, res) => {
  const { name, age, doorNumber, aadharId, address } = req.body;

  if (!name || !age || !doorNumber || !aadharId || !address) {
    return res.status(400).json({ error: "Name, age, door number, Aadhar ID, and address are required" });
  }

  const ageNumber = parseInt(age, 10);
  if (isNaN(ageNumber) || ageNumber < 18) {
    return res.status(400).json({ error: "Voter must be 18 or older" });
  }

  // Only disallow registration DURING running election
  try {
    const dash = await contract.getDashboard();
    const isRunning = Boolean(dash[5]);
    if (isRunning) {
      return res.status(403).json({ error: "Voter registration is locked while an election is currently running." });
    }
  } catch (err) {
    return res.status(500).json({ error: "Failed to check election status: " + err.message });
  }

  const db = await getDb();

  const existing = db.get(
    "SELECT id FROM voters WHERE aadhar_id = ? OR (name = ? AND age = ? AND address = ?)",
    aadharId.trim(),
    name.trim(),
    ageNumber,
    address.trim()
  );
  if (existing) {
    return res.status(409).json({ error: "A voter with this Aadhar ID or details is already registered" });
  }

  const voterId = generateVoterId(db);
  const voterKey = hashVoterId(voterId);
  const districtIdNum = 1;
  const districtName = "District 1";
  const state = "Default";

  try {
    db.run(
      "INSERT INTO voters (voter_id_hash, name, age, door_number, aadhar_id, address, state, district_id, district_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      voterKey,
      name.trim(),
      ageNumber,
      doorNumber.trim(),
      aadharId.trim(),
      address.trim(),
      state,
      districtIdNum,
      districtName
    );

    const tx = await contract.addVoter(voterKey, ageNumber, districtIdNum);
    await tx.wait();

    return res.status(201).json({ message: "Voter registered successfully", voterId, name: name.trim() });
  } catch (error) {
    try {
      db.run("DELETE FROM voters WHERE voter_id_hash = ?", voterKey);
    } catch (_) {}
    return res.status(500).json({ error: "Failed to register voter: " + error.message });
  }
});

router.post("/candidates", async (req, res) => {
  const { name, party, symbol, districtId } = req.body;

  if (!name || !party || !symbol) {
    return res.status(400).json({ error: "name, party, and symbol are required" });
  }

  // Only disallow adding candidates DURING running election
  try {
    const dash = await contract.getDashboard();
    const isRunning = Boolean(dash[5]);
    if (isRunning) {
      return res.status(403).json({ error: "Candidate registration is locked while an election is currently running." });
    }
  } catch (err) {
    return res.status(500).json({ error: "Failed to check election status: " + err.message });
  }

  const distId = parseInt(districtId || 1, 10);

  try {
    const tx = await contract.addCandidate(name.trim(), party.trim(), symbol.trim(), distId);
    await tx.wait();
    return res.status(201).json({ message: "Candidate added successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to add candidate: " + error.message });
  }
});

router.post("/stop", async (req, res) => {
  try {
    const dashResult = await contract.getDashboard();
    const isRunning = Boolean(dashResult[5]);

    if (!isRunning) {
      return res.status(400).json({ error: "Election is not currently running" });
    }

    const tx = await contract.stopElection();
    await tx.wait();
    return res.json({ message: "Election stopped successfully. System is back to normal." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to stop election: " + error.message });
  }
});

router.post("/start", async (req, res) => {
  try {
    const dashResult = await contract.getDashboard();
    const candidateCount = Number(dashResult[2]);
    const isRunning = Boolean(dashResult[5]);

    if (candidateCount === 0) {
      return res.status(400).json({ error: "Add at least one candidate first before starting election" });
    }

    if (isRunning) {
      return res.status(400).json({ error: "Election is already running" });
    }

    const tx = await contract["startElection()"]();
    await tx.wait();
    return res.json({ message: "Election started successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to start election: " + error.message });
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const result = await contract.getDashboard();

    const totalVoters = Number(result[0]);
    const totalVotes = Number(result[1]);
    const candidateCount = Number(result[2]);
    const startTime = Number(result[3]);
    const endTime = Number(result[4]);
    const isRunning = Boolean(result[5]);

    const status = isRunning ? "Running" : "Setup";
    const turnout = totalVoters === 0 ? 0 : Math.round((totalVotes * 100) / totalVoters);

    return res.json({
      totalVoters,
      totalVotes,
      candidateCount,
      turnout,
      status,
      isRunning,
      startTime,
      endTime,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch dashboard: " + error.message });
  }
});

router.get("/results", async (req, res) => {
  try {
    const dashResult = await contract.getDashboard();
    const startTime = Number(dashResult[3]);
    const isRunning = Boolean(dashResult[5]);

    if (startTime === 0) {
      return res.status(403).json({ error: "Election has not started yet" });
    }

    if (isRunning) {
      return res.status(403).json({ error: "Election is currently active. Results can be viewed after admin stops the election." });
    }

    const result = await contract.getResults();

    const ids = result[0].map(Number);
    const names = result[1];
    const parties = result[2];
    const symbols = result[3];
    const districtIds = result[4].map(Number);
    const voteCounts = result[5].map(Number);

    const candidates = ids.map((id, i) => ({
      id,
      name: names[i],
      party: parties[i],
      symbol: symbols[i],
      districtId: districtIds[i],
      votes: voteCounts[i],
    }));

    candidates.sort((a, b) => b.votes - a.votes);

    return res.json({ candidates });
  } catch (error) {
    if (error.message.includes("locked") || error.message.includes("Results are locked")) {
      return res.status(403).json({ error: "Results are not yet available" });
    }
    return res.status(500).json({ error: "Failed to fetch results: " + error.message });
  }
});

module.exports = router;
