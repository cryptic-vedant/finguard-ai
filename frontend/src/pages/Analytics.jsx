import { useState, useEffect } from 'react';
import { getTransactions } from '../api/transactions';
import SpendingCharts from '../components/SpendingCharts';

function Analytics() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    getTransactions().then(res => setTransactions(res.data));
  }, []);

  return <SpendingCharts transactions={transactions} />;
}

export default Analytics;