from pathlib import Path

import joblib
import pandas as pd


BASE_FEATURE_COLUMNS = [
    "amount",
    "location_distance",
    "device_mismatch",
    "velocity",
    "unusual_time",
    "new_merchant",
    "failed_logins",
    "ip_risk",
]

FEATURE_COLUMNS = BASE_FEATURE_COLUMNS + ["behavior_score"]

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


def _ensure_behavior_score(features):
    enriched = dict(features)
    if "behavior_score" not in enriched:
        enriched["behavior_score"] = (
            int(enriched.get("device_mismatch", 0))
            + int(enriched.get("unusual_time", 0))
            + int(enriched.get("ip_risk", 0))
            + int(enriched.get("failed_logins", 0))
        )
    return enriched


def _model_feature_columns():
    # Support both older (8 features) and newer (9 features) model artifacts.
    if MODEL is not None and hasattr(MODEL, "feature_names_in_"):
        return list(MODEL.feature_names_in_)
    return FEATURE_COLUMNS


def _build_model_frame(features):
    enriched = _ensure_behavior_score(features)
    expected_columns = _model_feature_columns()
    row = {col: enriched.get(col, 0) for col in expected_columns}
    return pd.DataFrame([row], columns=expected_columns)


def _predict_model_probability(features):
    if MODEL is None:
        return None

    x_df = _build_model_frame(features)

    anomaly_score = MODEL.decision_function(x_df)[0]
    ml_risk = round((0.5 - anomaly_score) * 2, 2)
    return max(0, min(ml_risk, 1))


def _model_prediction(features):
    if MODEL is None:
        return None

    x_df = _build_model_frame(features)
    prediction = MODEL.predict(x_df)[0]
    return 1 if prediction == -1 else 0


def _calculate_demo_risk(features, model_probability):
    heuristic_score = 0.0

    amount = features["amount"]
    if amount > 50000:
        heuristic_score += 0.40  # Increased from 0.35
    elif amount > 10000:
        heuristic_score += 0.20  # Increased from 0.18
    elif amount > 3000:
        heuristic_score += 0.10  # Increased from 0.08

    if features["location_distance"] > 1000:
        heuristic_score += 0.25  # Increased from 0.20

    if features["device_mismatch"] == 1:
        heuristic_score += 0.20  # Increased from 0.15

    if features["new_merchant"] == 1:
        heuristic_score += 0.20  # Increased from 0.15

    if features["velocity"] >= 5:
        heuristic_score += 0.10  # Increased from 0.07

    if features["failed_logins"] >= 3:
        heuristic_score += 0.10  # Increased from 0.05

    # Use higher heuristic weight (70% heuristic, 30% model)
    blended_score = (0.30 * model_probability) + (0.70 * min(heuristic_score, 1.0))
    return float(round(min(blended_score, 1.0), 2))


def extract_features_for_model(transaction_data):
    location = str(transaction_data.get("location", "")).lower()
    device = str(transaction_data.get("device", "")).lower()
    merchant = str(transaction_data.get("merchant", "")).lower()
    amount = float(transaction_data.get("amount", 0))

    high_risk_location = any(risk_loc in location for risk_loc in HIGH_RISK_LOCATIONS)
    suspicious_merchant = any(risk_m in merchant for risk_m in HIGH_RISK_MERCHANTS)
    suspicious_device = device in {"unknown", "new", "vpn", "proxy"}

    features = {
        "amount": amount,
        "location_distance": 1800 if high_risk_location else 120,
        "device_mismatch": 1 if suspicious_device else 0,
        "velocity": 5 if amount >= 5000 else 2,
        "unusual_time": 0,
        "new_merchant": 1 if suspicious_merchant else 0,
        "failed_logins": 3 if suspicious_device else 0,
        "ip_risk": 1 if high_risk_location else 0,
    }

    features["behavior_score"] = (
        features["device_mismatch"]
        + features["unusual_time"]
        + features["ip_risk"]
        + features["failed_logins"]
    )

    return features


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

    features = _ensure_behavior_score(features)

    amount = features["amount"]
    location_distance = features["location_distance"]
    device_mismatch = features["device_mismatch"]
    velocity = features["velocity"]
    unusual_time = features["unusual_time"]
    new_merchant = features["new_merchant"]
    failed_logins = features["failed_logins"]
    ip_risk = features["ip_risk"]
    behavior_score = features["behavior_score"]
    # Use trained model score when available; otherwise fallback to caller-provided value.
    model_probability = _predict_model_probability(features)
    if model_probability is None:
        fallback = float(features.get("fraud_probability", 50)) / 100
        fraud_probability = max(0, min(fallback, 1))
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

    if behavior_score >= 3:
        risk_score += 0.10
        reasons.append("Abnormal behavior score pattern")

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
