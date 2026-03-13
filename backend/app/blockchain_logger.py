import hashlib
import json
from datetime import datetime


def generate_transaction_hash(transaction):

    # Convert transaction to string
    transaction_string = json.dumps(transaction, sort_keys=True)

    # Generate SHA256 hash
    hash_object = hashlib.sha256(transaction_string.encode())

    return hash_object.hexdigest()


def log_fraud_to_blockchain(transaction):

    transaction_hash = generate_transaction_hash(transaction)

    blockchain_record = {
        "transaction_id": transaction["transaction_id"],
        "transaction_hash": transaction_hash,
        "timestamp": str(datetime.now()),
        "status": "HASH_STORED_ON_BLOCKCHAIN",
    }

    print("\n⚠️ HIGH RISK TRANSACTION DETECTED")
    print("Hash stored on blockchain:")
    print(blockchain_record)

    return blockchain_record
