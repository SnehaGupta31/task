// utils/alertHelper.js
const axios = require('axios');
require('dotenv').config();

async function alertAdmin(message) {
  try {
    await axios.post(process.env.ADMIN_ALERT_WEBHOOK_URL, { message });
    console.log('Admin alerted successfully.');
  } catch (error) {
    console.error('Error alerting admin:', error);
  }
}

module.exports = { alertAdmin };
