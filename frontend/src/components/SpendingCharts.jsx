import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

function SpendingCharts({ transactions }) {
  // Category-wise spending breakdown (pie chart)
  const categoryData = useMemo(() => {
    const totals = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = t.category || 'Others';
        totals[cat] = (totals[cat] || 0) + t.amount;
      });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Daily spending trend (bar chart) — last 14 days
  const dailyData = useMemo(() => {
    const totals = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const day = new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        totals[day] = (totals[day] || 0) + t.amount;
      });
    return Object.entries(totals)
      .map(([day, amount]) => ({ day, amount }))
      .slice(-14);
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <p className="text-gray-500">Add some transactions to see your spending analytics.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Category Pie Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">Spending by Category</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${value}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Spending Bar Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">Daily Spending Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(value) => `₹${value}`} />
            <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SpendingCharts;