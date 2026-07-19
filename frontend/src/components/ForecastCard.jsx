import { useState, useEffect } from 'react';
import { getForecast } from '../api/forecast';

function ForecastCard() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await getForecast();
        setForecast(res.data);
      } catch (err) {
        console.error('Failed to load forecast');
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <p className="text-gray-500">Loading forecast...</p>
      </div>
    );
  }

  if (!forecast?.forecast_available) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-lg font-bold mb-2">Expense Forecast</h2>
        <p className="text-gray-500">{forecast?.reason || 'Not enough data yet to forecast.'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h2 className="text-lg font-bold mb-4">Expense Forecast — Next {forecast.forecast_days} Days</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-500 text-sm">Predicted Total Spending</p>
          <p className="text-2xl font-bold text-blue-600">₹{forecast.predicted_next_month_total}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-gray-500 text-sm">Predicted Avg. Daily Spending</p>
          <p className="text-2xl font-bold text-purple-600">₹{forecast.avg_daily_predicted}</p>
        </div>
      </div>
    </div>
  );
}

export default ForecastCard;