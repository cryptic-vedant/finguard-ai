const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  createTransaction,
  getTransactions,
  deleteTransaction,
  exportTransactionsCSV,
  exportTransactionsPDF
} = require('../controllers/transactionController');

router.use(protect);

router.get('/export/csv', exportTransactionsCSV);
router.get('/export/pdf', exportTransactionsPDF);
router.post('/', createTransaction);
router.get('/', getTransactions);
router.delete('/:id', deleteTransaction);

module.exports = router;