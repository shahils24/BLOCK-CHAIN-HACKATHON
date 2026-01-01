import time
import requests
import os
from blockchain_body import BlockchainBody
from agent_brain import get_ai_decision

def run():
    print("🚀 Agentic OS is online and watching...", flush=True)
    
    try:
        body = BlockchainBody()
        print("🔗 Blockchain Body Connected Successfully.", flush=True)
    except Exception as e:
        print(f"❌ Blockchain Connection Failed: {e}", flush=True)
        return

    while True:
        try:
            # 1. Fetch current system status
            response = requests.get("http://127.0.0.1:5001/status", timeout=5)
            status = response.json()
            print(f"📊 Current Load: {status.get('load')}%", flush=True)

            # 2. Ask Gemini (The Brain) for a decision
            decision = get_ai_decision(status)
            
            # CHECK: If Gemini hit a rate limit (429), it returns "ACTION:WAIT" 
            # and we should slow down our loop.
            if "ACTION:BUY" in decision:
                reason = "Scaling server load"
                if "|" in decision:
                    reason = decision.split("|")[1].replace("REASON:", "").strip()
                
                print(f"🧠 AI DECISION: {decision}", flush=True)
                print(f"💰 Executing Blockchain Payment...", flush=True)

                # 3. Perform the transaction
                tx_hash = body.execute_purchase(reason)
                print(f"✅ TRANSACTION SUCCESS: {tx_hash}", flush=True)

                # 4. Notify server to Log & Revert
                requests.post("http://127.0.0.1:5001/add_history", json={
                    "timestamp": time.strftime("%H:%M:%S"),
                    "reason": reason,
                    "tx_hash": tx_hash
                })
                print("🔄 Revert Signal Sent. System load reset.")
                
                # After a purchase, wait a bit longer to let the blockchain settle
                time.sleep(15) 
            
            else:
                print("🟢 System Stable. Waiting 10s...", flush=True)

        except Exception as e:
            print(f"⚠️ Runtime Error: {e}", flush=True)

        # MANDATORY COOLDOWN: Prevents 429 Resource Exhausted errors
        # 10 seconds means max 6 requests per minute (well within 15 RPM limit)
        time.sleep(10)

if __name__ == "__main__":
    run()