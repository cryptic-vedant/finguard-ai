const Transaction = require('../models/Transaction');
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

exports.getInsights = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.userId,
      type: 'expense'
    });

    const transactionsForML = transactions.map(t => ({
      amount: t.amount,
      category: t.category,
      merchant: t.merchant,
      date: t.date
    }));

    const response = await axios.post(`${ML_SERVICE_URL}/generate-insights`, {
      transactions: transactionsForML
    });

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};