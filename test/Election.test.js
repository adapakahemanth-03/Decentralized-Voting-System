const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

function makeKey(voterId, secret) {
  return ethers.keccak256(ethers.toUtf8Bytes(voterId.trim().toUpperCase() + secret));
}

describe("Election Contract", function () {
  let election;
  let owner;
  const TEST_SECRET = "TEST_SECRET_123";
  const RESULT_DELAY = 60;
  const DURATION = 300;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const ElectionFactory = await ethers.getContractFactory("Election");
    election = await ElectionFactory.deploy(RESULT_DELAY);
    await election.waitForDeployment();
  });

  it("should reject voters under 18", async function () {
    const key = makeKey("VOTER001", TEST_SECRET);
    await expect(
      election.addVoter(key, 17, 1)
    ).to.be.revertedWith("Voter must be 18 or older");
  });

  it("should reject adding voters after election has started", async function () {
    await election.addCandidate("Alice", "Party A", "A", 1);
    await election.startElection(DURATION);

    const key = makeKey("VOTER001", TEST_SECRET);
    await expect(
      election.addVoter(key, 25, 1)
    ).to.be.revertedWith("Election already started");
  });

  it("should reject votes before election starts", async function () {
    const key = makeKey("VOTER001", TEST_SECRET);
    await election.addVoter(key, 25, 1);
    await election.addCandidate("Alice", "Party A", "A", 1);

    await expect(
      election.vote(key, 0)
    ).to.be.revertedWith("Election is not running");
  });

  it("should reject votes after election ends", async function () {
    const key = makeKey("VOTER001", TEST_SECRET);
    await election.addVoter(key, 25, 1);
    await election.addCandidate("Alice", "Party A", "A", 1);
    await election.startElection(DURATION);

    await time.increase(DURATION + 10);

    await expect(
      election.vote(key, 0)
    ).to.be.revertedWith("Election is not running");
  });

  it("should reject a double vote from the same voter", async function () {
    const key = makeKey("VOTER001", TEST_SECRET);
    await election.addVoter(key, 25, 1);
    await election.addCandidate("Alice", "Party A", "A", 1);
    await election.startElection(DURATION);

    await election.vote(key, 0);

    await expect(
      election.vote(key, 0)
    ).to.be.revertedWith("Already voted");
  });

  it("should reject a vote when voter's district doesn't match candidate's district", async function () {
    const key = makeKey("VOTER001", TEST_SECRET);
    await election.addVoter(key, 25, 1);
    await election.addCandidate("Bob", "Party B", "B", 2);
    await election.startElection(DURATION);

    await expect(
      election.vote(key, 0)
    ).to.be.revertedWith("Candidate not in voter's district");
  });

  it("should lock results until endTime + resultDelay", async function () {
    const key = makeKey("VOTER001", TEST_SECRET);
    await election.addVoter(key, 25, 1);
    await election.addCandidate("Alice", "Party A", "A", 1);
    await election.startElection(DURATION);
    await election.vote(key, 0);

    await time.increase(DURATION + 10);

    await expect(election.getResults()).to.be.revertedWith("Results are locked");

    await time.increase(RESULT_DELAY + 10);

    const [, names, , , , voteCounts] = await election.getResults();
    expect(names[0]).to.equal("Alice");
    expect(voteCounts[0]).to.equal(1n);
  });

  it("should allow a valid vote and update totals", async function () {
    const key = makeKey("VOTER001", TEST_SECRET);
    await election.addVoter(key, 25, 1);
    await election.addCandidate("Alice", "Party A", "A", 1);
    await election.startElection(DURATION);

    await election.vote(key, 0);

    expect(await election.totalVotes()).to.equal(1n);
    expect(await election.totalVoters()).to.equal(1n);

    const [registered, hasVoted] = await election.getVoterStatus(key);
    expect(registered).to.be.true;
    expect(hasVoted).to.be.true;
  });
});
