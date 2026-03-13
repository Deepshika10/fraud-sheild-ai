/**
 * Transaction Management Service
 * Handles fetching and updating transaction statuses.
 */

const SEED_TRANSACTIONS = [
    {
        id: 'TXN-009839',
        amount: 8950,
        riskScore: 87,
        userResponse: 'Disputed',
        fraudReason: 'Velocity check failed — 6 transactions in 3 minutes',
        status: 'Pending',
    },
    {
        id: 'TXN-009833',
        amount: 3200,
        riskScore: 74,
        userResponse: 'No Response',
        fraudReason: 'Geo-anomaly detected — login from 3 countries in 1 hour',
        status: 'Pending',
    },
    {
        id: 'TXN-009822',
        amount: 15000,
        riskScore: 91,
        userResponse: 'Confirmed Legitimate',
        fraudReason: 'Large wire transfer to new international account',
        status: 'Pending',
    },
    {
        id: 'TXN-009815',
        amount: 560,
        riskScore: 62,
        userResponse: 'No Response',
        fraudReason: 'New merchant category — first-time crypto exchange purchase',
        status: 'Pending',
    },
    {
        id: 'TXN-009808',
        amount: 22400,
        riskScore: 95,
        userResponse: 'Disputed',
        fraudReason: 'International transfer + amount 8× above average spend',
        status: 'Pending',
    },
    {
        id: 'TXN-009801',
        amount: 1240,
        riskScore: 71,
        userResponse: 'No Response',
        fraudReason: 'Device fingerprint mismatch — unknown browser + IP',
        status: 'Pending',
    },
    {
        id: 'TXN-009795',
        amount: 420,
        riskScore: 55,
        userResponse: 'Confirmed Legitimate',
        fraudReason: 'Off-hours transaction at 3:12 AM from new device',
        status: 'Pending',
    },
    {
        id: 'TXN-009788',
        amount: 6700,
        riskScore: 83,
        userResponse: 'Disputed',
        fraudReason: 'Suspicious merchant — potential card-testing pattern',
        status: 'Pending',
    },
];

/**
 * Fetches the list of tagged transactions.
 * @returns {Promise<Array>}
 */
export async function getFlaggedTransactions() {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 600));
    return [...SEED_TRANSACTIONS];
}

/**
 * Updates the status of a transaction.
 * @param {string} txId 
 * @param {string} status 
 * @returns {Promise<boolean>}
 */
export async function updateTransactionStatus(txId, status) {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 500));
    console.log(`Transaction ${txId} updated to ${status}`);
    return true;
}
