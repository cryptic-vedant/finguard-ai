const Transaction = require('../models/Transaction');
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

exports.getForecast = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.userId,
      type: 'expense'
    });

    const transactionsForML = transactions.map(t => ({
      amount: t.amount,
      date: t.date
    }));

    const response = await axios.post(`${ML_SERVICE_URL}/forecast-expense`, {
      transactions: transactionsForML
    });

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};