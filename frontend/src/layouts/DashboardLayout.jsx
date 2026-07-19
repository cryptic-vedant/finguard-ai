import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const titles = {
  '/dashboard': 'Overview',
  '/dashboard/transactions': 'Transactions',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/budgets': 'Budget Planner',
  '/dashboard/insights': 'AI Insights',
};

function DashboardLayout() {
  const location = useLocation();
  const title = titles[location.pathname] || 'Dashboard';

  return (
    <div className="flex min-h-screen bg-[#F6F7FB]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title={title} />
        <main className="flex-1 p-8 animate-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;