import pandas as pd
from pathlib import Path
from sklearn.ensemble import IsolationForest
import joblib

# Resolve paths relative to this script so it works regardless of the current working directory.
root_dir = Path(__file__).resolve().parent.parent
csv_path = root_dir / "dataset" / "transactions.csv"
model_path = Path(__file__).resolve().parent / "fraud_model.pkl"

if not csv_path.exists():
    raise FileNotFoundError(
        f"Expected dataset file not found at: {csv_path}\n"
        "Run model/generate_data.py first, or check your working directory."
    )


data = pd.read_csv(csv_path)

X = data.drop(columns=["fraud"])

model = IsolationForest(
    n_estimators=200,
    contamination=0.05,
    random_state=42
)

model.fit(X)

# Ensure destination directory exists before saving
model_path.parent.mkdir(parents=True, exist_ok=True)
joblib.dump(model, model_path)

print(f"Model trained and saved to {model_path}")