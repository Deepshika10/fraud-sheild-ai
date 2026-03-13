import pandas as pd
from pathlib import Path
from sklearn.ensemble import IsolationForest
import joblib

# Resolve paths relative to this script
root_dir = Path(__file__).resolve().parent.parent
csv_path = root_dir / "dataset" / "transactions.csv"
model_path = Path(__file__).resolve().parent / "fraud_model.pkl"

if not csv_path.exists():
    raise FileNotFoundError(
        f"Expected dataset file not found at: {csv_path}\n"
        "Run model/generate_data.py first, or check your working directory."
    )

# -----------------------------
# Load Dataset
# -----------------------------

data = pd.read_csv(csv_path)

# -----------------------------
# Create Behavior Score
# -----------------------------

data["behavior_score"] = (
    data["device_mismatch"]
    + data["unusual_time"]
    + data["ip_risk"]
    + data["failed_logins"]
)

# -----------------------------
# Feature Columns
# -----------------------------

FEATURE_COLUMNS = [
    "amount",
    "location_distance",
    "device_mismatch",
    "velocity",
    "unusual_time",
    "new_merchant",
    "failed_logins",
    "ip_risk",
    "behavior_score"
]

# -----------------------------
# Prepare Training Data
# -----------------------------

X = data[FEATURE_COLUMNS]

# -----------------------------
# Train Isolation Forest Model
# -----------------------------

model = IsolationForest(
    n_estimators=200,
    contamination=0.05,
    random_state=42
)

model.fit(X)

# -----------------------------
# Save Model
# -----------------------------

model_path.parent.mkdir(parents=True, exist_ok=True)
joblib.dump(model, model_path)

print("Model trained successfully")
print(f"Features used: {FEATURE_COLUMNS}")
print(f"Model saved to: {model_path}")