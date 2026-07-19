const Transaction = require('../models/Transaction');
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Create a transaction
exports.createTransaction = async (req, res) => {
  try {
    const { amount, type, category, merchant, description, date } = req.body;

    let finalCategory = category;

    // Auto-categorize if no category provided
    if (!finalCategory || finalCategory.trim() === '') {
      try {
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict-category`, {
          merchant,
          description
        });
        finalCategory = mlResponse.data.category;
      } catch (mlError) {
        console.error('ML categorization failed, defaulting to Others:', mlError.message);
        finalCategory = 'Others';
      }
    }

    // --- Fraud detection ---
    let fraudResult = {
      is_anomaly: false,
      risk_level: 'Unknown',
      reason: 'Fraud check unavailable'
    };

    try {
      // Get the user's past transactions to build their pattern
      const pastTransactions = await Transaction.find({ user: req.userId });

      const transactionsForML = pastTransactions.map(t => ({
        amount: t.amount,
        hour: new Date(t.date).getHours()
      }));

      const newTransactionDate = date ? new Date(date) : new Date();

      const fraudResponse = await axios.post(`${ML_SERVICE_URL}/detect-fraud`, {
        transactions: transactionsForML,
        new_transaction: {
          amount: Number(amount),
          hour: newTransactionDate.getHours()
        }
      });

      fraudResult = fraudResponse.data;
    } catch (fraudError) {
      console.error('Fraud detection failed:', fraudError.message);
    }

    const transaction = await Transaction.create({
      user: req.userId,
      amount,
      type,
      category: finalCategory,
      merchant,
      description,
      date,
      isAnomaly: fraudResult.is_anomaly,
      riskLevel: fraudResult.risk_level,
      fraudReason: fraudResult.reason
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all transactions for the logged-in user
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.userId }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const { Parser } = require('json2csv');

// Export transactions as CSV
exports.exportTransactionsCSV = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.userId }).sort({ date: -1 });

    const fields = ['date', 'type', 'category', 'merchant', 'description', 'amount', 'riskLevel'];
    const data = transactions.map(t => ({
      date: new Date(t.date).toLocaleDateString('en-IN'),
      type: t.type,
      category: t.category,
      merchant: t.merchant,
      description: t.description,
      amount: t.amount,
      riskLevel: t.riskLevel
    }));

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('finguard-transactions.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const PDFDocument = require('pdfkit');

exports.exportTransactionsPDF = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.userId }).sort({ date: -1 });

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    const categoryTotals = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = t.category || 'Others';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
    });

    const flaggedTransactions = transactions.filter(t => t.isAnomaly);

    const doc = new PDFDocument({ margin: 40 });

    res.header('Content-Type', 'application/pdf');
    res.attachment('finguard-report.pdf');
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('FinGuard AI - Financial Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).fillColor('gray').text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, { align: 'center' });
    doc.moveDown(2);

    // Summary
    doc.fillColor('black').fontSize(14).text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Total Income: Rs. ${totalIncome}`);
    doc.text(`Total Expense: Rs. ${totalExpense}`);
    doc.text(`Balance: Rs. ${balance}`);
    doc.moveDown(1.5);

    // Category Breakdown
    doc.fontSize(14).text('Spending by Category', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    Object.entries(categoryTotals).forEach(([category, amount]) => {
      doc.text(`${category}: Rs. ${amount}`);
    });
    doc.moveDown(1.5);

    // Flagged Transactions
    doc.fontSize(14).text('Flagged Transactions (Fraud Alerts)', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    if (flaggedTransactions.length === 0) {
      doc.text('No flagged transactions.');
    } else {
      flaggedTransactions.forEach(t => {
        doc.text(`${new Date(t.date).toLocaleDateString('en-IN')} - ${t.merchant || 'Unknown'} - Rs. ${t.amount} (${t.riskLevel} Risk)`);
      });
    }
    doc.moveDown(1.5);

    // Full Transaction List
    doc.fontSize(14).text('All Transactions', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(9);
    transactions.forEach(t => {
      doc.text(
        `${new Date(t.date).toLocaleDateString('en-IN')} | ${t.type} | ${t.category} | ${t.merchant || '-'} | Rs. ${t.amount}`
      );
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};