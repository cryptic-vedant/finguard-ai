import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { downloadCSV, downloadPDF } from '../api/transactions';

function Topbar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200 px-8 py-4 flex items-center justify-between">
      <div>
        <h1 className="font-display text-xl font-semibold text-slate-900">{title}</h1>
        <p className="text-xs text-slate-500 mt-0.5">Welcome back, {user?.name}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={downloadCSV}
          className="text-sm font-medium px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          Export CSV
        </button>
        <button
          onClick={downloadPDF}
          className="text-sm font-medium px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          Export PDF
        </button>
        <button
          onClick={handleLogout}
          className="text-sm font-medium px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-[#0F9B8E] transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Topbar;