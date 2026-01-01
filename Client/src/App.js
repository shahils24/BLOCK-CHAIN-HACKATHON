import React, { useState } from "react";
import LandingPage from "./pages/LandingPage";
import ConnectWallet from "./components/ConnectWallet";
import Dashboard from "./pages/Dashboard";
import { getWeb3 } from "./web3/web3";

function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [walletAddress, setWalletAddress] = useState(null);
  const [web3, setWeb3] = useState(null);

  return (
    <>
      {currentPage === "landing" && (
        <LandingPage
          onConnect={() => setCurrentPage("connect")}
        />
      )}

      {currentPage === "connect" && (
        <ConnectWallet
          onBack={() => setCurrentPage("landing")}
          onWalletConnected={(address) => {
            setWalletAddress(address);

            getWeb3().then((web3Instance) => {
              setWeb3(web3Instance);
              setCurrentPage("dashboard");
            });
          }}
        />
      )}

      {currentPage === "dashboard" && (
        <Dashboard walletAddress={walletAddress} web3={web3} />
      )}
    </>
  );
}

export default App;
