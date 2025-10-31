# 🔐 MultiSig Wallet Smart Contract

This folder contains the core smart contract and testing suite for the MultiSig Wallet dApp built for the OnChain Island 🏝️ selection task.

The MultiSigWallet smart contract allows secure, multi-owner-controlled transactions, including AI-powered risk scoring, owner management, proposal execution, and nomination systems.

---

## 🧾 Smart Contract Summary

🧠 Name: MultiSigWallet
🧱 Network: Ethereum Sepolia (configurable)
🔑 Threshold-based M-of-N approval mechanism
⚠️ Supports AI risk scoring (with threshold escalation for high-risk txs)
👤 Proposer auto-confirms proposals
👥 Owners can be added/removed via proposals
🧹 Cancel proposals conditionally
🚨 Fully reentrancy-protected
###🧪 36/36 Unit Tests passing ✅

---

## 🛠️ Setup & Installation

1. Clone the repository

```bash
git clone https://github.com/ahkharsha/MultiSig-OnChain.git
cd contract
```

2. Install dependencies

```bash
npm install
```

3. Update `.env` (optional)

Instead of using `.env`, you may directly edit your Hardhat config to include:

```js
ethereumSepolia: {
  url: "https://sepolia.infura.io/v3/YOUR_KEY",
  accounts: ["0xYOUR_PRIVATE_KEY"]
}
```

---

## 🚀 Deployment (Hardhat)

To deploy on Ethereum Sepolia:

```bash
npx hardhat run scripts/deploy.js --network ethereumSepolia
```

Make sure to update deploy.js and hardhat.config.js with your RPC and private key details.

---

## ✅ Run All Unit Tests

This project uses Mocha + Chai via Hardhat.

```bash
npx hardhat test
```

All 36 tests should pass. You’ll see coverage for:

* Deployment
* Proposals
* Confirmations
* Execution
* Cancellations
* Owner Management
* Threshold Change
* AI Integration
* Nomination

---

## 🧪 Run Specific Test Group

```bash
npx hardhat test --grep "Execution"
```

---

## 📌 Key Features Tested

* Ownership and duplicate validation
* Confirmation tracking
* Cooldown before execution
* AI risk score validation
* Owner-only access control
* Execution failure recovery
* Proposal cancellation logic
* Dynamic threshold enforcement
* Edge cases and failure scenarios

---

## 👨‍🔬 Technologies Used

* Solidity ^0.8.20
* Hardhat
* Chai + Mocha for testing
* Ethers.js
* dotenv

---

🎯 Built with ❤️ for the OnChain Island Selection Task 🏝️
36/36 Tests Passing | AI + Governance Ready | Ready for Production
