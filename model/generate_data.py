import pandas as pd
import numpy as np

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

fraud = (
(data["amount"]>50000) |
(data["location_distance"]>500) |
(data["device_mismatch"]==1) |
(data["velocity"]>5)
)

data["fraud"] = fraud.astype(int)

data.to_csv("dataset/transactions.csv",index=False)

print("Dataset created successfully")