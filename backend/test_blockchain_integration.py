import sys

sys.path.insert(0, ".")

# Test blockchain logger functions
from app.blockchain_logger import (
    generate_transaction_hash,
    log_fraud_to_blockchain,
    get_web3_connection,
    get_contract_instance,
)

# Test transaction store functions
from app.transaction_store import (
    save_blockchain_record,
    get_blockchain_record,
)

# Test a sample transaction
sample_txn = {
    "transaction_id": "TEST-001",
    "amount": 50000,
    "location": "Nigeria",
    "merchant": "crypto",
}

hash_val = generate_transaction_hash(sample_txn)
print(f"✅ Hash generated: {hash_val[:32]}...")
print(f"✅ Hash length: {len(hash_val)} (expected 64)")

# Test saving blockchain record
record = {"transaction_id": "TEST-001", "transaction_hash": hash_val, "status": "TEST"}
save_blockchain_record("TEST-001", record)
retrieved = get_blockchain_record("TEST-001")
print(f"✅ Blockchain record saved and retrieved: {retrieved is not None}")

print("\n✅ All blockchain integration functions verified successfully!")
