const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: String,
  fiatAmount: Number,
  usdcAmount: Number,
  fiatTransactionId: String, // Bank transaction reference
  txHash: String, // Blockchain transaction hash
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  retries: { type: Number, default: 0 },
  lastAttemptAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
