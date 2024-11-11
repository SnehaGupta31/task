// utils/currencyHelper.js
const axios = require('axios');
require('dotenv').config();

async function getConversionRate() {
  try {
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/USD`);
    return response.data.rates.USDC; // Adjust if API returns different data
  } catch (error) {
    console.error("Error fetching conversion rate:", error);
    throw new Error("Conversion rate unavailable");
  }
}

module.exports = { getConversionRate };
