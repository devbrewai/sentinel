import requests
import json
import time
import random

# API URL
URL = "http://127.0.0.1:8000/api/v1/score"
# TODO: Fix these tests, producing incorrect results
def generate_payload(scenario="safe"):
    """Generate a payload based on the scenario."""
    
    transaction_id = f"txn_{int(time.time())}_{random.randint(1000, 9999)}"
    
    if scenario == "safe":
        # Clear approval case - Low amount, US, trusted card
        payload = {
            "transaction_id": transaction_id,
            "TransactionAmt": 45.50,
            "card_id": "card_valid_999",
            "sender_name": "Sarah Smith",
            "sender_country": "US",
            "ProductCD": "W", 
            "P_emaildomain": "gmail.com",
             # Dummy features to pass validation
            "card1": 10000.0,
            "card2": 111.0,
            "addr1": 123.0
        }
        
    elif scenario == "sanctions":
        # Sanctions hit case - Entity from OFAC SDN list
        # NOTE: The sanctions module strictly filters by country if provided.
        # In sanctions_names.csv, AEROCARIBBEAN AIRLINES has country="Cuba".
        # Our payload must match this or be empty to get a hit if strict filtering is on.
        # We send "Cuba" (or "CU" if that's what the dataset uses, let's try "Cuba" as per CSV).
        
        payload = {
            "transaction_id": transaction_id,
            "TransactionAmt": 1200.00,
            "card_id": "card_reg_99",
            "sender_name": "AEROCARIBBEAN AIRLINES", # Real OFAC entity
            "sender_country": "Cuba", # Matches CSV value exactly
            "ProductCD": "C",
            "P_emaildomain": "protonmail.com",
            "card1": 15000.0,
            "card2": 555.0,
            "addr1": 456.0
        }
        
    elif scenario == "risky":
        # Rejection case - Targeting features with high importance from the model
        # V258 (0.11), V294 (0.17), C14 (0.23), P_emaildomain (0.27)
        payload = {
            "transaction_id": transaction_id,
            "TransactionAmt": 9500.00, # Higher amount
            "card_id": "card_risk_007",
            "sender_name": "Suspicious User",
            "sender_country": "XX",
            "ProductCD": "H", # High risk product
            "P_emaildomain": "protonmail.com", # Risky domain
            
            # Key features from feature importance
            "V258": 5.0, # High V-feature value often indicates anomaly
            "V294": 100.0,
            "C14": 5.0,
            "C8": 10.0,
            "card1": 12345.0,
            "card2": 321.0,
            "addr1": 789.0,
            
            # Velocity proxy (will be injected by backend, but good to have context)
            "card1_txn_1.0h": 10,
            "card1_txn_24.0h": 25
        }
    else:
        raise ValueError(f"Unknown scenario: {scenario}")
        
    return payload

def test_scenario(name):
    print(f"\n--- Testing Scenario: {name.upper()} ---")
    payload = generate_payload(name)
    
    start = time.time()
    try:
        response = requests.post(URL, json=payload)
        response.raise_for_status()
        data = response.json()
        latency = (time.time() - start) * 1000
        
        print(f"Status: {response.status_code}")
        print(f"Latency: {latency:.2f} ms (Client) / {data['latency_ms']:.2f} ms (Server)")
        print(f"Risk Score: {data['risk_score']:.4f}")
        print(f"Decision: {data['decision'].upper()}")
        print(f"Sanctions Match: {data['sanctions_match']}")
        
        if data['sanctions_match']:
            match = data['sanctions_details']['top_matches'][0]
            print(f"Sanctions Entity: {match['candidate']} (Score: {match['score']:.2f})")
            
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print(f"Targeting API at: {URL}")
    
    test_scenario("safe")
    time.sleep(0.5)
    test_scenario("sanctions")
    time.sleep(0.5)
    test_scenario("risky")
