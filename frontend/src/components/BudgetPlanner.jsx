import { useState, useEffect } from 'react';
import { getBudgets, setBudget, deleteBudget } from '../api/budgets';

function BudgetPlanner() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [form, setForm] = useState({ category: '', monthlyLimit: '' });

  const fetchBudgets = async () => {
    try {
      const res = await getBudgets(currentMonth, currentYear);
      setBudgets(res.data);
    } catch (err) {
      setError('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await setBudget({
        category: form.category,
        monthlyLimit: Number(form.monthlyLimit),
        month: currentMonth,
        year: currentYear
      });
      setForm({ category: '', monthlyLimit: '' });
      fetchBudgets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set budget');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id);
      fetchBudgets();
    } catch (err) {
      setError('Failed to delete budget');
    }
  };

  const getBarColor = (percentUsed) => {
    if (percentUsed >= 100) return 'bg-red-500';
    if (percentUsed >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h2 className="text-lg font-bold mb-4">
        Budget Planner — {now.toLocaleString('default', { month: 'long' })} {currentYear}
      </h2>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <input
          name="category"
          placeholder="Category (e.g. Food)"
          value={form.category}
          onChange={handleChange}
          className="flex-1 border p-2 rounded"
          required
        />
        <input
          name="monthlyLimit"
          type="number"
          placeholder="Monthly Limit (₹)"
          value={form.monthlyLimit}
          onChange={handleChange}
          className="flex-1 border p-2 rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Set Budget
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500">Loading budgets...</p>
      ) : budgets.length === 0 ? (
        <p className="text-gray-500">No budgets set yet for this month.</p>
      ) : (
        <div className="space-y-4">
          {budgets.map((b) => (
            <div key={b._id}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{b.category}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    ₹{b.spent} / ₹{b.monthlyLimit}
                    {b.remaining < 0 && (
                      <span className="text-red-600 font-semibold"> (Over by ₹{Math.abs(b.remaining)})</span>
                    )}
                  </span>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="text-gray-400 hover:text-red-500 text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${getBarColor(b.percentUsed)}`}
                  style={{ width: `${Math.min(b.percentUsed, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BudgetPlanner;