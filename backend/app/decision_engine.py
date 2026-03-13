def evaluate_transaction(features):

    amount = features["amount"]
    location_distance = features["location_distance"]
    device_mismatch = features["device_mismatch"]
    velocity = features["velocity"]
    unusual_time = features["unusual_time"]
    new_merchant = features["new_merchant"]
    failed_logins = features["failed_logins"]
    ip_risk = features["ip_risk"]
    fraud_probability = features["fraud_probability"] / 100  # convert % to 0-1

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
        "fraud_probability": features["fraud_probability"],
        "reasons": reasons,
    }
