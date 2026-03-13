/**
 * Google Authenticator (TOTP) Service
 * Handles setting up and verifying Google Authenticator for flagged transactions.
 */

import { apiClient } from './apiClient'

/**
 * Sets up Google Authenticator for the given transaction.
 * Returns a QR code and secret key for the user to scan.
 * @param {string} txId
 * @returns {Promise<{secret: string, qr_code: string, transaction_id: string, message: string}>}
 */
export async function setupAuthenticator(txId) {
    return apiClient.post('/setup-authenticator', { transaction_id: txId })
}

/**
 * Submits the 6-digit code from Google Authenticator for verification.
 * @param {string} txId
 * @param {string} code  - 6-digit TOTP code as a string
 * @returns {Promise<{next_step?: string, error?: string, attempts_remaining?: number}>}
 */
export async function verifyAuthenticator(txId, code) {
    return apiClient.post('/verify-authenticator', { transaction_id: txId, code })
}

// Backwards compatibility aliases for migration
export const generateOtp = setupAuthenticator
export const verifyOtp = verifyAuthenticator

