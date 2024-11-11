// utils/web3Helper.js
const { ethers } = require('ethers');
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_API_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const usdcContractAddress = process.env.USDC_CONTRACT_ADDRESS;
const usdcABI = [
  "function transfer(address to, uint amount) public returns (bool)"
];
const contract = new ethers.Contract(usdcContractAddress, usdcABI, wallet);

async function sendUSDC(to, amount) {
  try {
    const tx = await contract.transfer(to, ethers.utils.parseUnits(amount.toString(), 6));
    await tx.wait(); // Wait for transaction confirmation
    console.log(`USDC sent to ${to} - Tx Hash: ${tx.hash}`);
    return tx.hash;
  } catch (error) {
    console.error("Error sending USDC:", error);
    throw error;
  }
}

module.exports = { sendUSDC };
