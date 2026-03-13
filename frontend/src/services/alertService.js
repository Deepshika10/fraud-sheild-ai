/**
 * Alert Management Service
 * Handles fraud alerts and mitigation actions.
 */

import { apiClient } from './apiClient'

function severityFromScore(score) {
    if (score >= 85) {
        return 'Critical'
    }
    if (score >= 70) {
        return 'High'
    }
    if (score >= 40) {
        return 'Medium'
    }
    return 'Low'
}

function alertTypeFromReasons(reasons) {
    const text = (reasons || []).join(' ').toLowerCase()
    if (text.includes('location')) {
        return 'Unusual Location'
    }
    if (text.includes('device')) {
        return 'New Device Login'
    }
    if (text.includes('velocity') || text.includes('frequency')) {
        return 'Velocity Abuse'
    }
    if (text.includes('ip')) {
        return 'Risky IP Pattern'
    }
    return 'Fraud Risk Alert'
}

/**
 * Fetches active fraud alerts.
 * @returns {Promise<Array>}
 */
export async function getActiveAlerts() {
    const data = await apiClient.get('/transactions')
    const rows = Object.values(data)

    return rows
        .filter(tx => tx.status !== 'APPROVED' && tx.status !== 'BLOCKED')
        .map((tx, index) => {
            const riskScore = Math.round(Number(tx.risk_score || 0) * 100)
            const amount = Number(tx.features?.amount || 0)
            return {
                id: `ALT-${String(index + 1).padStart(4, '0')}`,
                txId: tx.transaction_id,
                type: alertTypeFromReasons(tx.reasons),
                severity: severityFromScore(riskScore),
                amount: `$${amount.toLocaleString('en-US')}`,
                time: 'Live',
                location: 'Unknown',
            }
        })
}

/**
 * Processes an alert mitigation action.
 * @param {string} txId 
 * @param {string} action - 'Approve' | 'Block'
 * @returns {Promise<boolean>}
 */
export async function processAlertAction(txId, action) {
    const decision = action === 'Approve' ? 'approve' : 'block'
    const response = await apiClient.post('/user_confirm_transaction', {
        transaction_id: txId,
        decision,
    })
    return !response.error
}
