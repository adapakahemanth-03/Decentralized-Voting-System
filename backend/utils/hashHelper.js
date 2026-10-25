const { ethers } = require("ethers");
require("dotenv").config();

function hashVoterId(voterId) {
  const normalized = voterId.trim().toUpperCase();
  const input = normalized + (process.env.ID_SECRET || "");
  return ethers.keccak256(ethers.toUtf8Bytes(input));
}

module.exports = { hashVoterId };
