// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Election {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    struct Candidate {
        string name;
        string party;
        string symbol;
        uint256 districtId;
        uint256 votes;
    }

    struct Voter {
        bool registered;
        bool hasVoted;
        uint256 districtId;
    }

    Candidate[] private candidates;
    mapping(bytes32 => Voter) private voters;

    uint256 public totalVoters;
    uint256 public totalVotes;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public resultDelay;
    bool public isRunning;

    constructor(uint256 _resultDelaySeconds) {
        owner = msg.sender;
        resultDelay = _resultDelaySeconds;
    }

    function isRunningPhase() public view returns (bool) {
        return isRunning;
    }

    function addVoter(bytes32 key, uint8 age, uint256 districtId) external onlyOwner {
        require(!isRunning, "Cannot add voter during running election");
        require(age >= 18, "Voter must be 18 or older");
        require(!voters[key].registered, "Voter already registered");

        voters[key] = Voter({ registered: true, hasVoted: false, districtId: districtId });
        totalVoters++;
    }

    function addCandidate(
        string calldata name,
        string calldata party,
        string calldata symbol,
        uint256 districtId
    ) external onlyOwner {
        require(!isRunning, "Cannot add candidate during running election");
        candidates.push(Candidate({
            name: name,
            party: party,
            symbol: symbol,
            districtId: districtId,
            votes: 0
        }));
    }

    function startElection() external onlyOwner {
        require(!isRunning, "Election is already running");
        require(candidates.length > 0, "Add at least one candidate first");
        isRunning = true;
        startTime = block.timestamp;
        endTime = 0;
    }

    function startElection(uint256) external onlyOwner {
        require(!isRunning, "Election is already running");
        require(candidates.length > 0, "Add at least one candidate first");
        isRunning = true;
        startTime = block.timestamp;
        endTime = 0;
    }

    function stopElection() external onlyOwner {
        require(isRunning, "Election is not running");
        isRunning = false;
        endTime = block.timestamp;
    }

    function vote(bytes32 key, uint256 candidateId) external onlyOwner {
        require(isRunning, "Election is not running");
        require(voters[key].registered, "Voter not registered");
        require(!voters[key].hasVoted, "Already voted");
        require(candidateId < candidates.length, "Invalid candidate");

        voters[key].hasVoted = true;
        candidates[candidateId].votes++;
        totalVotes++;
    }

    function getAllCandidates()
        external
        view
        returns (
            uint256[] memory ids,
            string[] memory names,
            string[] memory parties,
            string[] memory symbols
        )
    {
        uint256 count = candidates.length;
        ids = new uint256[](count);
        names = new string[](count);
        parties = new string[](count);
        symbols = new string[](count);

        for (uint256 i = 0; i < count; i++) {
            ids[i] = i;
            names[i] = candidates[i].name;
            parties[i] = candidates[i].party;
            symbols[i] = candidates[i].symbol;
        }
    }

    function getCandidatesByDistrict(uint256 districtId)
        external
        view
        returns (
            uint256[] memory ids,
            string[] memory names,
            string[] memory parties,
            string[] memory symbols
        )
    {
        uint256 count = 0;
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].districtId == districtId) {
                count++;
            }
        }

        ids = new uint256[](count);
        names = new string[](count);
        parties = new string[](count);
        symbols = new string[](count);

        uint256 index = 0;
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].districtId == districtId) {
                ids[index] = i;
                names[index] = candidates[i].name;
                parties[index] = candidates[i].party;
                symbols[index] = candidates[i].symbol;
                index++;
            }
        }
    }

    function getDashboard()
        external
        view
        returns (
            uint256 _totalVoters,
            uint256 _totalVotes,
            uint256 _candidateCount,
            uint256 _startTime,
            uint256 _endTime,
            bool _isRunning
        )
    {
        return (totalVoters, totalVotes, candidates.length, startTime, endTime, isRunning);
    }

    function getResults()
        external
        view
        returns (
            uint256[] memory ids,
            string[] memory names,
            string[] memory parties,
            string[] memory symbols,
            uint256[] memory districtIds,
            uint256[] memory voteCounts
        )
    {
        require(startTime > 0, "Election not started");
        require(!isRunning, "Election is still running");

        uint256 length = candidates.length;
        ids = new uint256[](length);
        names = new string[](length);
        parties = new string[](length);
        symbols = new string[](length);
        districtIds = new uint256[](length);
        voteCounts = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            ids[i] = i;
            names[i] = candidates[i].name;
            parties[i] = candidates[i].party;
            symbols[i] = candidates[i].symbol;
            districtIds[i] = candidates[i].districtId;
            voteCounts[i] = candidates[i].votes;
        }
    }

    function getVoterStatus(bytes32 key)
        external
        view
        returns (bool registered, bool hasVoted, uint256 districtId)
    {
        Voter memory v = voters[key];
        return (v.registered, v.hasVoted, v.districtId);
    }
}
