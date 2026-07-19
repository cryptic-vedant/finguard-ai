import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getTransactions, createTransaction, deleteTransaction, downloadCSV, downloadPDF  } from '../api/transactions';
import BudgetPlanner from '../components/BudgetPlanner';
import SpendingCharts from '../components/SpendingCharts';
import ForecastCard from '../components/ForecastCard';
import InsightsPanel from '../components/InsightsPanel';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    amount: '',
    type: 'expense',
    category: '',
    merchant: '',
    description: ''
  });

  const fetchTransactions = async () => {
    try {
      const res = await getTransactions();
      setTransactions(res.data);
    } catch (err) {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createTransaction({ ...form, amount: Number(form.amount) });
      setForm({ amount: '', type: 'expense', category: '', merchant: '', description: '' });
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add transaction');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      fetchTransactions();
    } catch (err) {
      setError('Failed to delete transaction');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user?.name} 👋</h1>
        <div className="flex gap-3">
          <button
            onClick={downloadCSV}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            📥 Export CSV
          </button>
          <button
            onClick={downloadPDF}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            📄 Export PDF
          </button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total Income</p>
          <p className="text-2xl font-bold text-green-600">₹{totalIncome}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total Expense</p>
          <p className="text-2xl font-bold text-red-600">₹{totalExpense}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Balance</p>
          <p className="text-2xl font-bold text-blue-600">₹{totalIncome - totalExpense}</p>
        </div>
      </div>
      {transactions.some(t => t.isAnomaly) && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
          ⚠ You have <strong>{transactions.filter(t => t.isAnomaly).length}</strong> transaction(s) flagged as unusual. Review them below.
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add transaction form */}
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-1">
          <h2 className="text-lg font-bold mb-4">Add Transaction</h2>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              name="amount"
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input
              name="category"
              placeholder="Category (e.g. Food)"
              value={form.category}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            <input
              name="merchant"
              placeholder="Merchant (e.g. Zomato)"
              value={form.merchant}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            <input
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
              Add Transaction
            </button>
          </form>
        </div>

        {/* Transaction list */}
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <h2 className="text-lg font-bold mb-4">Recent Transactions</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet. Add one!</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((t) => (
                <div
                  key={t._id}
                  className={`flex justify-between items-center border-b py-2 px-2 rounded ${
                    t.isAnomaly ? 'bg-red-50 border-red-200' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {t.category || 'Uncategorized'} {t.merchant && `· ${t.merchant}`}
                      </p>
                      {t.isAnomaly && (
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">
                          ⚠ {t.riskLevel} Risk
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{t.description}</p>
                    {t.isAnomaly && (
                      <p className="text-xs text-red-600 mt-1">{t.fraudReason}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount}
                    </span>
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="text-gray-400 hover:text-red-500 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <SpendingCharts transactions={transactions} />
       <ForecastCard />
       <InsightsPanel />
      <BudgetPlanner />
    </div>
  );
}

export default Dashboard;