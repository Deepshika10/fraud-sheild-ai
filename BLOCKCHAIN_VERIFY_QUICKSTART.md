# Blockchain Verification Page - Quick Start

## Launch Your System

```powershell
# Terminal 1 - Backend (FastAPI)
cd backend
python -m uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend (React)
cd frontend
npm run dev
```

**URLs:**

- Backend API: http://127.0.0.1:8000
- Frontend Dashboard: http://localhost:5174

---

## What You Can Do

### 1. Create a HIGH Risk Transaction

1. Go to **Simulate Transaction** page
2. Enter high-risk details:
   - Amount: $50,000+
   - Location: Nigeria, Russia, Ukraine
   - Device: unknown
   - Merchant: crypto, casino, wire
3. Click Submit
4. Transaction gets analyzed and logged to blockchain (risk_score > 0.75)

### 2. Verify Transaction on Blockchain

1. Go to **Blockchain Verification** page
2. See list of HIGH risk transactions
3. Click **"Verify"** button for any transaction
4. Get result:
   - ✅ **Blockchain Verified** - Hashes match, data is authentic
   - ⚠️ **Data Tampered** - Hashes don't match, data was modified
   - ℹ️ **Not Logged** - Transaction wasn't high-risk enough to log

### 3. View Details

Scroll down to **Verification Details** section to see:

- Transaction ID
- Local hash (from database)
- Blockchain hash (from smart contract)
- Verification status
- Timestamp

### 4. Search Transactions

Use top search bar to filter by:

- Transaction ID
- Risk score
- Risk level

---

## Page Layout

```
┌─────────────────────────────────────────────────────────┐
│ Blockchain Verification                                  │
│ Verify the cryptographic integrity of fraud verdicts    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Transaction ID │ Risk │ Blockchain Hash │ Status │ Act │
├─────────────────────────────────────────────────────────┤
│ txn_123abc...   │ 0.82 │ 7a3f45d8...     │ ✓      │ ▶ │
│ txn_456def...   │ 0.91 │ 9f2b8c1d...     │ ⚠️     │ ▶ │
│ txn_789ghi...   │ 0.78 │ (pending)       │ -      │ ▶ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Verification Details                                     │
│ ✓ txn_123abc...    BLOCKCHAIN VERIFIED                 │
│   Local: 7a3f45d8c2e1...                                │
│   Chain: 7a3f45d8c2e1...                                │
│   ✅ Hashes match (Authentic)                          │
└─────────────────────────────────────────────────────────┘
```

---

## Files Updated

**New Service:**

- `frontend/src/services/blockchainService.js` - API calls for verification

**Updated Page:**

- `frontend/src/pages/BlockchainVerification.jsx` - Complete redesign

**Documentation:**

- `BLOCKCHAIN_VERIFICATION_PAGE.md` - Full feature guide

---

## Examples

### Example 1: Verify a Transaction

```
1. Click "Verify" on transaction ID: txn_abc123
2. Button shows: ⟳ Verifying... (loading state)
3. Result appears:
   ✅ Blockchain Verified
   Local Hash: 7a3f45d8c2e1b4f9...
   Blockchain Hash: 7a3f45d8c2e1b4f9...

→ Transaction is authentic, hashes match!
```

### Example 2: Detect Tampered Data

```
1. Click "Verify" on transaction ID: txn_def456
2. Result appears:
   ⚠️ Data Tampered
   Local Hash: 7a3f45d8c2e1b4f9...
   Blockchain Hash: different_hash_9f2b8c1d...

→ Warning! Transaction data was modified!
```

### Example 3: Not Logged (Low Risk)

```
1. Click "Verify" on LOW/MEDIUM risk transaction
2. Result appears:
   ℹ️ Not Logged
   Message: "Transaction not logged (risk_score ≤ 0.75)"

→ This transaction wasn't high-risk enough to log
```

---

## API Endpoints Used

**Backend calls these endpoints:**

```
GET http://127.0.0.1:8000/transactions
→ Returns: [{ transaction_id, risk_score, risk_level, blockchain_log, ... }]

GET http://127.0.0.1:8000/verify-transaction/{transaction_id}
→ Returns: {
    transaction_id,
    local_hash,
    blockchain_hash,
    status (VERIFIED/TAMPERED/NOT_LOGGED)
  }
```

---

## Table Columns Explained

| Column              | Content                   | Purpose              |
| ------------------- | ------------------------- | -------------------- |
| **Transaction ID**  | 16-char truncated ID      | Identify transaction |
| **Risk Score**      | 0.00 - 1.00               | Fraud probability    |
| **Blockchain Hash** | 20-char truncated SHA256  | Hash stored on chain |
| **Status**          | Pending/Verified/Tampered | Verification result  |
| **Action**          | Verify Button             | Start verification   |

---

## Verification Status Meanings

### ✅ Blockchain Verified (Green)

- Local hash == Blockchain hash
- Transaction has not been modified
- Data integrity confirmed
- Safe to trust this transaction's analysis

### ⚠️ Data Tampered (Red)

- Local hash ≠ Blockchain hash
- Transaction data was altered
- **ALERT:** Investigate immediately
- Trust the blockchain version, not local

### ℹ️ Not Logged (Gray)

- Transaction not on blockchain
- Risk score was ≤ 0.75
- Only HIGH risk transactions are logged
- Cannot verify (no blockchain record)

---

## Search Examples

```
Search: "txn_abc"
→ Shows only transactions with IDs containing "txn_abc"

Search: "0.91"
→ Shows only transactions with risk score 0.91

Search: "HIGH"
→ Shows all HIGH risk transactions (entire list)

Search: ""
→ Shows all HIGH risk transactions (no filter)
```

---

## Troubleshooting

**Q: I see "No high-risk transactions to verify"**

- A: No HIGH risk transactions in system yet
- Solution: Create transactions via "Simulate Transaction" page

**Q: Verify button does nothing**

- A: Backend not running on port 8000
- Solution: Start backend: `python -m uvicorn app.main:app --reload --port 8000`

**Q: All transactions show "Pending verification"**

- A: You haven't clicked the Verify button yet
- Solution: Click the Verify button for any transaction

**Q: Translation showing "Not Logged"**

- A: Transaction risk_score ≤ 0.75
- Solution: Create higher-risk transactions to test

---

## Quick Demo Script

1. **Open two terminals:**

   ```
   Terminal 1: cd backend ; python -m uvicorn app.main:app --reload --port 8000
   Terminal 2: cd frontend ; npm run dev
   ```

2. **Open dashboard:** http://localhost:5174

3. **Go to Simulate Transaction:**
   - Click "Simulate Transaction" in menu
   - Enter: Amount: 60000, Location: Nigeria, Device: unknown, Merchant: crypto
   - Click Submit

4. **Go to Blockchain Verification:**
   - Click "Blockchain Verification" in menu
   - See your transaction in the table
   - Click "Verify" button

5. **View result:**
   - Should show ✅ Blockchain Verified
   - See matching hashes
   - Scroll to see verification details

---

## Performance Notes

- ✅ Transactions load on page open
- ✅ Individual verification per transaction (not batch)
- ✅ Results cached in local state
- ✅ Optimized table rendering
- ✅ Search is instant (client-side)

---

**Status:** ✅ Ready to use  
**Frontend Build:** ✓ 2316 modules, 635 kB JS  
**Backend API:** ✓ /verify-transaction endpoint active
