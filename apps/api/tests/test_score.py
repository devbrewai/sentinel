import requests
import json
import time
import random

# API URL
URL = "http://127.0.0.1:8000/api/v1/score"

def generate_payload():
    """Generate a dummy payload with all required fields."""
    
    # 1. Core Business Fields
    # Clear approval case
    # payload = {
    #     "transaction_id": f"txn_{int(time.time())}",
    #     "TransactionAmt": 85.50,
    #     "card_id": "card_valid_999",
    #     "sender_name": "Sarah Smith",
    #     "sender_country": "US",
    #     "ProductCD": "W", # Web purchase
    #     "P_emaildomain": "gmail.com"
    # }

    # Clear rejection case
    payload = {
        "transaction_id": f"txn_{int(time.time())}",
        "TransactionAmt": round(random.uniform(10.0, 500.0), 2),
        "card_id": "card_12345",
        "sender_name": "Jhon Paul Castro Paez",
        "sender_country": "Colombia",
    }

    
    # 2. Add dummy values for some model features to avoid validation errors
    # In a real test, you might load a row from the test.csv
    # For now, we just need to pass the schema validation.
    # Since fields are Optional[float] = None, we technically don't need to send them 
    # if we don't want to, but let's send a few key ones.
    
    payload["ProductCD"] = "W"
    payload["card1"] = 12345.0
    payload["card2"] = 321.0
    payload["addr1"] = 123.0
    payload["P_emaildomain"] = "gmail.com"
    
    return payload

def test_api():
    payload = generate_payload()
    
    print(f"Sending request to {URL}...")
    start = time.time()
    
    try:
        response = requests.post(URL, json=payload)
        response.raise_for_status()
        data = response.json()
        
        latency = (time.time() - start) * 1000
        
        print("\n[TEST_API] Successfully scored transaction")
        print(f"Status Code: {response.status_code}")
        print(f"Total Client Latency: {latency:.2f} ms")
        print(f"Server-Reported Latency: {data['latency_ms']:.2f} ms")
        print("\nResponse:")
        print(json.dumps(data, indent=2))
        
    except requests.exceptions.RequestException as e:
        print(f"\n[TEST_API] Error scoring transaction: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(e.response.text)

if __name__ == "__main__":
    test_api()
