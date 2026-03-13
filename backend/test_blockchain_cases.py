"""
Test Blockchain Verification - Demo VERIFIED vs TAMPERED Cases
"""

from app.blockchain_logger import generate_transaction_hash
from app.transaction_store import save_blockchain_record, get_blockchain_record

# ============================================================
# TEST 1: VERIFIED Case
# ============================================================
print("=" * 70)
print("TEST 1: VERIFIED Case (Hashes Match)")
print("=" * 70)

# Create a transaction
txn_1 = {
    "transaction_id": "TXN-VERIFIED-001",
    "amount": 80000,
    "location": "Nigeria",
    "device": "unknown",
    "merchant": "crypto",
    "risk_score": 0.95,
    "risk_level": "HIGH",
    "prediction": 1,
}

# Generate hash when creating transaction
hash_1 = generate_transaction_hash(txn_1)
print(f"\n1. Original Transaction Created:")
print(f"   Transaction ID: {txn_1['transaction_id']}")
print(f"   Risk Score: {txn_1['risk_score']}")
print(f"   Generated Hash: {hash_1[:32]}...")

# Store blockchain record
blockchain_record_1 = {
    "transaction_id": txn_1["transaction_id"],
    "transaction_hash": hash_1,
    "status": "HASH_STORED_ON_BLOCKCHAIN",
}
save_blockchain_record(txn_1["transaction_id"], blockchain_record_1)
print(f"   ✓ Stored on blockchain")

# Simulate transaction flowing through system (status changes)
txn_1["status"] = "WAITING_BANK_APPROVAL"  # Modified after creation
print(f"\n2. Transaction Modified in System:")
print(f"   Status changed to: {txn_1['status']}")

# Later: Regenerate hash for verification
regenerated_hash_1 = generate_transaction_hash(txn_1)
stored_hash_1 = blockchain_record_1["transaction_hash"]

print(f"\n3. Verification Check:")
print(f"   Regenerated Hash: {regenerated_hash_1[:32]}...")
print(f"   Blockchain Hash:  {stored_hash_1[:32]}...")
print(f"   Match: {regenerated_hash_1 == stored_hash_1}")

if regenerated_hash_1 == stored_hash_1:
    print(f"\n✅ RESULT: VERIFIED ✓")
    print(f"   Transaction is authentic!")
else:
    print(f"\n❌ RESULT: TAMPERED ✗")
    print(f"   Transaction data was modified!")

# ============================================================
# TEST 2: TAMPERED Case
# ============================================================
print("\n" + "=" * 70)
print("TEST 2: TAMPERED Case (Hashes Don't Match)")
print("=" * 70)

# Create a transaction
txn_2 = {
    "transaction_id": "TXN-TAMPERED-001",
    "amount": 50000,
    "location": "Russia",
    "device": "vpn",
    "merchant": "casino",
    "risk_score": 0.88,
    "risk_level": "HIGH",
    "prediction": 1,
}

# Generate hash when creating transaction
hash_2 = generate_transaction_hash(txn_2)
print(f"\n1. Original Transaction Created:")
print(f"   Transaction ID: {txn_2['transaction_id']}")
print(f"   Amount: ${txn_2['amount']}")
print(f"   Risk Score: {txn_2['risk_score']}")
print(f"   Generated Hash: {hash_2[:32]}...")

# Store blockchain record
blockchain_record_2 = {
    "transaction_id": txn_2["transaction_id"],
    "transaction_hash": hash_2,
    "status": "HASH_STORED_ON_BLOCKCHAIN",
}
save_blockchain_record(txn_2["transaction_id"], blockchain_record_2)
print(f"   ✓ Stored on blockchain")

# SIMULATE TAMPERING: Someone illegally modifies the amount
print(f"\n2. Unauthorized Modification (TAMPERING):")
print(f"   ⚠️ ALERT: Amount modified from ${txn_2['amount']} to $5000")
txn_2["amount"] = 5000  # TAMPERED!
print(f"   Transaction amount is now: ${txn_2['amount']}")

# Later: Regenerate hash for verification
regenerated_hash_2 = generate_transaction_hash(txn_2)
stored_hash_2 = blockchain_record_2["transaction_hash"]

print(f"\n3. Verification Check:")
print(f"   Regenerated Hash: {regenerated_hash_2[:32]}...")
print(f"   Blockchain Hash:  {stored_hash_2[:32]}...")
print(f"   Match: {regenerated_hash_2 == stored_hash_2}")

if regenerated_hash_2 == stored_hash_2:
    print(f"\n✅ RESULT: VERIFIED ✓")
    print(f"   Transaction is authentic!")
else:
    print(f"\n⚠️ RESULT: TAMPERED ✗")
    print(f"   FRAUD DETECTED: Transaction data was modified!")
    print(f"   Original amount: $50000, Current amount: ${txn_2['amount']}")

# ============================================================
# SUMMARY
# ============================================================
print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
print(
    """
✅ VERIFIED: Happens when...
   - Transaction data stays the same
   - Mutable fields (status, blockchain_log) change, NOT core fields
   - Generated hash == Stored blockchain hash
   - Transaction is AUTHENTIC ✓

⚠️ TAMPERED: Happens when...
   - Core fields are modified (amount, location, risk_score, etc.)
   - Someone tries to fraudulently change transaction details
   - Generated hash ≠ Stored blockchain hash
   - FRAUD DETECTED ⚠️ investigate immediately!

Safe Fields (don't affect hash):
   - status (APPROVED, BLOCKED, etc.)
   - blockchain_log (added after creation)
   - blockchain_record (verification metadata)

Core Fields (affect hash):
   - transaction_id
   - amount, location, device, merchant
   - risk_score, risk_level, prediction
"""
)
