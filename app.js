const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cron = require('node-cron');
const path = require('path');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const verifyToken = require(path.join(__dirname, 'middleware', 'auth')); // Import the auth middleware

// Load environment variables
dotenv.config();

const Transaction = require(path.join(__dirname, 'models', 'Transaction'));
const { sendUSDC } = require(path.join(__dirname, 'utils', 'web3Helper'));

const app = express();
app.use(express.json());

// Root route to handle GET requests at /
app.get('/', (req, res) => {
  res.send('Welcome to the Fiat to USDC Conversion Service');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Route to generate a token for testing
app.post('/login', (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  // Create JWT token
  const token = jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: '1h' });

  res.status(200).json({ token });
});

// Endpoint to simulate fiat deposit with authentication
app.post('/deposit', verifyToken, async (req, res) => {
  const { userId, fiatAmount, fiatTransactionId } = req.body;

  // Use the decoded user info from the token for processing
  console.log(`Authenticated user: ${req.user.userId}`);

  const usdcAmount = fiatAmount * 1; // Adjust conversion rate as needed

  try {
    const transaction = new Transaction({ userId, fiatAmount, usdcAmount, fiatTransactionId });
    await transaction.save();
    res.status(200).json({ message: 'Deposit recorded', transaction });
  } catch (err) {
    res.status(500).json({ message: 'Error recording deposit', error: err });
  }
});

// Cron job to process pending transactions
cron.schedule('*/5 * * * *', async () => {
  console.log("Running cron job to process transactions...");
  const pendingTransactions = await Transaction.find({ status: 'pending' });

  for (const txn of pendingTransactions) {
    try {
      // Check retry limit
      if (txn.retries >= 3) {
        txn.status = 'failed';
        await txn.save();
        console.log(`Transaction ${txn._id} exceeded retry limit and failed.`);
        continue;
      }

      // Send USDC
      const txHash = await sendUSDC(txn.userId, txn.usdcAmount);
      txn.status = 'completed';
      txn.txHash = txHash;
      txn.lastAttemptAt = new Date();
      await txn.save();
      console.log(`Transaction completed: ${txn._id}`);
    } catch (error) {
      txn.retries += 1;
      txn.lastAttemptAt = new Date();
      await txn.save();
      console.error(`Transaction failed: ${txn._id}`, error);
    }
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
