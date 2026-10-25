# 🗳️ Decentralized Election Voting System (D-EVoting)

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Ethereum / Hardhat](https://img.shields.io/badge/Hardhat-Ethereum_Node-yellow?logo=ethereum&logoColor=white)](https://hardhat.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React_18-Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-sql.js-003B57?logo=sqlite&logoColor=white)](https://sql.js.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A secure, transparent, and decentralized electronic voting application built on an Ethereum-compatible blockchain. It combines smart contracts, a gasless relayer architecture for citizens, cryptographic hashing for voter uniqueness, and a modern web interface.

---

## 🌟 Key Features

- **🔗 Blockchain-Powered Integrity**: Every ballot is permanently recorded on an Ethereum smart contract ([`Election.sol`](contracts/Election.sol)), making the vote count tamper-proof and fully verifiable.
- **⚡ Admin On-Demand Election Control**: 
  - Admin starts the election with a single click.
  - Voters can only cast ballots while the election is active.
  - While active, candidate and voter registration are strictly locked on-chain.
  - Admin can stop the election at any time to freeze voting and restore full registration capabilities.
- **🛡️ Anonymous & Single-Vote Ballot Security**:
  - Voter identity (Aadhar ID) is hashed using Keccak256 (`bytes32`).
  - Citizens vote using a securely generated Unique Voter ID (`VID...`).
  - Double voting is strictly prevented at both the smart contract and database levels.
- **🌸 Candidate Symbol Picker**:
  - Rich candidate symbol selector featuring themed emoji symbols categorized into **Flowers** 🌸, **Animals** 🦁, and **Objects** ⚡.
- **📄 Dedicated Unique Voter ID Display**:
  - After adding a voter, the system displays their unique Voter ID on a dedicated celebratory card with copy guidance and a **Close** button that returns to a clean form.
- **📊 Instant Results**:
  - Live vote tallies and ranking are calculated on-chain and viewable immediately once the election is stopped.
- **🎨 Modern Design**:
  - Soft light blue background (`#e0f2fe`), accessible typography, and zero clutter with clean labeled inputs.

---

## 🏛️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)              │
│       • Voter Portal (Lookup & Vote)                   │
│       • Admin Portal (Register, Candidates, Voters)    │
│       • Live Status & Results Display                  │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (JSON)
┌───────────────────────────▼────────────────────────────┐
│                  Backend (Express.js)                  │
│       • JWT Authentication & Session Tokens            │
│       • Rate Limiting & Input Validation               │
│       • Keccak256 Hashing & ID Generation              │
│       • sql.js SQLite Database                         │
└───────────────────────────┬────────────────────────────┘
                            │ Ethers.js v6 (Relayer Wallet)
┌───────────────────────────▼────────────────────────────┐
│           Smart Contract (Solidity 0.8.20)             │
│       • Deployed on Local Hardhat Blockchain Node      │
│       • Decentralized Ledger for Votes & Candidates    │
│       • State Constraints: isRunning, hasVoted         │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|:---|:---|:---|
| **Smart Contract** | Solidity `^0.8.20` | Core voting rules, ballot immutability, state control |
| **Blockchain Node** | Hardhat | Local Ethereum RPC provider running at `http://127.0.0.1:8545` |
| **Backend API** | Node.js + Express | Relayer engine, auth, SQLite integration, Ethers.js |
| **Web3 Relayer** | Ethers.js v6 | Signs and broadcasts on-chain transactions on behalf of users |
| **Database** | SQLite (`sql.js`) | Off-chain voter records, hashed credentials, demographic data |
| **Frontend UI** | React 18 + Vite | Single-page client interface with React Router |
| **Styling** | Vanilla CSS | Custom design system with light sky blue theme |

---

## 🚀 Getting Started

Follow these steps to run the complete decentralized voting system locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or v20+ recommended)
- `npm` (included with Node.js)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/EVoting.git
cd EVoting
```

### 2. Install Dependencies

Install all root, backend, and frontend packages:

```bash
# Install root dependencies (Hardhat & plugins)
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Configure Environment Variables

Create your `.env` file in the `backend/` directory:

```bash
cd backend
copy .env.example .env     # Windows
# or: cp .env.example .env # macOS/Linux
```

Verify your `backend/.env` contains:
```env
PORT=3001
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
JWT_SECRET=super_secret_jwt_key_for_admin_auth
ADMIN_ALLOWED_EMAILS=admin@example.com,election@gov.in
ID_SECRET=my_secure_voter_id_secret_key
RESULT_DELAY_SECONDS=0
```

---

## 🖥️ Running the Application

To run the full stack, open **3 terminal windows**:

### Terminal 1: Start Blockchain Node
```bash
# In the project root:
npx hardhat node
```
*Keep this terminal running. It hosts your local Ethereum RPC at `http://127.0.0.1:8545`.*

### Terminal 2: Deploy Contract & Start Backend
Deploy the smart contract to your local blockchain:
```bash
# In the project root:
npx hardhat run scripts/deploy.js --network localhost
```
*This compiles `Election.sol` and writes the contract address to `backend/contractAddress.json`.*

Next, start the backend server:
```bash
cd backend
npm run dev
```
*Backend API will run at `http://localhost:3001`.*

### Terminal 3: Start Frontend Client
```bash
cd frontend
npm run dev
```
*Frontend application will run at `http://localhost:5173`.*

---

## 🗳️ Demonstration Walkthrough

### 1. Admin Login & Setup
1. Open [http://localhost:5173/admin](http://localhost:5173/admin).
2. Log in with the default admin account:
   - **Email**: `admin@example.com`
   - **Password**: `password123`
   *(Or click "Register" to create a new administrator account using an allowed email).*

### 2. Add Candidates
1. In the admin menu, click **Add Candidate**.
2. Enter Candidate Name and Political Party.
3. Choose a symbol from the emoji selector (e.g. 🌸 Lotus, 🦁 Lion, ⚡ Rocket).
4. Click **Add Candidate** to save on-chain.

### 3. Add Voters
1. In the admin menu, click **Add Voter**.
2. Enter citizen details: Full Name, Age (≥ 18), Door Number, Aadhar ID, and Address.
3. Click **Add Voter**.
4. The system presents the **Unique Voter ID** (e.g., `VID202611`) on a dedicated confirmation screen.
5. Click **Close** to return to an empty form to register another voter.

### 4. Start the Election
1. Go to the **Admin Dashboard**.
2. Click the green **Start Election** button.
3. The election status flips to **`🟢 VOTING LIVE (ELECTION ACTIVE)`**.
4. Adding voters and candidates is now locked until the election is stopped.

### 5. Cast Votes as Citizens
1. Open [http://localhost:5173](http://localhost:5173).
2. Enter the generated **Voter ID**.
3. Verify your personal identity details on screen and click **Confirm & View Candidates**.
4. Browse the candidate list and symbols, then click **Vote** next to your preferred candidate.
5. The ballot is recorded on-chain, and the screen resets for the next citizen.
6. *Try voting again with the same Voter ID — the system will reject duplicate votes.*

### 6. Stop Election & View Results
1. Return to the **Admin Dashboard** and click **🛑 Stop Election**.
2. The election stops and status changes to **`⚪ ELECTION INACTIVE`**.
3. Click **📊 View Election Results** to view the final ranked vote counts.

---

## 📂 Project Directory Layout

```text
EVoting/
├── contracts/
│   └── Election.sol            # Solidity Smart Contract
├── scripts/
│   └── deploy.js               # Contract deployment automation script
├── test/
│   └── Election.test.js        # Hardhat unit tests for smart contract
├── hardhat.config.js           # Hardhat configuration
├── backend/
│   ├── server.js               # Express application entry point
│   ├── contractAddress.json    # Auto-generated contract deployment address
│   ├── config/
│   │   ├── db.js               # SQLite database setup (sql.js)
│   │   ├── contract.js         # Ethers.js contract instance and ABI
│   │   └── districts.json      # District reference data
│   ├── routes/
│   │   ├── adminAuth.js        # Admin authentication routes
│   │   ├── admin.js            # Admin management & blockchain endpoints
│   │   └── voter.js            # Voter authentication & ballot routes
│   └── utils/
│       ├── hashHelper.js       # Keccak256 voter hashing utilities
│       └── idGenerator.js      # Unique Voter ID generator
└── frontend/
    ├── index.html              # Frontend root HTML
    └── src/
        ├── App.jsx             # React router & route guards
        ├── styles.css          # Custom styling with light blue theme
        ├── services/
        │   └── api.js          # Client API communication methods
        ├── components/
        │   ├── Header.jsx      # Portal header component
        │   ├── AdminNav.jsx    # Admin navigation bar
        │   ├── RoleSwitch.jsx  # Toggle between Citizen and Admin views
        │   └── ElectionStatusCard.jsx # Dynamic election status indicator
        └── pages/
            ├── VoterPage.jsx   # Citizen identification & voting portal
            ├── AdminLogin.jsx  # Admin login and registration page
            ├── AdminDashboard.jsx # Election lifecycle controls & stats
            ├── AddVoter.jsx    # Voter registration & unique ID screen
            ├── AddCandidate.jsx# Candidate registration with emoji picker
            └── Results.jsx     # Election results and tallying screen
```

---

## 🔒 Security Design

- **Private Relayer Architecture**: Citizens do not need crypto wallets or gas tokens (ETH). The backend relayer signs verified transactions on their behalf.
- **On-Chain Enforcement**: Election rules (election state, one vote per citizen, age verification) are enforced by the EVM smart contract, not just client-side code.
- **Double-Vote Prevention**: A boolean mapping `hasVoted` in Solidity prevents repeat ballots for the same hashed key.
- **Password Hashing**: Admin credentials stored in SQLite are protected with `bcryptjs` salt rounds.
- **JWT Protection**: Administrative routes are guarded with signed JSON Web Tokens.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
