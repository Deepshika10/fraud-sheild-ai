from fraud_engine import detect_transaction

print("\n==============================")
print(" FRAUD SHIELD AI - TEST SYSTEM ")
print("==============================\n")


transactions = [

{
"sender": "A",
"receiver": "B",
"amount": 50000,
"device_mismatch": 0,
"velocity": 1,
"unusual_time": 0,
"new_merchant": 0,
"failed_logins": 0,
"ip_risk": 0,
"location_distance": 10
},

{
"sender": "B",
"receiver": "C",
"amount": 48000,
"device_mismatch": 0,
"velocity": 6,
"unusual_time": 1,
"new_merchant": 0,
"failed_logins": 1,
"ip_risk": 0,
"location_distance": 25
},

{
"sender": "C",
"receiver": "D",
"amount": 407000,
"device_mismatch": 0,
"velocity": 3,
"unusual_time": 1,
"new_merchant": 1,
"failed_logins": 4,
"ip_risk": 1,
"location_distance": 50
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

    print("\nReasons for Risk:")

    if len(result["reasons"]) == 0:
        print("No suspicious activity detected")

    else:
        for r in result["reasons"]:
            print("•", r)

print("\n==============================")
print(" Fraud Detection Completed ")
print("==============================\n")