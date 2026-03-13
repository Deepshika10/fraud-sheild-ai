/**
 * Alert Management Service
 * Handles fraud alerts and mitigation actions.
 */

const ALERTS = [
    { id: 'ALT-0012', txId: 'TXN-009841', type: 'Card Cloning', severity: 'Critical', amount: '$4,200', time: '2 min ago', location: 'Lagos, Nigeria' },
    { id: 'ALT-0011', txId: 'TXN-009835', type: 'Wire Fraud', severity: 'Critical', amount: '$12,400', time: '18 min ago', location: 'Unknown' },
    { id: 'ALT-0010', txId: 'TXN-009839', type: 'Velocity Abuse', severity: 'High', amount: '$8,950', time: '42 min ago', location: 'Dubai, UAE' },
    { id: 'ALT-0009', txId: 'TXN-009833', type: 'Account Takeover', severity: 'High', amount: '$3,200', time: '1h ago', location: 'Moscow, Russia' },
    { id: 'ALT-0008', txId: 'TXN-009827', type: 'Identity Theft', severity: 'High', amount: '$7,650', time: '2h ago', location: 'Bucharest, RO' },
    { id: 'ALT-0007', txId: 'TXN-009816', type: 'Unusual Location', severity: 'Medium', amount: '$1,100', time: '3h ago', location: 'Beijing, China' },
    { id: 'ALT-0006', txId: 'TXN-009804', type: 'New Device Login', severity: 'Medium', amount: '$540', time: '5h ago', location: 'Toronto, Canada' },
    { id: 'ALT-0005', txId: 'TXN-009788', type: 'Chargeback Risk', severity: 'Low', amount: '$89', time: '8h ago', location: 'London, UK' },
];

/**
 * Fetches active fraud alerts.
 * @returns {Promise<Array>}
 */
export async function getActiveAlerts() {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 700));
    return [...ALERTS];
}

/**
 * Processes an alert mitigation action.
 * @param {string} alertId 
 * @param {string} action - 'Approve' | 'Block'
 * @returns {Promise<boolean>}
 */
export async function processAlertAction(alertId, action) {
    await new Promise(r => setTimeout(r, 400));
    console.log(`Alert ${alertId} processed with action: ${action}`);
    return true;
}
