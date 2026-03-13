const API_BASE = 'http://127.0.0.1:8000';

/**
 * Fetch high-risk transactions for blockchain verification
 */
export async function getHighRiskTransactions() {
  try {
    const response = await fetch(`${API_BASE}/transactions`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    
    const transactions = await response.json();
    
    // Filter only HIGH risk transactions (verification endpoint handles blockchain check)
    return transactions.filter(tx => tx.risk_level === 'HIGH');
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

/**
 * Verify a transaction on the blockchain
 * @param {string} transactionId - The transaction ID to verify
 * @returns {object} Verification result with status and hashes
 */
export async function verifyTransactionOnBlockchain(transactionId) {
  try {
    const response = await fetch(
      `${API_BASE}/verify-transaction/${transactionId}`
    );
    
    if (!response.ok) {
      throw new Error('Verification failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return {
      transaction_id: transactionId,
      status: 'ERROR',
      message: error.message,
    };
  }
}

/**
 * Get a single transaction details
 */
export async function getTransactionDetails(transactionId) {
  try {
    const response = await fetch(
      `${API_BASE}/transaction/${transactionId}`
    );
    if (!response.ok) throw new Error('Failed to fetch transaction');
    return await response.json();
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }
}
