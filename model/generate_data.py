import pandas as pd
import numpy as np
from pathlib import Path

np.random.seed(42)

n = 5000

data = pd.DataFrame({
    "amount": np.random.normal(2000,1500,n).clip(100,100000),
    "location_distance": np.random.normal(5,20,n).clip(0,2000),
    "device_mismatch": np.random.choice([0,1],n,p=[0.9,0.1]),
    "velocity": np.random.poisson(2,n),
    "unusual_time": np.random.choice([0,1],n,p=[0.85,0.15]),
    "new_merchant": np.random.choice([0,1],n,p=[0.8,0.2]),
    "failed_logins": np.random.poisson(0.3,n),
    "ip_risk": np.random.choice([0,1],n,p=[0.9,0.1])
})

# -----------------------------
# Behavior Score
# -----------------------------

data["behavior_score"] = (
    data["device_mismatch"]
    + data["unusual_time"]
    + data["ip_risk"]
    + data["failed_logins"]
)

# -----------------------------
# Fraud Pattern Logic
# -----------------------------

fraud = (
    (data["amount"] > 50000) |
    (data["location_distance"] > 500) |
    (data["device_mismatch"] == 1) |
    (data["velocity"] > 5) |
    (data["behavior_score"] >= 3)
)

data["fraud"] = fraud.astype(int)

# -----------------------------
# Save Dataset
# -----------------------------

dataset_path = Path("dataset")
dataset_path.mkdir(exist_ok=True)

data.to_csv(dataset_path / "transactions.csv", index=False)

print("Dataset created successfully")
print(f"Total transactions: {len(data)}")
print(f"Fraud cases: {data['fraud'].sum()}")