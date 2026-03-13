from app.decision_engine import analyze_transaction

# Test 1: High-risk transaction
high_risk = analyze_transaction(
    {"amount": 80000, "location": "Nigeria", "device": "unknown", "merchant": "crypto"}
)
print("HIGH RISK Transaction:")
print(f'  Risk Score: {high_risk["risk_score"]}')
print(f'  Risk Level: {high_risk["risk_level"]}')

# Test 2: Medium risk
medium_risk = analyze_transaction(
    {"amount": 15000, "location": "USA", "device": "desktop", "merchant": "Amazon"}
)
print("\nMEDIUM RISK Transaction:")
print(f'  Risk Score: {medium_risk["risk_score"]}')
print(f'  Risk Level: {medium_risk["risk_level"]}')

# Test 3: Low risk
low_risk = analyze_transaction(
    {"amount": 500, "location": "Germany", "device": "mobile", "merchant": "Walmart"}
)
print("\nLOW RISK Transaction:")
print(f'  Risk Score: {low_risk["risk_score"]}')
print(f'  Risk Level: {low_risk["risk_level"]}')
