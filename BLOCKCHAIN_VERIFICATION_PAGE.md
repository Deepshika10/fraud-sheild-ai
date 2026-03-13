# Blockchain Verification Page - Updated Features

## What's New

The Blockchain Verification page has been completely redesigned to display real high-risk transactions and enable blockchain verification.

## Features

### 1. **Transaction List**

- Displays all HIGH risk transactions from the backend
- Shows transaction ID, risk score, blockchain hash, and status
- Filters transactions based on your search query

### 2. **Blockchain Verification Button**

- Each transaction has a **"Verify"** button
- Clicking it calls the backend `/verify-transaction/{transaction_id}` endpoint
- Shows real-time verification results

### 3. **Verification Results**

Three possible outcomes:

| Status                     | Meaning                                           | Icon | Color |
| -------------------------- | ------------------------------------------------- | ---- | ----- |
| **✅ Blockchain Verified** | Hashes match - transaction integrity confirmed    | ✓    | Green |
| **⚠️ Data Tampered**       | Hashes differ - transaction data was modified     | ⚠️   | Red   |
| **ℹ️ Not Logged**          | Transaction not on blockchain (risk_score ≤ 0.75) | ℹ️   | Gray  |

### 4. **Clean Table Layout**

```
┌─────────────────────────────────────────────────────────────────┐
│ Transaction ID    │ Risk Score │ Blockchain Hash │ Status │ Action │
├─────────────────────────────────────────────────────────────────┤
│ txn_abc123...     │ 0.82 HIGH  │ 7a3f45d8...     │ ✓      │ Verify │
│ txn_def456...     │ 0.91 HIGH  │ 9f2b8c1d...     │ ⚠️     │ Re-Verify│
└─────────────────────────────────────────────────────────────────┘
```

### 5. **Dynamic Updates**

- Loading state while fetching transactions
- Per-transaction verification state
- Results displayed in a collapsible details section
- Search integration (filters by transaction ID, risk level, or risk score)

## How to Use

### 1. Navigate to Blockchain Verification Page

Click on the "Blockchain Verification" link in the main menu.

### 2. View High-Risk Transactions

The page automatically loads all HIGH risk transactions that were logged to the blockchain.

### 3. Verify Each Transaction

Click the **"Verify"** button for any transaction:

- The button changes to show loading state
- Backend compares local vs blockchain hash
- Result displays with ✓ (verified) or ⚠️ (tampered)

### 4. Search Transactions

Use the top search bar to filter by:

- Transaction ID
- Risk level (HIGH)
- Risk score

### 5. View Verification Details

Scroll down to see the **Verification Details** section:

- Shows transaction ID
- Local hash (from transaction data)
- Blockchain hash (from smart contract)
- Verification status and timestamp

## API Integration

### File: `frontend/src/services/blockchainService.js`

**Functions:**

```javascript
getHighRiskTransactions(); // Fetch all HIGH risk transactions
verifyTransactionOnBlockchain(); // Call verification endpoint
getTransactionDetails(); // Get single transaction details
```

### Endpoints Used:

- `GET /transactions` - Fetch all transactions
- `GET /verify-transaction/{transaction_id}` - Verify transaction

## File Structure

```
frontend/src/
├── pages/
│   └── BlockchainVerification.jsx  [UPDATED] Interactive verification table
├── services/
│   └── blockchainService.js        [NEW] Blockchain API calls
```

## Data Flow

```
User Opens Page
    ↓
Load HIGH risk transactions from backend
    ↓
Display in table with Verify buttons
    ↓
User clicks Verify for transaction
    ↓
Call /verify-transaction/{txn_id}
    ↓
Backend compares local vs blockchain hash
    ↓
Update UI with VERIFIED or TAMPERED status
    ↓
Show details in verification panel
```

## UI States

### Loading State

```
⏳ Loading high-risk transactions...
```

### Empty State

```
🛡️ No high-risk transactions to verify
HIGH risk transactions with blockchain records will appear here.
```

### Verification In Progress

```
Transaction ID: txn_abc123...
Status: ⟳ Verifying...
```

### Verification Complete (Verified)

```
Transaction ID: txn_abc123...
Status: ✅ Blockchain Verified
Local Hash: 7a3f45d8...
Blockchain Hash: 7a3f45d8...
```

### Verification Complete (Tampered)

```
Transaction ID: txn_abc123...
Status: ⚠️ Data Tampered
Local Hash: 7a3f45d8...
Blockchain Hash: 9f2b8c1d...  ← DIFFERENT!
```

## Features Demo

### Scenario 1: Verify a Legitimate Transaction

1. Go to Blockchain Verification page
2. Click "Verify" button on first transaction
3. Result: ✅ Blockchain Verified
4. Shows: Both hashes match, integrity confirmed

### Scenario 2: Tampered Data Detection

1. Go to Blockchain Verification page
2. Click "Verify" on a transaction
3. Result: ⚠️ Data Tampered
4. Shows: Hashes don't match, data was modified

### Scenario 3: Transaction Not Logged

1. Go to Blockchain Verification page
2. Click "Verify" on a LOW/MEDIUM risk transaction
3. Result: ℹ️ Not Logged
4. Message: "Transaction was not logged to blockchain (risk_score ≤ 0.75)"

## Search Integration

The Blockchain Verification page supports search filtering:

```
Search for: "0.9"
Result: Shows only HIGH risk transactions with risk_score around 0.9

Search for: "txn_123"
Result: Shows only transactions with IDs containing "txn_123"

Search for: "HIGH"
Result: Shows all HIGH risk transactions (all of them on this page)
```

## Backend Requirements

For the page to work, your backend must have:

- ✅ `GET /transactions` endpoint - Returns list of transactions
- ✅ `GET /verify-transaction/{transaction_id}` endpoint - Returns verification result

These are already implemented in your backend.

## Styling

The page uses the same design system as the rest of your dashboard:

- Glass-card layout
- Tailwind CSS styling
- Lucide icons
- Dark theme with primary/success/red colors
- Smooth transitions and animations

## Performance

- Transactions loaded on component mount
- Individual verification requests (no batch processing needed)
- Verification results cached per transaction
- Optimized table rendering for large transaction lists

## Troubleshooting

| Issue                                 | Solution                                                              |
| ------------------------------------- | --------------------------------------------------------------------- |
| "No high-risk transactions to verify" | No transactions currently in the system, or none logged to blockchain |
| "Verification timeout"                | Check backend is running on http://127.0.0.1:8000                     |
| Search not working                    | Ensure Layout.jsx is passing searchQuery via Outlet context           |
| Verification fails                    | Ensure backend /verify-transaction endpoint is working                |

## Next Steps

1. Start both backend and frontend:

   ```bash
   # Terminal 1 - Backend
   cd backend
   python -m uvicorn app.main:app --reload --port 8000

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. Open http://localhost:5174

3. Navigate to **Blockchain Verification** page

4. Create a HIGH risk transaction (risk_score > 0.75) from **Simulate Transaction** page

5. Go back to **Blockchain Verification** page

6. Click **"Verify"** button to check hash integrity

---

**Status:** ✅ Updated and ready to use
**Last Updated:** March 13, 2026
**Build Status:** ✓ Frontend builds successfully (2316 modules)
