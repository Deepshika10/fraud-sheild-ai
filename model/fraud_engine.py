import joblib
import pandas as pd
from pathlib import Path

# -----------------------------
# Load Model Safely
# -----------------------------

model_path = Path(__file__).resolve().parent / "fraud_model.pkl"

if not model_path.exists():
    raise FileNotFoundError(
        f"Model file not found at: {model_path}\n"
        "Run train_model.py first to train and save the model."
    )

model = joblib.load(model_path)


# -----------------------------
# Feature Order Used in Training
# -----------------------------

FEATURE_COLUMNS = [
    "amount",
    "location_distance",
    "device_mismatch",
    "velocity",
    "unusual_time",
    "new_merchant",
    "failed_logins",
    "ip_risk"
]


# -----------------------------
# Rule-Based Risk Score
# -----------------------------

def calculate_risk(features):

    score = 0

    if features["amount"] > 50000:
        score += 0.25

    if features["location_distance"] > 500:
        score += 0.20

    if features["device_mismatch"] == 1:
        score += 0.15

    if features["velocity"] > 5:
        score += 0.15

    if features["unusual_time"] == 1:
        score += 0.10

    if features["new_merchant"] == 1:
        score += 0.10

    if features["ip_risk"] == 1:
        score += 0.05

    return round(min(score, 1), 2)


# -----------------------------
# Explainable AI Reasons
# -----------------------------

def explain(features):

    reasons = []

    if features["amount"] > 50000:
        reasons.append("Large transaction amount")

    if features["location_distance"] > 500:
        reasons.append("Location anomaly")

    if features["device_mismatch"] == 1:
        reasons.append("New device detected")

    if features["velocity"] > 5:
        reasons.append("High transaction frequency")

    if features["unusual_time"] == 1:
        reasons.append("Unusual transaction time")

    if features["new_merchant"] == 1:
        reasons.append("New merchant")

    if features["failed_logins"] > 2:
        reasons.append("Multiple failed login attempts")

    if features["ip_risk"] == 1:
        reasons.append("Suspicious IP address")

    return reasons


# -----------------------------
# Fraud Detection Engine
# -----------------------------

def detect_transaction(features):

    # Convert input into DataFrame
    X_df = pd.DataFrame([[
        features["amount"],
        features["location_distance"],
        features["device_mismatch"],
        features["velocity"],
        features["unusual_time"],
        features["new_merchant"],
        features["failed_logins"],
        features["ip_risk"]
    ]], columns=FEATURE_COLUMNS)

    # ML Prediction
    prediction = model.predict(X_df)

    # ML anomaly score
    anomaly_score = model.decision_function(X_df)[0]

    # Convert ML score into risk probability
    ml_risk = round((0.5 - anomaly_score) * 2, 2)
    ml_risk = max(0, min(ml_risk, 1))

    # Rule-based risk
    rule_risk = calculate_risk(features)

    # Hybrid AI Risk Score
    final_risk = (0.6 * ml_risk) + (0.4 * rule_risk)

    # Explainable reasons
    reasons = explain(features)

    # AI explanation
    if prediction[0] == -1:
        reasons.append("AI anomaly model detected abnormal transaction pattern")

    # Import chain monitor
    from transaction_monitor import monitor_transaction
    chain_detected = monitor_transaction(features)

    if chain_detected:
        reasons.append("Suspicious transaction chain detected")
        final_risk += 0.15

    # Limit risk between 0 and 1
    final_risk = round(min(final_risk, 1), 2)

    # Fraud probability
    fraud_probability = round(final_risk * 100, 2)

    # Risk classification
    if final_risk > 0.85:
        status = "CRITICAL FRAUD"
    elif final_risk > 0.6:
        status = "HIGH RISK"
    elif final_risk > 0.3:
        status = "SUSPICIOUS"
    else:
        status = "SAFE"

    return {
        "risk_score": final_risk,
        "fraud_probability": fraud_probability,
        "status": status,
        "ai_detected": prediction[0] == -1,
        "reasons": reasons
    }