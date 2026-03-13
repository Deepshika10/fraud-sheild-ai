from fastapi import FastAPI
import uuid

from fastapi.middleware.cors import CORSMiddleware
from app.decision_engine import analyze_transaction, evaluate_transaction
from app.transaction_store import (
    save_transaction,
    get_transaction,
    update_transaction_status,
    get_all_transactions,
)

from app.blockchain_logger import log_fraud_to_blockchain

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow frontend access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
        "fraud_probability",
    ]

    # Validate input
    for field in required_fields:
        if field not in features:
            return {"error": f"{field} is required"}

    # Run fraud detection
    result = evaluate_transaction(features)

    risk_score = result["risk_score"]
    risk_level = result["risk_level"]
    reasons = result["reasons"]
    fraud_probability = result["fraud_probability"]

    txn_id = str(uuid.uuid4())

    # Determine workflow status
    if risk_level == "LOW":
        status = "APPROVED"

    elif risk_level == "MEDIUM":
        status = "WAITING_USER_CONFIRMATION"

    else:
        status = "HIGH_RISK_WAITING_USER"

    transaction_data = {
        "transaction_id": txn_id,
        "features": features,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "fraud_probability": fraud_probability,
        "status": status,
        "reasons": reasons,
    }

    # Save transaction
    save_transaction(txn_id, transaction_data)

    # Log extreme fraud attempts to blockchain
    if risk_score >= 0.85:

        blockchain_record = log_fraud_to_blockchain(transaction_data)

        transaction_data["blockchain_log"] = blockchain_record

    return transaction_data


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

        else:

            update_transaction_status(txn_id, "APPROVED")

            return {
                "message": "Transaction approved by user",
                "transaction": get_transaction(txn_id),
            }

    else:

        update_transaction_status(txn_id, "BLOCKED")

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

    return get_all_transactions()


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
