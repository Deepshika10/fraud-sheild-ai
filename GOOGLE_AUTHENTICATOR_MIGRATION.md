# Google Authenticator Migration Guide

## Overview

The fraud-shield-ai system has been successfully migrated from simple OTP (One-Time Password) to **Google Authenticator** (TOTP - Time-Based One-Time Password) for enhanced security.

## Changes Made

### Backend Changes

#### 1. New Dependencies (`backend/requirements.txt`)

- `pyotp==2.9.0` - For TOTP generation and verification
- `qrcode[pil]==7.4.2` - For QR code generation

#### 2. Updated Endpoints in `backend/app/main.py`

**Replaced Endpoints:**

- `POST /generate-otp` → `POST /setup-authenticator`
- `POST /verify-otp` → `POST /verify-authenticator`

**New `/setup-authenticator` Endpoint**

```
POST /setup-authenticator
Request:
  {
    "transaction_id": "string"
  }

Response:
  {
    "transaction_id": "string",
    "secret": "base32-encoded-secret",
    "qr_code": "data:image/png;base64,...",
    "message": "Scan the QR code with Google Authenticator"
  }
```

**New `/verify-authenticator` Endpoint**

```
POST /verify-authenticator
Request:
  {
    "transaction_id": "string",
    "code": "6-digit-code-from-authenticator"
  }

Response (Success):
  {
    "message": "Authentication verified. Transaction approved.",
    "next_step": "APPROVED|BANK_APPROVAL",
    "transaction": {...}
  }

Response (Error):
  {
    "error": "Invalid authenticator code",
    "attempts_remaining": 2
  }
```

#### 3. Internal Storage

- Replaced `otp_store` with `totp_store`
- Stores secrets instead of random OTPs
- Maintains same 3-attempt limit

### Frontend Changes

#### 1. New Components

**New: `frontend/src/components/GoogleAuthenticatorModal.jsx`**

- Complete workflow for Google Authenticator setup and verification
- Features:
  - QR code display for scanning
  - Backup secret code with copy-to-clipboard
  - 6-digit code input with real-time validation
  - Attempt tracking (max 3 attempts)
  - Smooth transitions between setup, scan, input, and verification steps

#### 2. Updated Services (`frontend/src/services/otpService.js`)

**New Functions:**

```javascript
setupAuthenticator(txId); // Setup 2FA and return QR code
verifyAuthenticator(txId, code); // Verify 6-digit code
```

**Backwards Compatibility:**

- `generateOtp` and `verifyOtp` are aliased to new functions for migration

#### 3. Updated Pages

**`frontend/src/pages/SimulateTransaction.jsx`**

- Replaced `OtpModal` with `GoogleAuthenticatorModal`
- Updated handlers:
  - `handleOtpGenerate()` → `handleSetupAuthenticator()`
  - `handleOtpVerify()` → `handleVerifyAuthenticator()`
- Updated UI labels from "OTP" to "2FA"
- Renamed button from "Complete OTP Verification" to "Complete 2FA Verification"

### Status Names (Unchanged)

For consistency, status names remain the same:

- `WAITING_OTP_VERIFICATION` - Still used for 2FA-requiring transactions
- `HIGH_RISK_WAITING_USER` - Still used for critical fraud

## User Workflow

### 1. **Transaction Analysis**

User submits transaction details that get flagged as medium or high risk.

### 2. **2FA Setup (Google Authenticator)**

- Click "Generate QR Code"
- See QR code and backup secret code
- Download Google Authenticator app (if not already installed)
- Scan QR code in the app
- (Alternative) Manually enter the backup code

### 3. **2FA Verification**

- Google Authenticator app generates a 6-digit code automatically
- Enter the code in the modal
- System verifies using TOTP algorithm
- Maximum 3 attempts before transaction is locked

### 4. **Completion**

- **APPROVED RISK** (MEDIUM): Transaction approved immediately
- **HIGH RISK**: Forwarded to bank approval dashboard

## Security Improvements

| Feature               | OTP                     | Google Authenticator         |
| --------------------- | ----------------------- | ---------------------------- |
| **Secret Generation** | Random 6-digit number   | Base32-encoded secret        |
| **Time-based**        | No                      | Yes (30-second window)       |
| **Offline-capable**   | No (SMS/Email required) | Yes (no connectivity needed) |
| **QR Code Backup**    | No                      | Yes                          |
| **Industry Standard** | Proprietary             | RFC 6238 (TOTP)              |
| **Recovery Codes**    | N/A                     | Yes (via secret)             |

## API Migration

If you have existing integrations, update your API calls:

**Old (OTP):**

```javascript
const otp = await generateOtp(txId);
const result = await verifyOtp(txId, otp);
```

**New (Google Authenticator):**

```javascript
const { secret, qr_code } = await setupAuthenticator(txId);
const result = await verifyAuthenticator(txId, code);
```

## Testing

### Manual Testing Steps

1. Start backend: `python -m uvicorn app.main:app --reload`
2. Start frontend: `npm run dev`
3. Navigate to SimulateTransaction page
4. Enter transaction details and analyze
5. Click "Complete 2FA Verification"
6. Generate QR code and scan with Google Authenticator
7. Enter 6-digit code from app
8. Verify transaction approval

### Test Cases

- ✅ Valid 6-digit code on first attempt
- ✅ Invalid code with attempt counter
- ✅ Maximum attempts exceeded (3)
- ✅ Copy backup secret to clipboard
- ✅ QR code generation for different transactions
- ✅ Correct risk level routing (APPROVED vs BANK_APPROVAL)

## Browser Compatibility

Google Authenticator Modal uses:

- Modern CSS (Grid, Flexbox)
- CSS Transitions
- HTML5 Input types
- Canvas API (for QR code)

**Supported Browsers:**

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Configuration

### TOTP Parameters

Located in `backend/app/main.py`:

- **Time window**: 30 seconds (RFC 6238 default)
- **Digits**: 6 (standard)
- **Algorithm**: SHA-1 (RFC 6238 standard)
- **Clock skew tolerance**: 1 window (allows ±30 seconds)

### Attempt Limits

- **Max attempts**: 3 (configurable in `totp_store` initialization)
- **Lock duration**: Permanent for that transaction (can retry with new setup)

## Troubleshooting

### "Invalid authenticator code" repeatedly

- Check if authenticator app and server clocks are synchronized
- Try with code from slightly after the current time window
- Regenerate QR code and re-add to authenticator app

### QR Code not displaying

- Ensure `qrcode[pil]` package is installed
- Check browser console for errors
- Try copying the secret code manually instead

### Lost backup secret

- Generate new QR code by clicking "Use different method"
- Screenshot the backup code when first shown
- Store securely (never share)

## Migration from OTP

If you have existing transactions with the old OTP system:

1. New transactions will use Google Authenticator automatically
2. Old OTP references in code will work due to backwards-compatible aliases
3. No data migration needed (separate verification system)

## Support & Next Steps

### To further enhance security:

- Implement backup codes (10 recovery codes)
- Add 2FA device management (multiple trusted devices)
- Implement 2FA enforcement policy
- Add SMS/Email 2FA as fallback

### Resources:

- [TOTP RFC 6238](https://tools.ietf.org/html/rfc6238)
- [pyotp Documentation](https://pyauth.github.io/pyotp/)
- [Google Authenticator Setup Guide](https://support.google.com/accounts/answer/185834)

---

**Version**: 1.0  
**Updated**: March 14, 2026  
**Status**: ✅ Production Ready
