const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// Create or update a budget for a category/month
exports.setBudget = async (req, res) => {
  try {
    const { category, monthlyLimit, month, year } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { user: req.userId, category, month, year },
      { monthlyLimit },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all budgets for a given month/year, with usage calculated
exports.getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    const targetYear = parseInt(year) || new Date().getFullYear();

    const budgets = await Budget.find({
      user: req.userId,
      month: targetMonth,
      year: targetYear
    });

    // Calculate spent amount per category for that month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 1);

    const budgetsWithUsage = await Promise.all(
      budgets.map(async (budget) => {
        const transactions = await Transaction.find({
          user: req.userId,
          category: budget.category,
          type: 'expense',
          date: { $gte: startDate, $lt: endDate }
        });

        const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
        const remaining = budget.monthlyLimit - spent;
        const percentUsed = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0;

        return {
          _id: budget._id,
          category: budget.category,
          monthlyLimit: budget.monthlyLimit,
          spent,
          remaining,
          percentUsed: Math.round(percentUsed)
        };
      })
    );

    res.status(200).json(budgetsWithUsage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a budget
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.status(200).json({ message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};