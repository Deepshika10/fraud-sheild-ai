from pathlib import Path

import joblib
import pandas as pd


FEATURE_COLUMNS = [
    "amount",
    "location_distance",
    "device_mismatch",
    "velocity",
    "unusual_time",
    "new_merchant",
    "failed_logins",
    "ip_risk",
]

HIGH_RISK_LOCATIONS = {
    "nigeria",
    "lagos",
    "russia",
    "moscow",
    "ukraine",
    "kyiv",
    "belarus",
    "unknown",
}

HIGH_RISK_MERCHANTS = {
    "crypto",
    "casino",
    "wire",
    "gift",
    "unknown",
}


def _load_model():
    model_path = Path(__file__).resolve().parents[2] / "model" / "fraud_model.pkl"
    if not model_path.exists():
        return None
    return joblib.load(model_path)


MODEL = _load_model()


def _predict_model_probability(features):
    if MODEL is None:
        return None

    x_df = pd.DataFrame(
        [[features[col] for col in FEATURE_COLUMNS]],
        columns=FEATURE_COLUMNS,
    )

    anomaly_score = MODEL.decision_function(x_df)[0]
    ml_risk = round((0.5 - anomaly_score) * 2, 2)
    return max(0, min(ml_risk, 1))


def _model_prediction(features):
    if MODEL is None:
        return None

    x_df = pd.DataFrame(
        [[features[col] for col in FEATURE_COLUMNS]],
        columns=FEATURE_COLUMNS,
    )
    prediction = MODEL.predict(x_df)[0]
    return 1 if prediction == -1 else 0


def _calculate_demo_risk(features, model_probability):
    heuristic_score = 0.0

    amount = features["amount"]
    if amount > 50000:
        heuristic_score += 0.35
    elif amount > 10000:
        heuristic_score += 0.18
    elif amount > 3000:
        heuristic_score += 0.08

    if features["location_distance"] > 1000:
        heuristic_score += 0.20

    if features["device_mismatch"] == 1:
        heuristic_score += 0.15

    if features["new_merchant"] == 1:
        heuristic_score += 0.15

    if features["velocity"] >= 5:
        heuristic_score += 0.07

    if features["failed_logins"] >= 3:
        heuristic_score += 0.05

    blended_score = (0.45 * model_probability) + (0.55 * min(heuristic_score, 1.0))
    return float(round(min(blended_score, 1.0), 2))


def extract_features_for_model(transaction_data):
    location = str(transaction_data.get("location", "")).lower()
    device = str(transaction_data.get("device", "")).lower()
    merchant = str(transaction_data.get("merchant", "")).lower()
    amount = float(transaction_data.get("amount", 0))

    high_risk_location = any(risk_loc in location for risk_loc in HIGH_RISK_LOCATIONS)
    suspicious_merchant = any(risk_m in merchant for risk_m in HIGH_RISK_MERCHANTS)
    suspicious_device = device in {"unknown", "new", "vpn", "proxy"}

    return {
        "amount": amount,
        "location_distance": 1800 if high_risk_location else 120,
        "device_mismatch": 1 if suspicious_device else 0,
        "velocity": 5 if amount >= 5000 else 2,
        "unusual_time": 0,
        "new_merchant": 1 if suspicious_merchant else 0,
        "failed_logins": 3 if suspicious_device else 0,
        "ip_risk": 1 if high_risk_location else 0,
    }


def analyze_transaction(transaction_data):
    features = extract_features_for_model(transaction_data)
    model_probability = _predict_model_probability(features)

    if model_probability is None:
        # Fallback if model is unavailable.
        model_probability = 0.5

    risk_score = _calculate_demo_risk(features, float(model_probability))
    if risk_score >= 0.7:
        risk_level = "HIGH"
    elif risk_score >= 0.4:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # Keep output consistent: prediction follows the same thresholding as risk level.
    prediction = 1 if risk_level == "HIGH" else 0

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "prediction": int(prediction),
    }


def evaluate_transaction(features):

    amount = features["amount"]
    location_distance = features["location_distance"]
    device_mismatch = features["device_mismatch"]
    velocity = features["velocity"]
    unusual_time = features["unusual_time"]
    new_merchant = features["new_merchant"]
    failed_logins = features["failed_logins"]
    ip_risk = features["ip_risk"]
    # Use trained model score when available; otherwise fallback to caller-provided value.
    model_probability = _predict_model_probability(features)
    if model_probability is None:
        fraud_probability = features["fraud_probability"] / 100
    else:
        fraud_probability = model_probability

    risk_score = 0
    reasons = []

    # Large transaction
    if amount > 50000:
        risk_score += 0.20
        reasons.append("Large transaction amount")

    # Location anomaly
    if location_distance > 1000:
        risk_score += 0.10
        reasons.append("Transaction from unusual location")

    # Device mismatch
    if device_mismatch == 1:
        risk_score += 0.10
        reasons.append("Unknown device detected")

    # High transaction velocity
    if velocity >= 4:
        risk_score += 0.10
        reasons.append("High transaction frequency")

    # Unusual time
    if unusual_time == 1:
        risk_score += 0.05
        reasons.append("Transaction at unusual time")

    # New merchant
    if new_merchant == 1:
        risk_score += 0.05
        reasons.append("New merchant detected")

    # Failed logins
    if failed_logins >= 3:
        risk_score += 0.05
        reasons.append("Multiple failed login attempts")

    # Risky IP
    if ip_risk == 1:
        risk_score += 0.05
        reasons.append("Risky IP address")

    # ML Fraud Probability influence
    risk_score += fraud_probability * 0.30

    if fraud_probability > 0.7:
        reasons.append("AI model detected high fraud probability")

    # Ensure score stays within 0–1
    risk_score = min(risk_score, 1)

    # Determine risk level
    if risk_score < 0.4:
        risk_level = "LOW"
    elif risk_score < 0.7:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"

    return {
        "risk_score": round(risk_score, 2),
        "risk_level": risk_level,
        "fraud_probability": round(fraud_probability * 100, 2),
        "reasons": reasons,
    }
