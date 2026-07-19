const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { setBudget, getBudgets, deleteBudget } = require('../controllers/budgetController');

router.use(protect);

router.post('/', setBudget);
router.get('/', getBudgets);
router.delete('/:id', deleteBudget);

module.exports = router;