/**
 * Transaction Management Service
 * Handles fetching and updating transaction statuses.
 */

import { apiClient } from './apiClient'

function toUiStatus(status) {
    if (status === 'APPROVED') {
        return 'Approved'
    }
    if (status === 'BLOCKED') {
        return 'Rejected'
    }
    return 'Pending'
}

function toUserResponse(status) {
    if (status === 'WAITING_BANK_APPROVAL') {
        return 'Confirmed Legitimate'
    }
    if (status === 'WAITING_OTP_VERIFICATION') {
        return 'OTP Required'
    }
    if (status === 'BLOCKED') {
        return 'Disputed'
    }
    return 'No Response'
}

function mapTransactionToUi(tx) {
    return {
        id: tx.transaction_id,
        amount: Number(tx.features?.amount || 0),
        riskScore: Math.round(Number(tx.risk_score || 0) * 100),
        userResponse: toUserResponse(tx.status),
        fraudReason: (tx.reasons || []).join(' | ') || 'No reasons provided',
        status: toUiStatus(tx.status),
    }
}

/**
 * Fetches the list of tagged transactions.
 * @returns {Promise<Array>}
 */
export async function getFlaggedTransactions() {
    const data = await apiClient.get('/transactions')
    return Object.values(data).map(mapTransactionToUi)
}

/**
 * Updates the status of a transaction.
 * @param {string} txId 
 * @param {string} status 
 * @returns {Promise<boolean>}
 */
export async function updateTransactionStatus(txId, status) {
    const decision = status === 'Approved' ? 'approve' : 'reject'
    const response = await apiClient.post('/bank_approve_transaction', {
        transaction_id: txId,
        decision,
    })
    return !response.error
}
