import { useState, useEffect } from 'react';
import { getTransactions } from '../api/transactions';
import ForecastCard from '../components/ForecastCard';

function Overview() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions()
      .then(res => setTransactions(res.data))
      .finally(() => setLoading(false));
  }, []);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const flagged = transactions.filter(t => t.isAnomaly);

  const cards = [
    { label: 'Total Income', value: totalIncome, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Expense', value: totalExpense, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Balance', value: totalIncome - totalExpense, color: 'text-slate-900', bg: 'bg-slate-50' },
  ];

  return (
    <div className="space-y-6">
      {flagged.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3.5 rounded-xl text-sm flex items-center gap-2">
          <span>⚠</span>
          <span><strong>{flagged.length}</strong> transaction(s) flagged as unusual — check the Transactions tab.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`p-5 rounded-xl border border-slate-100 ${c.bg}`}>
            <p className="text-xs font-medium text-slate-500 mb-1">{c.label}</p>
            <p className={`font-display text-2xl font-semibold ${c.color}`}>
              {loading ? '—' : `₹${c.value}`}
            </p>
          </div>
        ))}
      </div>

      <ForecastCard />

      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <h2 className="font-display font-semibold text-slate-900 mb-4">Recent Activity</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-slate-500">No transactions yet — add one from the Transactions tab.</p>
        ) : (
          <div className="space-y-1">
            {transactions.slice(0, 5).map(t => (
              <div key={t._id} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-700">{t.category} · {t.merchant || 'Unknown'}</span>
                <span className={`text-sm font-medium ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {t.type === 'income' ? '+' : '-'}₹{t.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Overview;