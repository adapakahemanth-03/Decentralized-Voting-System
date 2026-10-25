const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const CONTRACT_ABI = [
  "function addVoter(bytes32 key, uint8 age, uint256 districtId) external",
  "function addCandidate(string name, string party, string symbol, uint256 districtId) external",
  "function startElection() external",
  "function startElection(uint256 durationSeconds) external",
  "function stopElection() external",
  "function vote(bytes32 key, uint256 candidateId) external",
  "function isRunningPhase() external view returns (bool)",
  "function getAllCandidates() external view returns (uint256[] ids, string[] names, string[] parties, string[] symbols)",
  "function getCandidatesByDistrict(uint256 districtId) external view returns (uint256[] ids, string[] names, string[] parties, string[] symbols)",
  "function getDashboard() external view returns (uint256 totalVoters, uint256 totalVotes, uint256 candidateCount, uint256 startTime, uint256 endTime, bool isRunning)",
  "function getResults() external view returns (uint256[] ids, string[] names, string[] parties, string[] symbols, uint256[] districtIds, uint256[] voteCounts)",
  "function getVoterStatus(bytes32 key) external view returns (bool registered, bool hasVoted, uint256 districtId)",
];

function loadContractAddress() {
  const localConfigPath = path.join(__dirname, "contractAddress.json");
  const parentPath = path.join(__dirname, "../contractAddress.json");
  let addressFilePath = null;

  if (fs.existsSync(localConfigPath)) {
    addressFilePath = localConfigPath;
  } else if (fs.existsSync(parentPath)) {
    addressFilePath = parentPath;
  } else {
    throw new Error("contractAddress.json not found. Run deployment script first.");
  }

  const data = JSON.parse(fs.readFileSync(addressFilePath, "utf8"));
  return data.address;
}

function createContract() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL, undefined, {
    staticNetwork: true,
    cacheTimeout: -1,
  });
  const ownerWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contractAddress = loadContractAddress();
  return new ethers.Contract(contractAddress, CONTRACT_ABI, ownerWallet);
}

const contract = createContract();
module.exports = contract;
