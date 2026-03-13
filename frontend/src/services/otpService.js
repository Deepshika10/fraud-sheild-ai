/**
 * OTP Verification Service
 * Handles generating and verifying OTPs for flagged transactions.
 */

import { apiClient } from './apiClient'

/**
 * Requests a new 6-digit OTP for the given transaction.
 * The backend returns the OTP in plain text (simulated SMS/email delivery).
 * @param {string} txId
 * @returns {Promise<{otp: string, transaction_id: string, message: string}>}
 */
export async function generateOtp(txId) {
    return apiClient.post('/generate-otp', { transaction_id: txId })
}

/**
 * Submits the OTP entered by the user for verification.
 * @param {string} txId
 * @param {string} otp  - 6-digit code as a string
 * @returns {Promise<{next_step?: string, error?: string, attempts_remaining?: number}>}
 */
export async function verifyOtp(txId, otp) {
    return apiClient.post('/verify-otp', { transaction_id: txId, otp })
}
