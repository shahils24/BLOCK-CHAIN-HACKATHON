import Web3 from "web3";

let web3;

export const getWeb3 = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    return web3;
  } else {
    alert("MetaMask not detected");
    return null;
  }
};

export default getWeb3;