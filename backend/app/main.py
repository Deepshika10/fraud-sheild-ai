from fastapi import FastAPI
from threading import Event, Thread
import uuid
import random

from fastapi.middleware.cors import CORSMiddleware
from app.decision_engine import analyze_transaction, evaluate_transaction
from app.transaction_store import (
    save_transaction,
    get_transaction,
    update_transaction_status,
    get_all_transactions,
    get_all_transactions_list,
    save_blockchain_record,
    get_blockchain_record,
)
from app.transaction_generator import run_transaction_generator

from app.blockchain_logger import (
    log_fraud_to_blockchain,
    generate_transaction_hash,
    verify_transaction_on_blockchain,
)

app = FastAPI()

# In-memory OTP store: {transaction_id: {"otp": str, "attempts": int}}
otp_store: dict = {}
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow frontend access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def start_transaction_generator():
    stop_event = Event()
    generator_thread = Thread(
        target=run_transaction_generator,
        args=(stop_event,),
        daemon=True,
        name="transaction-generator",
    )
    generator_thread.start()
    app.state.transaction_generator_stop_event = stop_event
    app.state.transaction_generator_thread = generator_thread


@app.on_event("shutdown")
def stop_transaction_generator():
    stop_event = getattr(app.state, "transaction_generator_stop_event", None)
    if stop_event is not None:
        stop_event.set()


@app.get("/")
def home():
    return {"message": "AI Fraud Detection System Running"}


@app.post("/analyze-transaction")
def analyze_transaction_endpoint(transaction: dict):
    required_fields = ["amount", "location", "device", "merchant"]
    for field in required_fields:
        if field not in transaction:
            return {"error": f"{field} is required"}

    return analyze_transaction(transaction)


# ---------------------------------------
# CREATE TRANSACTION
# ---------------------------------------


@app.post("/create_transaction")
def create_transaction(features: dict):

    required_fields = [
        "amount",
        "location_distance",
        "device_mismatch",
        "velocity",
        "unusual_time",
        "new_merchant",
        "failed_logins",
        "ip_risk",
    ]

    # Validate input
    for field in required_fields:
        if field not in features:
            return {"error": f"{field} is required"}

    normalized_features = dict(features)
    if "behavior_score" not in normalized_features:
        normalized_features["behavior_score"] = (
            int(normalized_features.get("device_mismatch", 0))
            + int(normalized_features.get("unusual_time", 0))
            + int(normalized_features.get("ip_risk", 0))
            + int(normalized_features.get("failed_logins", 0))
        )

    # Run fraud detection (supports both old/new model schemas)
    result = evaluate_transaction(normalized_features)

    risk_score = result["risk_score"]
    risk_level = result["risk_level"]
    reasons = result["reasons"]
    fraud_probability = result["fraud_probability"]

    txn_id = str(uuid.uuid4())

    # Determine workflow status
    if risk_level == "LOW":
        status = "APPROVED"

    elif risk_level == "MEDIUM":
        status = "WAITING_OTP_VERIFICATION"

    else:
        status = "HIGH_RISK_WAITING_USER"

    transaction_data = {
        "transaction_id": txn_id,
        "features": normalized_features,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "fraud_probability": fraud_probability,
        "status": status,
        "reasons": reasons,
    }

    # Save transaction
    save_transaction(txn_id, transaction_data)

    # Log high-risk fraud transactions to blockchain for audit trail
    # Risk threshold: 0.75 (HIGH risk = risk_score >= 0.7, additional buffer at 0.75)
    if risk_score > 0.75:

        blockchain_record = log_fraud_to_blockchain(transaction_data)

        transaction_data["blockchain_log"] = blockchain_record

        # Store blockchain record separately for verification
        save_blockchain_record(txn_id, blockchain_record)

    # Determine action field for frontend routing
    action_map = {
        "LOW": "AUTO_APPROVED",
        "MEDIUM": "USER_VERIFICATION_ONLY",
        "HIGH": "USER_VERIFY_THEN_BANK",
    }
    transaction_data["action"] = action_map.get(risk_level, "AUTO_APPROVED")

    return transaction_data


# ---------------------------------------
# USER CONFIRMATION
# ---------------------------------------


@app.post("/generate-otp")
def generate_otp(data: dict):
    """
    Generates a 6-digit OTP for a transaction awaiting OTP verification.
    Returns the OTP in plain text so the frontend can display it (simulated SMS/email).
    """
    txn_id = data.get("transaction_id")
    if not txn_id:
        return {"error": "transaction_id is required"}

    transaction = get_transaction(txn_id)
    if not transaction:
        return {"error": "Transaction not found"}

    otp = str(random.randint(100000, 999999))
    otp_store[txn_id] = {"otp": otp, "attempts": 3}

    return {"transaction_id": txn_id, "otp": otp, "message": "OTP generated successfully"}


@app.post("/verify-otp")
def verify_otp(data: dict):
    """
    Validates the OTP for a transaction and transitions its status:
      - MEDIUM (WAITING_OTP_VERIFICATION) + correct OTP  → APPROVED
      - HIGH   (HIGH_RISK_WAITING_USER)   + correct OTP  → WAITING_BANK_APPROVAL
      - Wrong OTP → returns error with remaining attempts
    """
    txn_id = data.get("transaction_id")
    submitted_otp = str(data.get("otp", "")).strip()

    if not txn_id or not submitted_otp:
        return {"error": "transaction_id and otp are required"}

    transaction = get_transaction(txn_id)
    if not transaction:
        return {"error": "Transaction not found"}

    if txn_id not in otp_store:
        return {"error": "No OTP generated for this transaction. Call /generate-otp first."}

    record = otp_store[txn_id]

    if record["attempts"] <= 0:
        return {"error": "Maximum OTP attempts exceeded. Transaction blocked.", "attempts_remaining": 0}

    if submitted_otp != record["otp"]:
        record["attempts"] -= 1
        return {
            "error": "Invalid OTP",
            "attempts_remaining": record["attempts"],
        }

    # OTP correct — clean up store
    del otp_store[txn_id]

    risk_level = transaction.get("risk_level", "")
    if risk_level == "HIGH":
        update_transaction_status(txn_id, "WAITING_BANK_APPROVAL")
        return {
            "message": "OTP verified. Transaction forwarded to bank for final approval.",
            "next_step": "BANK_APPROVAL",
            "transaction": get_transaction(txn_id),
        }
    else:
        update_transaction_status(txn_id, "APPROVED")
        return {
            "message": "OTP verified. Transaction approved.",
            "next_step": "APPROVED",
            "transaction": get_transaction(txn_id),
        }


# ---------------------------------------
# USER CONFIRMATION
# ---------------------------------------


@app.post("/user_confirm_transaction")
def user_confirm_transaction(data: dict):

    txn_id = data["transaction_id"]
    decision = data["decision"]

    transaction = get_transaction(txn_id)

    if not transaction:
        return {"error": "Transaction not found"}

    if decision == "approve":

        if transaction["risk_level"] == "HIGH":

            update_transaction_status(txn_id, "WAITING_BANK_APPROVAL")

            return {
                "message": "User approved. Waiting for bank approval.",
                "transaction": get_transaction(txn_id),
            }

        elif transaction["risk_level"] == "MEDIUM":

            update_transaction_status(txn_id, "APPROVED")

            return {
                "message": "OTP verified successfully. Transaction approved.",
                "transaction": get_transaction(txn_id),
            }

        else:

            update_transaction_status(txn_id, "APPROVED")

            return {
                "message": "Transaction approved by user",
                "transaction": get_transaction(txn_id),
            }

    else:

        update_transaction_status(txn_id, "BLOCKED")

        if transaction["risk_level"] == "MEDIUM":
            return {
                "message": "OTP verification failed. Transaction blocked.",
                "transaction": get_transaction(txn_id),
            }

        return {
            "message": "Transaction blocked by user",
            "transaction": get_transaction(txn_id),
        }


# ---------------------------------------
# BANK APPROVAL
# ---------------------------------------


@app.post("/bank_approve_transaction")
def bank_approve_transaction(data: dict):

    txn_id = data["transaction_id"]
    decision = data["decision"]

    transaction = get_transaction(txn_id)

    if not transaction:
        return {"error": "Transaction not found"}

    if decision == "approve":

        update_transaction_status(txn_id, "APPROVED")

        return {
            "message": "Transaction approved by bank",
            "transaction": get_transaction(txn_id),
        }

    else:

        update_transaction_status(txn_id, "BLOCKED")

        return {
            "message": "Transaction blocked by bank",
            "transaction": get_transaction(txn_id),
        }


# ---------------------------------------
# GET ALL TRANSACTIONS
# ---------------------------------------


@app.get("/transactions")
def get_transactions():
    return get_all_transactions_list()


# ---------------------------------------
# GET SINGLE TRANSACTION
# ---------------------------------------


@app.get("/transaction/{txn_id}")
def get_single_transaction(txn_id: str):

    transaction = get_transaction(txn_id)

    if not transaction:
        return {"error": "Transaction not found"}

    return transaction


# ---------------------------------------
# VERIFY TRANSACTION ON BLOCKCHAIN
# ---------------------------------------


@app.get("/verify-transaction/{txn_id}")
def verify_transaction(txn_id: str):
    """
    Verify transaction integrity using blockchain.

    Workflow:
    1. Retrieve transaction from local store
    2. Regenerate SHA256 hash from transaction data
    3. Retrieve hash stored on blockchain
    4. Compare hashes - if they match, transaction is VERIFIED; if different, TAMPERED

    Returns:
        {
            "transaction_id": "...",
            "local_hash": "0x...",
            "blockchain_hash": "0x...",
            "status": "VERIFIED" | "TAMPERED" | "NOT_FOUND"
        }
    """
    # Get transaction from local store
    transaction = get_transaction(txn_id)

    if not transaction:
        return {
            "transaction_id": txn_id,
            "status": "NOT_FOUND",
            "message": "Transaction does not exist in system",
        }

    # Check if transaction was logged to blockchain
    blockchain_record = get_blockchain_record(txn_id)

    if not blockchain_record:
        return {
            "transaction_id": txn_id,
            "status": "NOT_LOGGED",
            "message": "Transaction was not logged to blockchain (risk_score <= 0.75)",
        }

    # Regenerate hash from local transaction data
    local_hash = generate_transaction_hash(transaction)
    blockchain_hash = blockchain_record.get("transaction_hash")

    # Compare hashes
    is_verified = local_hash == blockchain_hash

    verification_result = {
        "transaction_id": txn_id,
        "local_hash": local_hash,
        "blockchain_hash": blockchain_hash,
        "status": "VERIFIED" if is_verified else "TAMPERED",
        "blockchain_tx_hash": blockchain_record.get("blockchain_tx_hash"),
        "timestamp": blockchain_record.get("timestamp"),
    }

    # Try to verify on actual blockchain if available
    if blockchain_record.get("blockchain_tx_hash"):
        blockchain_verification = verify_transaction_on_blockchain(txn_id, local_hash)
        if blockchain_verification:
            verification_result["blockchain_verification"] = blockchain_verification

    return verification_result


# ---------------------------------------
# FRAUD ANALYTICS (FOR DASHBOARD)
# ---------------------------------------


@app.get("/fraud_analytics")
def fraud_analytics():

    transactions = get_all_transactions()

    total = len(transactions)
    high_risk = 0
    approved = 0
    blocked = 0
    blockchain_logs = 0

    for txn in transactions.values():

        if txn["risk_level"] == "HIGH":
            high_risk += 1

        if txn["status"] == "APPROVED":
            approved += 1

        if txn["status"] == "BLOCKED":
            blocked += 1

        if "blockchain_log" in txn:
            blockchain_logs += 1

    return {
        "total_transactions": total,
        "high_risk_transactions": high_risk,
        "approved_transactions": approved,
        "blocked_transactions": blocked,
        "blockchain_logged_transactions": blockchain_logs,
    }
