import { useState, useEffect } from 'react';
import { getTransactions, createTransaction, deleteTransaction } from '../api/transactions';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ amount: '', type: 'expense', category: '', merchant: '', description: '' });

  const fetchTransactions = async () => {
    try {
      const res = await getTransactions();
      setTransactions(res.data);
    } catch {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
    await deleteTransaction(id);
    fetchTransactions();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl border border-slate-100 p-6 lg:col-span-1 h-fit">
        <h2 className="font-display font-semibold text-slate-900 mb-4">Add Transaction</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0F9B8E] focus:ring-2 focus:ring-[#0F9B8E]/20 transition-all" required />
          <select name="type" value={form.type} onChange={handleChange}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0F9B8E] focus:ring-2 focus:ring-[#0F9B8E]/20 transition-all">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <input name="category" placeholder="Category (optional — AI will guess)" value={form.category} onChange={handleChange}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0F9B8E] focus:ring-2 focus:ring-[#0F9B8E]/20 transition-all" />
          <input name="merchant" placeholder="Merchant" value={form.merchant} onChange={handleChange}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0F9B8E] focus:ring-2 focus:ring-[#0F9B8E]/20 transition-all" />
          <input name="description" placeholder="Description" value={form.description} onChange={handleChange}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0F9B8E] focus:ring-2 focus:ring-[#0F9B8E]/20 transition-all" />
          <button type="submit" className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#0F9B8E] transition-colors">
            Add Transaction
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-6 lg:col-span-2">
        <h2 className="font-display font-semibold text-slate-900 mb-4">All Transactions</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-slate-500">No transactions yet. Add one!</p>
        ) : (
          <div className="space-y-1">
            {transactions.map((t) => (
              <div key={t._id} className={`flex justify-between items-center py-3 px-3 rounded-lg transition-colors hover:bg-slate-50 ${t.isAnomaly ? 'bg-red-50 hover:bg-red-50' : ''}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800">{t.category || 'Uncategorized'} {t.merchant && `· ${t.merchant}`}</p>
                    {t.isAnomaly && (
                      <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">
                        ⚠ {t.riskLevel} Risk
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{t.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {t.type === 'income' ? '+' : '-'}₹{t.amount}
                  </span>
                  <button onClick={() => handleDelete(t._id)} className="text-slate-300 hover:text-red-500 transition-colors text-sm">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Transactions;