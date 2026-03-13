# Blockchain Integration Guide

## Overview

The AI Fraud Detection System integrates blockchain technology to create tamper-proof audit logs for high-risk transactions. When a transaction is detected with a risk score > 0.75, its SHA256 hash is stored on the blockchain along with a timestamp, creating an immutable record.

## Architecture

### Flow Diagram

```
Transaction Analysis (AI Model)
    ↓
Risk Score Calculation
    ↓
If Risk Score > 0.75:
    ├─ Generate SHA256 Hash of transaction
    ├─ Store hash on blockchain via smart contract
    ├─ Save transaction locally
    └─ Return blockchain record to frontend

Verification Flow:
    Transaction ID → GET /verify-transaction/{txn_id}
        ├─ Regenerate local hash
        ├─ Retrieve blockchain hash
        ├─ Compare hashes
        └─ Return VERIFIED or TAMPERED status
```

### Smart Contract: FraudTransactionLogger.sol

The smart contract provides:

- **logTransaction()**: Store transaction hash on blockchain (owner only)
- **getTransactionHash()**: Retrieve stored hash for a transaction
- **verifyTransaction()**: Verify if a hash matches the stored record
- **Event logging**: Emit events when transactions are logged or verified

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js (for smart contract deployment)
- Ganache CLI or Ganache GUI (for local blockchain)
- Hardhat or Truffle (optional, for smart contract management)

### Step 1: Install Dependencies

```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt

# Install web3.py and Ethereum tools
pip install web3 eth-account eth-keys
```

### Step 2: Set Up Local Blockchain (Ganache)

#### Option A: Using Ganache CLI

```bash
# Install Ganache CLI globally
npm install -g ganache

# Start Ganache on default port 8545
ganache --deterministic

# Output will show:
# Listening on 127.0.0.1:8545
# Account 0: 0x... (with 100 ETH)
# ...
```

#### Option B: Using Ganache GUI

1. Download Ganache from: https://trufflesuite.com/ganache/
2. Install and launch the application
3. Click "New Workspace"
4. Set RPC Server to `127.0.0.1:8545`
5. Start the workspace

### Step 3: Deploy Smart Contract

The smart contract must be deployed to your blockchain before the Python backend can interact with it.

#### Using Hardhat (Recommended)

```bash
# Create Hardhat project (if not exists)
npx hardhat init

# Copy the FraudTransactionLogger.sol to contracts/

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

**Sample Hardhat deploy script (scripts/deploy.js):**

```javascript
async function main() {
  const FraudTransactionLogger = await ethers.getContractFactory(
    "FraudTransactionLogger",
  );
  const fraudLogger = await FraudTransactionLogger.deploy();
  await fraudLogger.deployed();

  console.log("✅ FraudTransactionLogger deployed at:", fraudLogger.address);
  console.log("📋 ABI:", JSON.stringify(fraudLogger.interface.fragments));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

#### Using Remix (Web-Based Alternative)

1. Go to https://remix.ethereum.org/
2. Create new file: `FraudTransactionLogger.sol`
3. Copy contract code from `contracts/FraudTransactionLogger.sol`
4. Compile contract
5. Deploy to injected provider (connect Ganache)
6. Copy the contract address and ABI

### Step 4: Configure Backend

Edit `backend/app/blockchain_logger.py` and update the configuration:

```python
BLOCKCHAIN_CONFIG = {
    "provider_url": "http://127.0.0.1:8545",  # Your blockchain RPC URL
    "contract_address": "0x...",  # Paste deployed contract address here
    "contract_abi": FRAUD_CONTRACT_ABI,  # Already defined in the file
    "account_address": "0x...",  # Your account address from Ganache
    "account_private_key": "0x...",  # Private key (with 0x prefix)
}
```

**Getting Private Keys from Ganache:**

1. Open Ganache
2. Click on the key icon next to an account
3. Copy the private key

### Step 5: Verify Connection

Test the blockchain connection:

```bash
cd backend
python -c "
from app.blockchain_logger import get_web3_connection, get_contract_instance
w3 = get_web3_connection()
print('✅ Connected to blockchain:', w3.is_connected())
contract = get_contract_instance()
print('✅ Contract loaded:', contract is not None)
"
```

## Usage

### Starting the Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### Analyzing a Transaction

```bash
curl -X POST http://localhost:8000/analyze-transaction \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "location": "Nigeria",
    "device": "unknown",
    "merchant": "crypto-exchange"
  }'
```

If risk_score > 0.75, the transaction will be logged to blockchain.

### Verifying Transaction Integrity

```bash
# After a high-risk transaction is logged:
curl http://localhost:8000/verify-transaction/{transaction_id}
```

**Response:**

```json
{
  "transaction_id": "abc123...",
  "local_hash": "7a3f45...",
  "blockchain_hash": "7a3f45...",
  "status": "VERIFIED",
  "blockchain_tx_hash": "0x1234...",
  "timestamp": "2024-01-15 10:30:45.123456"
}
```

## API Endpoints

### POST /analyze-transaction

Analyzes a transaction and logs to blockchain if HIGH RISK.

**Request:**

```json
{
  "amount": 50000,
  "location": "Nigeria",
  "device": "unknown",
  "merchant": "crypto"
}
```

**Response:**

```json
{
  "risk_score": 0.82,
  "risk_level": "HIGH",
  "prediction": 1,
  "blockchain_log": {
    "transaction_id": "txn_123...",
    "transaction_hash": "7a3f...",
    "status": "HASH_STORED_ON_BLOCKCHAIN",
    "timestamp": "2024-01-15 10:30:45.123456"
  }
}
```

### GET /verify-transaction/{transaction_id}

Verifies transaction integrity by comparing local and blockchain hashes.

**Response (Verified):**

```json
{
  "transaction_id": "txn_123...",
  "local_hash": "7a3f45...",
  "blockchain_hash": "7a3f45...",
  "status": "VERIFIED",
  "blockchain_tx_hash": "0x5678...",
  "timestamp": "2024-01-15 10:30:45.123456"
}
```

**Response (Tampered):**

```json
{
  "transaction_id": "txn_123...",
  "local_hash": "7a3f45...",
  "blockchain_hash": "different...",
  "status": "TAMPERED",
  "blockchain_tx_hash": "0x5678...",
  "timestamp": "2024-01-15 10:30:45.123456"
}
```

**Response (Not Logged):**

```json
{
  "transaction_id": "txn_456...",
  "status": "NOT_LOGGED",
  "message": "Transaction was not logged to blockchain (risk_score <= 0.75)"
}
```

## Fallback Mode

If blockchain is unavailable, the system automatically switches to **FALLBACK MODE**:

- Transactions are still hashed using SHA256
- Hashes are stored in local memory (transaction store)
- The `/verify-transaction` endpoint works but uses local hashes only
- When blockchain becomes available, you can migrate hashes by re-deploying

This ensures the fraud detection system continues operating even if blockchain is down.

## Security Considerations

1. **Private Key Management**: Never commit private keys to version control. Use environment variables:

   ```python
   import os
   BLOCKCHAIN_CONFIG["account_private_key"] = os.getenv("BLOCKCHAIN_PRIVATE_KEY")
   ```

2. **Testnet vs Mainnet**: Always test on local (Ganache) or testnet (Sepolia) before deploying to Ethereum mainnet.

3. **Contract Verification**: Verify contract code on Etherscan before using in production.

4. **Rate Limiting**: Implement rate limiting to avoid excessive blockchain writes:

   ```python
   MAX_BLOCKCHAIN_TXNS_PER_MINUTE = 10
   ```

5. **Gas Cost Optimization**: Batch multiple transaction hashes to reduce gas costs on public blockchains.

## Troubleshooting

### Issue: "Could not connect to blockchain"

**Solution:**

- Verify Ganache is running: `curl http://127.0.0.1:8545`
- Check RPC URL in BLOCKCHAIN_CONFIG
- Ensure port 8545 is not blocked by firewall

### Issue: "Transaction reverted: revert"

**Solution:**

- Verify contract address in BLOCKCHAIN_CONFIG
- Check that the calling account has gas
- Verify the account has owner privileges on the contract

### Issue: "web3.py not installed"

**Solution:**

```bash
pip install web3 eth-account cryptography
```

### Issue: "Contract not available. Running in FALLBACK MODE"

**Solution:**

- Deploy the smart contract first
- Update contract_address in BLOCKCHAIN_CONFIG
- Ensure ABI is correctly set

## Production Deployment

### For Sepolia Testnet

1. Create Infura account: https://infura.io/
2. Create project and get API key
3. Update config:
   ```python
   BLOCKCHAIN_CONFIG = {
       "provider_url": "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
       "contract_address": "0x...",
       # ... rest of config
   }
   ```
4. Deploy contract to Sepolia using Hardhat:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

### For Ethereum Mainnet

⚠️ **WARNING**: This requires real ETH and incurs gas costs.

1. Set up with mainnet RPC (Infura, Alchemy, etc.)
2. Deploy contract with mainnet deployment script
3. Monitor gas prices carefully
4. Consider batch writing for cost optimization

## Monitoring

Add monitoring to track blockchain logging:

```python
# In main.py after blockchain logging
import logging

logger = logging.getLogger("blockchain")
handler = logging.FileHandler("blockchain_logs.log")
logger.addHandler(handler)

# Log every blockchain transaction
if blockchain_record:
    logger.info(f"Logged {transaction_id} to blockchain: {blockchain_record}")
```

## References

- Web3.py Documentation: https://web3py.readthedocs.io/
- Solidity Contract Guide: https://docs.soliditylang.org/
- Ganache Documentation: https://trufflesuite.com/ganache/
- Ethereum JSON-RPC: https://ethereum.org/en/developers/docs/apis/json-rpc/
