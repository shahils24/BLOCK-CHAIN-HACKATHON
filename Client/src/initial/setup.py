from eth_account import Account
import os

def generate():
    acc = Account.create()
    print(f"--- SAVE THESE TO .env ---")
    print(f"AGENT_ADDRESS={acc.address}")
    print(f"AGENT_PRIVATE_KEY={acc.key.hex()}")

if __name__ == "__main__":
    generate()