/**
 * Risk Analysis Service
 * Contains logic for evaluating transaction fraud risk.
 */

const HIGH_RISK_LOCATIONS = [
    'nigeria', 'lagos', 'russia', 'moscow', 'ukraine', 'kyiv', 'belarus', 'unknown', 'anonymous'
];

const SUSPECT_MERCHANTS = [
    'casino', 'crypto', 'gift card', 'wire', 'unknown', 'foreign'
];

/**
 * Analyzes a transaction to determine its fraud risk score and level.
 * @param {Object} transaction - The transaction data from the form.
 * @returns {Object} { riskScore, riskLevel, reasons }
 */
export function analyzeTransaction(transaction) {
    const amount = parseFloat(transaction.amount) || 0;
    const reasons = [];
    let riskScore = 10;

    // Amount checks
    if (amount > 10000) {
        riskScore += 40;
        reasons.push('Large transaction amount detected — significantly above average spend threshold');
    } else if (amount > 5000) {
        riskScore += 25;
        reasons.push('High-value transaction flagged for review (above $5,000)');
    } else if (amount > 2000) {
        riskScore += 12;
        reasons.push('Elevated transaction amount above normal spending pattern');
    }

    // Location checks
    const locationLower = (transaction.location || '').toLowerCase();
    if (HIGH_RISK_LOCATIONS.some(l => locationLower.includes(l))) {
        riskScore += 30;
        reasons.push(`Location anomaly detected — high-risk region: ${transaction.location}`);
    } else if (!transaction.location) {
        riskScore += 10;
        reasons.push('Transaction location missing — unable to verify geographic legitimacy');
    }

    // Device checks
    const deviceLower = (transaction.deviceId || '').toLowerCase();
    if (!transaction.deviceId) {
        riskScore += 15;
        reasons.push('New device detected — no prior transaction history for this device');
    } else if (deviceLower.includes('unknown') || deviceLower.includes('anon') || deviceLower.includes('vpn')) {
        riskScore += 20;
        reasons.push(`Suspicious device identifier — possible obfuscation: "${transaction.deviceId}"`);
    } else if (transaction.deviceId && transaction.deviceId.length < 5) {
        riskScore += 8;
        reasons.push('Device ID appears invalid or incomplete');
    }

    // User checks
    if (!transaction.userId) {
        riskScore += 12;
        reasons.push('User ID not provided — transaction cannot be linked to a verified account');
    }

    // Time checks
    if (transaction.txTime) {
        const hour = new Date(transaction.txTime).getHours();
        if (hour >= 1 && hour <= 5) {
            riskScore += 18;
            reasons.push(`Off-hours transaction — activity at ${new Date(transaction.txTime).toLocaleTimeString()} is unusual`);
        }
    }

    // Merchant checks
    const merchantLower = (transaction.merchant || '').toLowerCase();
    if (!transaction.merchant) {
        riskScore += 8;
        reasons.push('Merchant name missing');
    } else if (SUSPECT_MERCHANTS.some(m => merchantLower.includes(m))) {
        riskScore += 22;
        reasons.push(`High-risk merchant category detected: "${transaction.merchant}"`);
    }

    // Final score normalization
    riskScore = Math.min(riskScore, 99);

    // Default reasons if safe
    if (reasons.length === 0) {
        reasons.push("Transaction amount is within the user's normal spending range");
        reasons.push("Device and location match the user's historical profile");
        reasons.push("No anomalies detected in transaction pattern or behavior");
    }

    // Determine risk level
    const riskLevel = riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low';

    return { riskScore, riskLevel, reasons };
}

/**
 * Simulates an API call to analyze a transaction.
 * @param {Object} transaction 
 * @returns {Promise<Object>}
 */
export async function simulateAnalysisApi(transaction) {
    // Simulate network latency
    await new Promise(r => setTimeout(r, 1400));

    const analysis = analyzeTransaction(transaction);
    const txId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);

    return {
        ...analysis,
        txId,
        timestamp: new Date().toLocaleString()
    };
}
