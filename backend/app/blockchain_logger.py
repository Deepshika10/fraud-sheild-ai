from __future__ import annotations

import hashlib
import json
from datetime import datetime
from typing import Optional, Dict, Any

try:
    from web3 import Web3

    WEB3_AVAILABLE = True
except ImportError:
    WEB3_AVAILABLE = False


# ============================================================
# BLOCKCHAIN CONNECTION CONFIGURATION
# ============================================================

# Configure these variables based on your blockchain setup:
# - For Ganache (local): http://127.0.0.1:8545
# - For Ethereum testnet (Sepolia): https://sepolia.infura.io/v3/YOUR_PROJECT_ID
# - For other networks: set appropriate RPC URL

BLOCKCHAIN_CONFIG = {
    "provider_url": "http://127.0.0.1:8545",  # Local Ganache by default
    "contract_address": None,  # Set after deploying contract
    "contract_abi": None,  # Will be initialized below
    "account_address": None,  # Deployer/owner account
    "account_private_key": None,  # Private key for signing transactions
}

# ABI for FraudTransactionLogger contract
FRAUD_CONTRACT_ABI = [
    {
        "inputs": [
            {"internalType": "string", "name": "_transactionId", "type": "string"},
            {"internalType": "string", "name": "_transactionHash", "type": "string"},
        ],
        "name": "logTransaction",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "string", "name": "_transactionId", "type": "string"}
        ],
        "name": "getTransactionHash",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "string", "name": "_transactionId", "type": "string"},
            {"internalType": "string", "name": "_transactionHash", "type": "string"},
        ],
        "name": "verifyTransaction",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function",
    },
]


# ============================================================
# HASH GENERATION
# ============================================================


def generate_transaction_hash(transaction: Dict[str, Any]) -> str:
    """
    Generate SHA256 hash of transaction data (core fields only).

    Only hashes immutable fields that define the transaction:
    - amount, location, device, merchant (transaction details)
    - risk_score, risk_level, prediction (analysis results)
    - transaction_id (unique identifier)

    Does NOT hash mutable fields that change over time:
    - status (changes as transaction flows through system)
    - blockchain_log, blockchain_record (added after creation)

    This ensures the hash remains constant even after transaction modification.

    Args:
        transaction: Transaction data dictionary

    Returns:
        Hex string of SHA256 hash
    """
    # Extract only core immutable fields
    core_data = {}

    # Use features if available (from auto-generated transactions)
    if "features" in transaction:
        core_data["features"] = transaction["features"]
    else:
        # Build from individual fields (from simulate/create endpoints)
        core_data["amount"] = transaction.get("amount")
        core_data["location"] = transaction.get("location")
        core_data["device"] = transaction.get("device")
        core_data["merchant"] = transaction.get("merchant")

    # Always include analysis results
    core_data["transaction_id"] = transaction.get("transaction_id")
    core_data["risk_score"] = transaction.get("risk_score")
    core_data["risk_level"] = transaction.get("risk_level")
    core_data["prediction"] = transaction.get("prediction")

    # Convert to JSON string with sorted keys (ensures consistency)
    transaction_string = json.dumps(core_data, sort_keys=True, default=str)
    hash_object = hashlib.sha256(transaction_string.encode())

    return hash_object.hexdigest()


# ============================================================
# BLOCKCHAIN CONNECTION
# ============================================================


def get_web3_connection() -> Optional[Web3]:
    """
    Get Web3 connection to blockchain.
    Returns None if blockchain unavailable (fallback mode).
    """
    if not WEB3_AVAILABLE:
        return None

    try:
        provider_url = BLOCKCHAIN_CONFIG["provider_url"]
        w3 = Web3(Web3.HTTPProvider(provider_url))

        if w3.is_connected():
            return w3
        else:
            print(f"⚠️ WARNING: Could not connect to blockchain at {provider_url}")
            return None
    except Exception as e:
        print(f"⚠️ WARNING: Blockchain connection error: {str(e)}")
        return None


def get_contract_instance():
    """
    Get instance of deployed smart contract.
    Returns None if contract not deployed or blockchain unavailable.
    """
    if (
        not WEB3_AVAILABLE
        or not BLOCKCHAIN_CONFIG["contract_address"]
        or not BLOCKCHAIN_CONFIG["contract_abi"]
    ):
        return None

    try:
        w3 = get_web3_connection()
        if w3 is None:
            return None

        contract = w3.eth.contract(
            address=BLOCKCHAIN_CONFIG["contract_address"],
            abi=BLOCKCHAIN_CONFIG["contract_abi"],
        )
        return contract
    except Exception as e:
        print(f"⚠️ WARNING: Could not get contract instance: {str(e)}")
        return None


# ============================================================
# BLOCKCHAIN LOGGING (PRODUCTION)
# ============================================================


def log_transaction_to_blockchain(
    transaction_id: str, transaction_hash: str
) -> Optional[Dict[str, Any]]:
    """
    Log transaction hash to blockchain smart contract (production mode).

    Args:
        transaction_id: Unique transaction identifier
        transaction_hash: SHA256 hash of transaction data

    Returns:
        Transaction receipt dict if successful, None if failed or unavailable
    """
    if not WEB3_AVAILABLE:
        print(
            "⚠️ web3.py not installed. Running in FALLBACK MODE (simulated blockchain)"
        )
        return None

    try:
        contract = get_contract_instance()
        if contract is None:
            print("⚠️ Smart contract not available. Running in FALLBACK MODE")
            return None

        w3 = get_web3_connection()
        if w3 is None:
            return None

        account_address = BLOCKCHAIN_CONFIG["account_address"]
        private_key = BLOCKCHAIN_CONFIG["account_private_key"]

        if not account_address or not private_key:
            print("⚠️ Blockchain credentials not configured. Running in FALLBACK MODE")
            return None

        # Build transaction
        tx_function = contract.functions.logTransaction(
            transaction_id, transaction_hash
        )
        nonce = w3.eth.get_transaction_count(account_address)

        tx = tx_function.build_transaction(
            {
                "from": account_address,
                "nonce": nonce,
                "gas": 500000,
                "gasPrice": w3.eth.gas_price,
            }
        )

        # Sign and send transaction
        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)

        # Wait for receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

        print(f"✅ Transaction logged to blockchain. Tx Hash: {tx_hash.hex()}")

        return {
            "transaction_id": transaction_id,
            "transaction_hash": transaction_hash,
            "blockchain_tx_hash": tx_hash.hex(),
            "blockchain_block": receipt["blockNumber"],
            "status": "HASH_STORED_ON_BLOCKCHAIN",
        }

    except Exception as e:
        print(f"⚠️ Blockchain logging failed: {str(e)}")
        return None


# ============================================================
# BLOCKCHAIN VERIFICATION
# ============================================================


def verify_transaction_on_blockchain(
    transaction_id: str, transaction_hash: str
) -> Optional[Dict[str, Any]]:
    """
    Verify transaction hash against blockchain record.

    Args:
        transaction_id: Unique transaction identifier
        transaction_hash: SHA256 hash to verify

    Returns:
        Verification result dict with status, or None if not available
    """
    if not WEB3_AVAILABLE or not get_contract_instance():
        return None

    try:
        contract = get_contract_instance()
        if contract is None:
            return None

        # Retrieve hash from blockchain
        blockchain_hash = contract.functions.getTransactionHash(transaction_id).call()

        if not blockchain_hash:
            return {
                "transaction_id": transaction_id,
                "status": "NOT_FOUND",
                "message": "Transaction not logged on blockchain",
            }

        # Verify
        is_valid = contract.functions.verifyTransaction(
            transaction_id, transaction_hash
        ).call()

        return {
            "transaction_id": transaction_id,
            "local_hash": transaction_hash,
            "blockchain_hash": blockchain_hash,
            "status": "VERIFIED" if is_valid else "TAMPERED",
        }

    except Exception as e:
        print(f"⚠️ Blockchain verification failed: {str(e)}")
        return None


# ============================================================
# UNIFIED FRAUD LOGGING (WITH FALLBACK)
# ============================================================


def log_fraud_to_blockchain(transaction: Dict[str, Any]) -> Dict[str, Any]:
    """
    Log high-risk transaction to blockchain.
    Falls back to simulated mode if blockchain unavailable.

    Args:
        transaction: Transaction data dictionary

    Returns:
        Blockchain record with hash and status
    """
    transaction_id = transaction["transaction_id"]
    transaction_hash = generate_transaction_hash(transaction)

    print("\n⚠️ HIGH RISK TRANSACTION DETECTED - Logging to Blockchain")
    print(f"Transaction ID: {transaction_id}")
    print(f"Hash: {transaction_hash[:16]}...{transaction_hash[-16:]}")

    # Try to log to blockchain
    blockchain_result = log_transaction_to_blockchain(transaction_id, transaction_hash)

    if blockchain_result is not None:
        # Successfully logged to blockchain
        blockchain_result["timestamp"] = str(datetime.now())
        return blockchain_result

    # Fallback: Simulate blockchain logging
    print("Simulating blockchain storage (fallback mode)...")
    blockchain_record = {
        "transaction_id": transaction_id,
        "transaction_hash": transaction_hash,
        "timestamp": str(datetime.now()),
        "status": "SIMULATED_BLOCKCHAIN",
        "warning": "Running in fallback mode - configure blockchain connection for production",
    }

    return blockchain_record
