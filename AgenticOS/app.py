import streamlit as st
import requests
import pandas as pd
import json
import os
import time
from dotenv import load_dotenv
from web3 import Web3
import plotly.graph_objects as go


def main():
	# Load environment variables from .env
	load_dotenv()

	# Streamlit page configuration
	st.set_page_config(page_title="AgenticOS", layout="wide", page_icon="🤖")

	# API URL
	API_URL = "http://127.0.0.1:5001"

	# Initialize Web3 connection using RPC_URL from env
	RPC_URL = os.getenv("RPC_URL", "http://127.0.0.1:8545")
	w3 = Web3(Web3.HTTPProvider(RPC_URL))

	# Custom CSS: dark background and hacker-style metrics
	st.markdown(
		"""
		<style>
		.stApp { background-color: #0E1117; color: #cfcfcf; }
		.stCard { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.03); border-radius:8px; }
		.stMetric { font-family: 'Source Code Pro', monospace; color: #7FFFD4 !important; }
		.muted { color: #9aa3b2; }
		h1, h2, h3, h4 { color: #e6eef8; }
		.streamlit-expanderHeader { color: #cfcfcf; }
		/* Make containers more compact */
		.css-1d391kg { padding: 1rem 1rem 1rem 1rem; }
		</style>
		""",
		unsafe_allow_html=True,
	)

	# Session state for wallet connection
	if 'wallet_connected' not in st.session_state:
		st.session_state['wallet_connected'] = False

	# If wallet not connected: show centered connect UI
	if not st.session_state['wallet_connected']:
		left, center, right = st.columns([1, 2, 1])
		with center:
			st.title("Agentic Commerce OS")
			st.subheader("Autonomous AI Payment Rail")
			connect_clicked = st.button("Connect Wallet")
			if connect_clicked:
				with st.spinner("Authenticating..."):
					time.sleep(2)
				st.session_state['wallet_connected'] = True
				st.experimental_rerun()

		# Sidebar shows offline status
		with st.sidebar:
			st.markdown("**System Offline**")
	else:
		# Sidebar shows online status and disconnect button
		with st.sidebar:
			st.markdown("🟢 **System Online**")
			if st.button("Disconnect"):
				st.session_state['wallet_connected'] = False
				st.experimental_rerun()

		# Connected UI (main dashboard)
		st.title("AgenticOS")
		st.markdown("<p class='muted'>Hacker-style dashboard powered by Streamlit</p>", unsafe_allow_html=True)

		# --- AI Agent Live Status Section ---
		st.subheader("🧠 AI Agent Live Status")

		def fetch_status():
			try:
				resp = requests.get(f"{API_URL}/status", timeout=3)
				data = resp.json()
				# expected keys: load (percent), subscription_days, message
				return {
					"load": data.get("load", None),
					"subscription_days": data.get("subscription_days", None),
					"message": data.get("message", ""),
				}
			except Exception:
				# fallback / offline values
				return {"load": None, "subscription_days": None, "message": "Status unavailable"}

		status = fetch_status()
		load = status.get("load")
		sub_days = status.get("subscription_days")
		msg = status.get("message")

		# Refresh control
		refresh_col, spacer = st.columns([1, 5])
		with refresh_col:
			if st.button("Refresh"):
				status = fetch_status()
				load = status.get("load")
				sub_days = status.get("subscription_days")
				msg = status.get("message")

		# Show three columns: Server Load, Subscription Days, Status message
		c1, c2, c3 = st.columns(3)
		with c1:
			st.markdown("**Server Load**")
			if load is None:
				st.markdown("<div style='font-size:28px;color:#9aa3b2'>Unavailable</div>", unsafe_allow_html=True)
			else:
				color = '#2ecc71' if load <= 45 else ('#ff4b4b' if load > 85 else '#FFA500')
				# Large numeric display
				st.markdown(f"<div style='font-size:36px;font-family:monospace;color:{color}'>{load}%</div>", unsafe_allow_html=True)

		with c2:
			st.markdown("**Subscription Days**")
			if sub_days is None:
				st.markdown("<div style='font-size:28px;color:#9aa3b2'>Unknown</div>", unsafe_allow_html=True)
			else:
				st.markdown(f"<div style='font-size:32px;color:#7FFFD4'>{sub_days} days</div>", unsafe_allow_html=True)

		with c3:
			st.markdown("**AI Status**")
			# Determine status message based on load
			if load is None:
				status_text = "Status unavailable"
			elif load > 85:
				status_text = "⚠️ AI DECISION: SCALING REQUIRED"
			elif load <= 45:
				status_text = "✅ AI DECISION: STABLE"
			else:
				status_text = "⚠️ AI DECISION: MONITORING"
			# show in a text area so it can update
			st.text_area("Status Output", value=status_text if msg == "" else f"{status_text}\n{msg}", height=120)

		# Show connection status and basic info
		col1, col2 = st.columns([2, 3])
		with col1:
			st.subheader("Node")
			st.metric(label="RPC URL", value=RPC_URL)
			st.metric(label="Connected", value=str(w3.isConnected()))
		with col2:
			st.subheader("API")
			st.metric(label="API URL", value=API_URL)

		# Placeholder activity chart
		st.subheader("Activity")
		fig = go.Figure()
		fig.add_trace(go.Scatter(x=[1, 2, 3, 4, 5], y=[5, 15, 9, 20, 17], mode='lines+markers', line=dict(color='#7FFFD4')))
		fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font_color='#cfcfcf')
		st.plotly_chart(fig, use_container_width=True)

		# --- Middle Tabs Section ---
		tab1, tab2, tab3 = st.tabs(["💰 Fund Agent", "✅ Whitelist Merchants", "🛑 Emergency Zone"])

		# Tab 1: Fund Agent
		with tab1:
			st.header("💰 Fund Agent")
			# Use session state for daily limit
			if 'daily_eth_limit' not in st.session_state:
				st.session_state['daily_eth_limit'] = 1.0

			daily_limit = st.number_input("Daily ETH Limit", min_value=0.0, value=st.session_state['daily_eth_limit'], step=0.01, format="%.4f")
			if st.button("Update Session Limit"):
				st.session_state['daily_eth_limit'] = daily_limit
				st.success(f"Session limit updated to {daily_limit} ETH")

			# Mock remaining budget for gauge (could be fetched from contract)
			used = daily_limit * 0.3  # mock used 30%
			remaining = max(daily_limit - used, 0)

			gauge_fig = go.Figure(go.Indicator(
				mode="gauge+number",
				value=remaining,
				gauge={
					'axis': {'range': [0, daily_limit if daily_limit>0 else 1]},
					'bar': {'color': '#7FFFD4'},
					'steps': [
						{'range': [0, daily_limit*0.5 if daily_limit>0 else 1], 'color': '#2ecc71'},
						{'range': [daily_limit*0.5 if daily_limit>0 else 1, daily_limit*0.85 if daily_limit>0 else 1], 'color': '#FFA500'},
						{'range': [daily_limit*0.85 if daily_limit>0 else 1, daily_limit if daily_limit>0 else 1], 'color': '#ff4b4b'}
					]
				}
			))
			gauge_fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', font_color='#cfcfcf')
			st.plotly_chart(gauge_fig, use_container_width=True)

		# Tab 2: Whitelist Merchants
		with tab2:
			st.header("✅ Whitelist Merchants")
			# Initialize mock merchants in session state
			if 'merchants' not in st.session_state:
				st.session_state['merchants'] = [
					{"name": "Merchant A", "address": "0xAa...01", "active": True},
					{"name": "Merchant B", "address": "0xBb...02", "active": False},
					{"name": "Merchant C", "address": "0xCc...03", "active": True},
				]

			for i, m in enumerate(st.session_state['merchants']):
				col_name, col_addr, col_toggle = st.columns([3, 4, 1])
				with col_name:
					st.write(m['name'])
				with col_addr:
					st.write(m['address'])
				with col_toggle:
					key = f"merchant_toggle_{i}"
					new_val = st.checkbox("", value=m.get('active', False), key=key)
					# update state
					st.session_state['merchants'][i]['active'] = new_val

		# Tab 3: Emergency Zone
		with tab3:
			st.header("🛑 Emergency Zone")
			st.markdown("<div style='color:#ff4b4b;font-weight:bold'>Clicking the button below will pause all agent processes.</div>", unsafe_allow_html=True)
			if st.button("PAUSE ALL PROCESS", key='pause_all'):
				# show warning toast or fallback message
				try:
					st.toast("System Halted by Owner")
				except Exception:
					st.warning("System Halted by Owner")
				# Here you'd add logic to signal the backend/contract to pause operations

		# --- Transaction Ledger ---
		st.subheader("📜 Transaction Ledger")

		def fetch_history():
			try:
				resp = requests.get(f"{API_URL}/history", timeout=5)
				data = resp.json()
				# expecting a list of dicts
				return data
			except Exception:
				return []

		history = fetch_history()
		if history:
			df = pd.DataFrame(history)
			# ensure required columns
			if 'reason' not in df.columns:
				df['reason'] = ''
			if 'tx_hash' not in df.columns:
				df['tx_hash'] = ''

			# Create filter options
			options = ['All'] + sorted([str(x) for x in df['reason'].dropna().unique() if x != ''])
			selection = st.selectbox("Filter by Merchant/Reason", options)
			if selection != 'All':
				df_filtered = df[df['reason'] == selection].copy()
			else:
				df_filtered = df.copy()

			# Convert tx_hash to clickable link (Etherscan as example)
			def make_link(tx):
				if tx is None or tx == '':
					return ''
				url = f"https://etherscan.io/tx/{tx}"
				return f"<a href='{url}' target='_blank'>{tx}</a>"

			df_filtered['tx_hash'] = df_filtered['tx_hash'].apply(make_link)

			# Render as HTML table with links
			st.markdown(df_filtered.to_html(escape=False, index=False), unsafe_allow_html=True)
		else:
			st.info("No transaction history available")


if __name__ == '__main__':
	main()

