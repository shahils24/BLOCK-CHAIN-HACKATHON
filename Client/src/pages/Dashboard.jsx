import React, { useEffect, useState } from "react";
import {
  Plus,
  ShieldCheck,
  Cpu,
  Zap,
  Wallet,
  Menu,
  X,
  PauseCircle,
  Trash2,
  PlayCircle,
} from "lucide-react";
import AgentABI from "../contracts/AgentABI.json";

/* ---------------- CONFIG ---------------- */
const CONTRACT_ADDRESS = "0x3e049F343B0BD9966CD2352De4d6F13A2fFd38ee";
const AGENT_ADDRESS = "0xcBe32a1EDbE5747fF8CDd75FB09303d556B8bF12";

/* ---------------- COMPONENT ---------------- */
const AgenticDashboard = ({ walletAddress, web3 }) => {
  /* ---------------- USER ---------------- */
  const user = {
    name: "Nandini",
    wallet: walletAddress,
  };

  /* ---------------- CONTRACT ---------------- */
  const contract = new web3.eth.Contract(AgentABI, CONTRACT_ADDRESS);

  /* ---------------- STATE ---------------- */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [remainingBudget, setRemainingBudget] = useState("0");
  const [cooldownActive, setCooldownActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [fundAmount, setFundAmount] = useState("");

  const [merchants, setMerchants] = useState([
    { id: 1, name: "AWS", wallet: "0xAWS", limit: 200 },
    { id: 2, name: "Uber", wallet: "0xUBER", limit: 50 },
  ]);

  /* -------- MODALS -------- */
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);

  const [newMerchant, setNewMerchant] = useState({
    name: "",
    wallet: "",
    limit: "",
  });

  const blurBg = showAddModal || showRemoveModal;

  /* ---------------- LOAD AGENT STATE ---------------- */
  useEffect(() => {
    const loadAgentState = async () => {
      const info = await contract.methods
        .getAgentInfo(AGENT_ADDRESS)
        .call();

      const isPaused = await contract.methods.isPaused().call();
      const now = Math.floor(Date.now() / 1000);

      setRemainingBudget(info.remainingBudget);
      setCooldownActive(info.nextAllowedTxTime > now);
      setPaused(isPaused);
    };

    loadAgentState();
  }, []);

  /* ---------------- EVENTS ---------------- */
  useEffect(() => {
    const sub = contract.events.PurchaseReceipt().on("data", (event) => {
      setTransactions((prev) => [
        {
          amount: event.returnValues.amount,
          purpose: event.returnValues.purpose,
        },
        ...prev,
      ]);
    });
    return () => {
        if (sub?.unsubscribe) {
          sub.unsubscribe();
        }
      };
    
  }, []);

  /* ---------------- ACTIONS ---------------- */
  const fundAgent = async () => {
    if (!fundAmount) return alert("Enter amount");

    await web3.eth.sendTransaction({
      from: walletAddress,
      to: CONTRACT_ADDRESS,
      value: web3.utils.toWei(fundAmount, "ether"),
    });

    setFundAmount("");
    alert("Contract funded");
  };

  const togglePause = async () => {
    await contract.methods.togglePause().send({ from: walletAddress });
    setPaused(!paused);
  };

  const addMerchant = () => {
    if (!newMerchant.name || !newMerchant.wallet || !newMerchant.limit) {
      return alert("Fill all fields");
    }

    setMerchants((prev) => [
      ...prev,
      { id: Date.now(), ...newMerchant },
    ]);

    setNewMerchant({ name: "", wallet: "", limit: "" });
    setShowAddModal(false);
  };

  const removeMerchant = () => {
    setMerchants((prev) =>
      prev.filter((m) => m.id !== selectedMerchant.id)
    );
    setShowRemoveModal(false);
  };

  const disconnectWallet = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 p-6">
      <div className={`${blurBg ? "blur-sm" : ""} max-w-7xl mx-auto`}>
        {/* HEADER */}
        <header className="flex justify-between mb-10">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <Cpu />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase">
                Artha <span className="text-indigo-500">Rail</span>
              </h1>
              <p className="text-xs text-slate-500">
                The Autonomous Governance Layer for AI Commerce
              </p>
            </div>
          </div>

          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 bg-[#161B22] px-4 py-2 rounded-xl"
          >
            <Wallet size={16} />
            <span className="font-mono text-sm">
              {user.wallet.slice(0, 6)}...{user.wallet.slice(-4)}
            </span>
            <Menu size={16} />
          </button>
        </header>

        {/* METRICS */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <GlassCard
            title="Remaining Budget"
            value={`${Number(remainingBudget) / 1e18} ETH`}
            icon={<Wallet />}
          />
          <GlassCard
            title="Cooldown Status"
            value={cooldownActive ? "ACTIVE" : "READY"}
            icon={<ShieldCheck />}
          />
          <GlassCard
            title="System Status"
            value={paused ? "PAUSED" : "ACTIVE"}
            icon={<Zap />}
          />
        </div>

        {/* CONTROLS */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="bg-[#10141B] p-6 rounded-2xl">
            <h3 className="font-bold mb-4">Fund Agent</h3>
            <div className="flex gap-3">
              <input
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                placeholder="ETH"
                className="w-full bg-black/40 border rounded px-3 py-2"
              />
              <button onClick={fundAgent} className="bg-indigo-600 px-4 rounded">
                Fund
              </button>
            </div>
          </div>

          <div className="bg-[#10141B] p-6 rounded-2xl">
            <h3 className="font-bold mb-4">Emergency Control</h3>
            <button
              onClick={togglePause}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded ${
                paused ? "bg-emerald-600" : "bg-rose-600"
              }`}
            >
              {paused ? <PlayCircle /> : <PauseCircle />}
              {paused ? "Resume Agent" : "Pause Agent"}
            </button>
          </div>
        </div>

        {/* TRANSACTIONS */}
        <div className="bg-[#10141B] p-8 rounded-2xl mb-10">
          <h2 className="font-bold mb-4">Recent Transactions</h2>
          {transactions.length === 0 && (
            <p className="text-slate-500 text-sm">No transactions yet</p>
          )}
          {transactions.map((tx, i) => (
            <div key={i} className="flex justify-between py-2 text-sm">
              <span>{tx.purpose}</span>
              <span>{Number(tx.amount) / 1e18} ETH</span>
            </div>
          ))}
        </div>

        MERCHANTS
        <div className="bg-[#10141B] p-8 rounded-2xl">
          <div className="flex justify-between mb-6">
            <h2 className="font-bold">Merchant Spend Rules</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 px-3 py-1 rounded flex gap-1"
            >
              <Plus size={14} /> Add Merchant
            </button>
          </div>

          {merchants.map((m) => (
            <div key={m.id} className="flex justify-between mb-3">
              <div>
                <p>{m.name}</p>
                <p className="text-xs text-slate-500">{m.wallet}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedMerchant(m);
                  setShowRemoveModal(true);
                }}
                className="text-rose-400"
              >
                <Trash2 />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* DRAWER */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="w-96 bg-[#0E131C] p-6">
            <button onClick={() => setDrawerOpen(false)}>
              <X />
            </button>
            <p className="font-bold">{user.name}</p>
            <p className="text-xs font-mono">{user.wallet}</p>

            <button
              onClick={disconnectWallet}
              className="mt-6 w-full border border-rose-500 text-rose-400 py-2 rounded"
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}
      
            {/* ADD MERCHANT MODAL */}
            {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="bg-[#10141B] p-6 rounded-2xl w-96">
            <h3 className="font-bold mb-4">Add Merchant</h3>

            <input
              placeholder="Name"
              value={newMerchant.name}
              onChange={(e) =>
                setNewMerchant({ ...newMerchant, name: e.target.value })
              }
              className="w-full mb-2 bg-black/40 border rounded px-3 py-2"
            />

            <input
              placeholder="Wallet"
              value={newMerchant.wallet}
              onChange={(e) =>
                setNewMerchant({ ...newMerchant, wallet: e.target.value })
              }
              className="w-full mb-2 bg-black/40 border rounded px-3 py-2"
            />

            <input
              placeholder="Limit"
              value={newMerchant.limit}
              onChange={(e) =>
                setNewMerchant({ ...newMerchant, limit: e.target.value })
              }
              className="w-full mb-4 bg-black/40 border rounded px-3 py-2"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={addMerchant}
                className="bg-indigo-600 px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REMOVE MERCHANT MODAL */}
      {showRemoveModal && selectedMerchant && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="bg-[#10141B] p-6 rounded-2xl w-96">
            <h3 className="font-bold mb-4">Remove Merchant</h3>

            <p className="mb-6">
              Remove <span className="font-bold">{selectedMerchant.name}</span>?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="px-4 py-2 text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={removeMerchant}
                className="bg-rose-600 px-4 py-2 rounded"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------- HELPERS ---------------- */
const GlassCard = ({ title, value, icon }) => (
  <div className="bg-[#10141B] p-6 rounded-2xl">
    <div className="mb-3">{icon}</div>
    <div className="text-2xl font-black">{value}</div>
    <p className="text-xs text-slate-500">{title}</p>
  </div>
);

export default AgenticDashboard;
