from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# INITIAL STATE
system_status = {"load": 45, "sub_days": 15}
history = []

@app.route('/status')
def get_status():
    return jsonify(system_status)

@app.route('/history')
def get_history():
    return jsonify(history)

@app.route('/add_history', methods=['POST'])
def add_history():
    global system_status  # Access the world state
    data = request.json
    history.append(data)
    
    # 🛠️ REVERT LOGIC: Once a payment is confirmed, the problem is fixed!
    system_status["load"] = 45
    system_status["sub_days"] = 15
    
    print(f"✅ Payment Received for: {data['reason']}. System health reverted to normal.")
    return jsonify({"status": "success"})

@app.route('/trigger/overload')
def trigger_overload():
    system_status["load"] = 95
    return "🚨 System Overload Triggered (95%)"

@app.route('/trigger/sub')
def trigger_sub():
    system_status["sub_days"] = 1
    return "🚨 Subscription Expiring Triggered"

if __name__ == '__main__':
    app.run(port=5001, debug=False)