import random
import time
from itertools import cycle

from app.decision_engine import analyze_transaction
from app.transaction_store import save_transaction


LOCATIONS = [
    "Germany",
    "USA",
    "Russia",
    "Nigeria",
    "India",
    "Brazil",
    "UK",
    "Canada",
]

DEVICES = [
    "mobile",
    "desktop",
    "tablet",
    "unknown",
    "vpn",
]

MERCHANTS = [
    "Amazon",
    "Walmart",
    "Netflix",
    "Crypto Exchange",
    "Casino Hub",
    "Wire Transfer",
    "Apple Store",
]

GENERATOR_INTERVAL_SECONDS = 120
TARGET_RISK_LEVELS = cycle(["LOW", "MEDIUM", "HIGH"])

LOW_RISK_LOCATIONS = ["Germany", "USA", "Canada", "UK"]
HIGH_RISK_LOCATIONS = ["Russia", "Nigeria"]
LOW_RISK_MERCHANTS = ["Amazon", "Walmart", "Netflix", "Apple Store"]
HIGH_RISK_MERCHANTS = ["Crypto Exchange", "Casino Hub", "Wire Transfer"]
LOW_RISK_DEVICES = ["mobile", "desktop", "tablet"]
HIGH_RISK_DEVICES = ["unknown", "vpn"]


def _next_transaction_id():
    return f"TXN{random.randint(1000, 9999)}"


def build_random_transaction(target_risk_level):
    if target_risk_level == "LOW":
        return {
            "id": _next_transaction_id(),
            "amount": random.randint(50, 2500),
            "location": random.choice(LOW_RISK_LOCATIONS),
            "device": random.choice(LOW_RISK_DEVICES),
            "merchant": random.choice(LOW_RISK_MERCHANTS),
        }

    if target_risk_level == "MEDIUM":
        return {
            "id": _next_transaction_id(),
            "amount": random.randint(7000, 25000),
            "location": random.choice(LOW_RISK_LOCATIONS),
            "device": random.choice(LOW_RISK_DEVICES),
            "merchant": random.choice(LOW_RISK_MERCHANTS + HIGH_RISK_MERCHANTS[:1]),
        }

    return {
        "id": _next_transaction_id(),
        "amount": random.randint(40000, 100000),
        "location": random.choice(HIGH_RISK_LOCATIONS),
        "device": random.choice(HIGH_RISK_DEVICES),
        "merchant": random.choice(HIGH_RISK_MERCHANTS),
    }


def build_balanced_transaction():
    target_risk_level = next(TARGET_RISK_LEVELS)

    for _ in range(12):
        transaction = build_random_transaction(target_risk_level)
        analysis = analyze_transaction(transaction)
        if analysis["risk_level"] == target_risk_level:
            return transaction, analysis

    transaction = build_random_transaction(target_risk_level)
    return transaction, analyze_transaction(transaction)


def generate_and_store_transaction():
    transaction, analysis = build_balanced_transaction()

    status = "APPROVED"
    if analysis["risk_level"] == "MEDIUM":
        status = "WAITING_OTP_VERIFICATION"
    elif analysis["risk_level"] == "HIGH":
        status = "HIGH_RISK_WAITING_USER"

    stored_transaction = {
        "transaction_id": transaction["id"],
        "id": transaction["id"],
        "amount": transaction["amount"],
        "location": transaction["location"],
        "device": transaction["device"],
        "merchant": transaction["merchant"],
        "features": {
            "amount": transaction["amount"],
            "location": transaction["location"],
            "device": transaction["device"],
            "merchant": transaction["merchant"],
        },
        "risk_score": analysis["risk_score"],
        "risk_level": analysis["risk_level"],
        "prediction": "FRAUD" if analysis["prediction"] == 1 else "LEGIT",
        "prediction_code": analysis["prediction"],
        "status": status,
        "reasons": [],
        "source": "AUTO_GENERATED",
    }

    save_transaction(transaction["id"], stored_transaction)
    return stored_transaction


def run_transaction_generator(stop_event):
    while not stop_event.is_set():
        generate_and_store_transaction()
        stop_event.wait(GENERATOR_INTERVAL_SECONDS)
