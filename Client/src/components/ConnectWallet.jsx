import React, { useState, useEffect } from "react";
import { Wallet, ArrowLeft } from "lucide-react";

export default function ConnectWalletPage({ onWalletConnected, onBack }) {
  const [loading, setLoading] = useState(false);

  // 🔹 Auto-check wallet connection on page load
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (!window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length > 0) {
          onWalletConnected(accounts[0]);
        }
      } catch (err) {
        console.error("Auto-connect failed", err);
      }
    };

    checkExistingConnection();
  }, [onWalletConnected]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected. Please install MetaMask.");
      return;
    }

    try {
      setLoading(true);

      // 🔹 Request wallet connection
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        onWalletConnected(accounts[0]);
      }
    } catch (err) {
      if (err.code === 4001) {
        alert("Wallet connection was cancelled.");
      } else {
        alert("Failed to connect wallet.");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1E] via-[#0B1225] to-[#05070F] text-white flex items-center justify-center relative px-6">

      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl text-center">

        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={18} />
        </button>

        <Wallet className="mx-auto text-purple-400 mb-4" size={40} />

        <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
        <p className="mt-2 text-sm text-gray-300">
          Connect your wallet to securely configure and control AI agent
          spending rules.
        </p>

        <button
          onClick={connectWallet}
          disabled={loading}
          className={`mt-6 w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2
            ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
            }`}
        >
          {loading ? "Connecting..." : "Connect MetaMask"}
        </button>

        <p className="mt-4 text-xs text-gray-400">
          We never access your private keys.  
          MetaMask handles all wallet security.
        </p>
      </div>
    </div>
  );
}
