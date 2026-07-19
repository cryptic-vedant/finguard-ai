import { useState, useEffect } from 'react';
import { getInsights } from '../api/insights';

function InsightsPanel() {
  const [data, setData] = useState({ insights: [], subscriptions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await getInsights();
        setData(res.data);
      } catch (err) {
        console.error('Failed to load insights');
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <p className="text-gray-500">Loading insights...</p>
      </div>
    );
  }

  const { insights = [], subscriptions = [] } = data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* AI Insights */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">💡 AI Insights</h2>
        {insights.length === 0 ? (
          <p className="text-gray-500">Not enough data yet for insights. Keep adding transactions!</p>
        ) : (
          <ul className="space-y-2">
            {insights.map((insight, idx) => (
              <li key={idx} className="text-sm bg-blue-50 p-3 rounded-lg text-gray-700">
                {insight}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Subscriptions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">🔁 Detected Subscriptions</h2>
        {subscriptions.length === 0 ? (
          <p className="text-gray-500">No recurring subscriptions detected yet.</p>
        ) : (
          <div className="space-y-2">
            {subscriptions.map((sub, idx) => (
              <div key={idx} className="flex justify-between items-center bg-purple-50 p-3 rounded-lg">
                <span className="font-medium">{sub.merchant}</span>
                <span className="text-sm text-gray-600">
                  ₹{sub.amount} × {sub.occurrences} times
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InsightsPanel;