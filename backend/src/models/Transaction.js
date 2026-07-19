const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  category: {
    type: String,
    default: 'Others'
  },
  merchant: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  isAnomaly: {
    type: Boolean,
    default: false
  },
  riskLevel: {
    type: String,
    default: 'Unknown'
  },
  fraudReason: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);