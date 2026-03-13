# Blockchain Integration - Quick Start Guide

## What's Been Implemented

### 1. Smart Contract (Solidity)

**File:** `contracts/FraudTransactionLogger.sol`

Features:

- ✅ Store transaction hashes on blockchain
- ✅ Retrieve stored hashes
- ✅ Verify transaction integrity (compare hashes)
- ✅ Event logging for audit trail
- ✅ Owner-based access control

### 2. Blockchain Integration Module

**File:** `backend/app/blockchain_logger.py`

Features:

- ✅ SHA256 hash generation for transactions
- ✅ Web3.py integration for blockchain interaction
- ✅ Automatic fallback mode if blockchain unavailable
- ✅ Transaction logging to smart contract
- ✅ Hash verification against blockchain records
- ✅ Comprehensive error handling

### 3. Transaction Storage Enhancement

**File:** `backend/app/transaction_store.py`

Added Functions:

- ✅ `save_blockchain_record()` - Store blockchain metadata with transaction
- ✅ `get_blockchain_record()` - Retrieve blockchain record for verification

### 4. Backend API Updates

**File:** `backend/app/main.py`

New/Updated Endpoints:

- ✅ `/analyze-transaction` - Now logs HIGH risk (>0.75) to blockchain
- ✅ **`GET /verify-transaction/{transaction_id}`** - New verification endpoint

Updated Threshold:

- ✅ Blockchain logging now triggers at risk_score > 0.75 (was 0.85)
- ✅ This captures all HIGH risk transactions (risk_level = "HIGH")

### 5. Dependencies

**File:** `backend/requirements.txt`

Added:

- ✅ web3==6.11.1
- ✅ cryptography==41.0.7

## Quick Testing Without Real Blockchain

### Test 1: Hash Generation

```bash
cd backend
python -c "
from app.blockchain_logger import generate_transaction_hash

# Create a test transaction
txn = {
    'amount': 50000,
    'location': 'Nigeria',
    'device': 'unknown',
    'merchant': 'crypto'
}

hash_value = generate_transaction_hash(txn)
print(f'Generated Hash: {hash_value}')
print(f'Hash Length: {len(hash_value)} chars (expected 64 for SHA256)')
"
```

**Expected Output:**

```
Generated Hash: 7a3f45d8c2e1b4f9a8c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6
Hash Length: 64 chars (expected 64 for SHA256)
```

### Test 2: Fallback Mode (No Blockchain)

```bash
cd backend
python -c "
from app.blockchain_logger import log_fraud_to_blockchain

# Simulate a high-risk transaction
txn = {
    'transaction_id': 'TXN-TEST-001',
    'amount': 80000,
    'location': 'Russia',
    'device': 'unknown',
    'merchant': 'wire_service'
}

result = log_fraud_to_blockchain(txn)
print('Result:', result)
"
```

**Expected Output:**

```
⚠️ HIGH RISK TRANSACTION DETECTED - Logging to Blockchain
...
Result: {
    'transaction_id': 'TXN-TEST-001',
    'transaction_hash': '...',
    'timestamp': '2024-01-15 10:30:45.123456',
    'status': 'SIMULATED_BLOCKCHAIN',
    'warning': 'Running in fallback mode...'
}
```

### Test 3: Integration with Transaction Analysis

```bash
cd backend
python -c "
from app.decision_engine import analyze_transaction

# HIGH risk transaction (should trigger blockchain logging)
txn = {
    'amount': 50000,
    'location': 'Nigeria',
    'device': 'unknown',
    'merchant': 'crypto'
}

result = analyze_transaction(txn)
print('Risk Score:', result['risk_score'])
print('Risk Level:', result['risk_level'])
print('Will be logged to blockchain:', result['risk_score'] > 0.75)
"
```

## Testing with Real Blockchain

### Setup (One-time)

1. **Start Ganache (local blockchain)**

   ```bash
   ganache --deterministic
   ```

2. **Deploy Smart Contract**
   - Use Remix: https://remix.ethereum.org/
   - Or use Hardhat (see BLOCKCHAIN_SETUP.md)

3. **Configure Backend**
   Edit `backend/app/blockchain_logger.py`:
   ```python
   BLOCKCHAIN_CONFIG = {
       "provider_url": "http://127.0.0.1:8545",
       "contract_address": "0x...",  # From deployment
       "contract_abi": FRAUD_CONTRACT_ABI,
       "account_address": "0x...",  # From Ganache
       "account_private_key": "0x...",  # From Ganache
   }
   ```

### Test API Endpoints

**1. Create HIGH RISK transaction (should log to blockchain)**

```bash
curl -X POST http://localhost:8000/create_transaction \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "location_distance": 1800,
    "device_mismatch": 1,
    "velocity": 5,
    "unusual_time": 0,
    "new_merchant": 1,
    "failed_logins": 3,
    "ip_risk": 1,
    "fraud_probability": 0.95
  }'
```

Look for blockchain logging in output:

```
⚠️ HIGH RISK TRANSACTION DETECTED - Logging to Blockchain
✅ Transaction logged to blockchain. Tx Hash: 0x...
```

**2. Verify transaction on blockchain**

```bash
# Replace TXN_ID with actual transaction ID from step 1
curl http://localhost:8000/verify-transaction/TXN_ID
```

Expected response:

```json
{
  "transaction_id": "TXN_ID",
  "local_hash": "7a3f...",
  "blockchain_hash": "7a3f...",
  "status": "VERIFIED",
  "blockchain_tx_hash": "0x1234...",
  "timestamp": "2024-01-15 10:30:45.123456"
}
```

**3. Verify LOW/MEDIUM risk (should NOT be on blockchain)**

```bash
curl http://localhost:8000/verify-transaction/LOW_RISK_TXN_ID
```

Expected response:

```json
{
  "transaction_id": "LOW_RISK_TXN_ID",
  "status": "NOT_LOGGED",
  "message": "Transaction was not logged to blockchain (risk_score <= 0.75)"
}
```

## Verification Workflow

### Scenario: Check if Transaction Was Tampered

```bash
# 1. Get the transaction
curl http://localhost:8000/transaction/TXN_ID

# Output includes: full transaction data

# 2. Verify integrity
curl http://localhost:8000/verify-transaction/TXN_ID

# Compare local_hash and blockchain_hash:
# - SAME = ✅ VERIFIED (not tampered)
# - DIFFERENT = ⚠️ TAMPERED (data was modified)
```

## Risk Score Levels

| Risk Level | Risk Score | Blockchain Logged      |
| ---------- | ---------- | ---------------------- |
| LOW        | < 0.4      | ❌ No                  |
| MEDIUM     | 0.4 - 0.7  | ❌ No                  |
| **HIGH**   | ≥ 0.7      | ✅ **Yes** (if > 0.75) |

## Fallback Behavior

If blockchain is down or not configured:

| Operation          | Behavior                      |
| ------------------ | ----------------------------- |
| Hash generation    | ✅ Works (always)             |
| Blockchain storage | Uses local memory             |
| Verification       | Uses local hashes only        |
| System status      | ⚠️ "Running in FALLBACK MODE" |

When blockchain reconnects, manually redeploy contract to resume blockchain logging.

## File Structure

```
fraud-sheild-ai/
├── backend/
│   ├── app/
│   │   ├── blockchain_logger.py       [NEW] Blockchain integration
│   │   ├── transaction_store.py       [UPDATED] Blockchain record tracking
│   │   ├── main.py                    [UPDATED] /verify-transaction endpoint
│   │   ├── decision_engine.py         [unchanged]
│   │   └── transaction_generator.py   [unchanged]
│   └── requirements.txt               [UPDATED] Added web3, cryptography
├── contracts/
│   └── FraudTransactionLogger.sol     [NEW] Smart contract
├── BLOCKCHAIN_SETUP.md                [NEW] Full setup guide
└── BLOCKCHAIN_QUICK_REFERENCE.md      [NEW] This file
```

## Troubleshooting

| Issue                             | Solution                                              |
| --------------------------------- | ----------------------------------------------------- |
| "web3.py not installed"           | Run `pip install -r backend/requirements.txt`         |
| "Could not connect to blockchain" | Start Ganache: `ganache --deterministic`              |
| "Transaction reverted: revert"    | Deploy smart contract first                           |
| Fallback mode activating          | Configure BLOCKCHAIN_CONFIG in blockchain_logger.py   |
| Can't verify transaction          | Ensure transaction was HIGH risk (>0.75) when created |

## Next Steps

1. ✅ Review the smart contract in `contracts/FraudTransactionLogger.sol`
2. ✅ Read `BLOCKCHAIN_SETUP.md` for detailed configuration
3. ✅ Deploy contract to Ganache
4. ✅ Configure backend with contract address
5. ✅ Test endpoints with sample transactions
6. ✅ Verify hash integrity using `/verify-transaction` endpoint

## Security Notes

⚠️ **Before Production:**

- [ ] Never commit private keys to version control
- [ ] Use environment variables for sensitive config
- [ ] Test thoroughly on local blockchain (Ganache) first
- [ ] Use testnet (Sepolia) before mainnet
- [ ] Verify smart contract code on Etherscan
- [ ] Monitor gas costs for blockchain writes
- [ ] Implement rate limiting to prevent abuse

## Support

For detailed setup instructions, see: `BLOCKCHAIN_SETUP.md`
For API documentation, see: Main README or `/docs` endpoint
