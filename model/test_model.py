from fraud_engine import detect_transaction

print("\n==============================")
print(" FRAUD SHIELD AI - TEST SYSTEM ")
print("==============================\n")

transactions = [

{
"sender": "A",
"receiver": "B",
"amount": 50000,
"location_distance": 10,
"device_mismatch": 0,
"velocity": 1,
"unusual_time": 0,
"new_merchant": 0,
"failed_logins": 0,
"ip_risk": 0
},

{
"sender": "B",
"receiver": "C",
"amount": 48000,
"location_distance": 25,
"device_mismatch": 0,
"velocity": 6,
"unusual_time": 1,
"new_merchant": 0,
"failed_logins": 1,
"ip_risk": 0
},

{
"sender": "C",
"receiver": "D",
"amount": 407000,
"location_distance": 50,
"device_mismatch": 0,
"velocity": 3,
"unusual_time": 1,
"new_merchant": 1,
"failed_logins": 4,
"ip_risk": 1
},

# Safe normal transaction
{
"sender": "E",
"receiver": "F",
"amount": 1200,
"location_distance": 3,
"device_mismatch": 0,
"velocity": 1,
"unusual_time": 0,
"new_merchant": 0,
"failed_logins": 0,
"ip_risk": 0
},

# Suspicious behavioral transaction
{
"sender": "G",
"receiver": "H",
"amount": 7000,
"location_distance": 600,
"device_mismatch": 1,
"velocity": 7,
"unusual_time": 1,
"new_merchant": 1,
"failed_logins": 3,
"ip_risk": 1
}

]

for i, transaction in enumerate(transactions):

    print("\n------------------------------------")
    print(f"Transaction {i+1}")
    print("------------------------------------")

    print("Sender:", transaction["sender"])
    print("Receiver:", transaction["receiver"])
    print("Amount:", transaction["amount"])

    result = detect_transaction(transaction)

    print("\nRisk Score:", result["risk_score"])
    print("Fraud Probability:", result["fraud_probability"], "%")
    print("Risk Level:", result["status"])
    print("Recommended Action:", result["action"])
    print("AI Detected:", result["ai_detected"])

    print("\nReasons for Risk:")

    if len(result["reasons"]) == 0:
        print("No suspicious activity detected")
    else:
        for r in result["reasons"]:
            print("•", r)

print("\n==============================")
print(" Fraud Detection Completed ")
print("==============================\n")