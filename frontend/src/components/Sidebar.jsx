import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: '🛡', end: true },
  { to: '/dashboard/transactions', label: 'Transactions', icon: '💳' },
  { to: '/dashboard/analytics', label: 'Analytics', icon: '📊' },
  { to: '/dashboard/budgets', label: 'Budgets', icon: '🎯' },
  { to: '/dashboard/insights', label: 'Insights', icon: '💡' },
];

function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-[#0B1220] text-slate-300 min-h-screen flex flex-col">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#0F9B8E]/20">
          <span className="absolute inline-flex h-8 w-8 rounded-full bg-[#0F9B8E]/30 shield-pulse"></span>
          <span className="text-sm">🛡</span>
        </span>
        <span className="font-display text-white text-lg font-semibold tracking-tight">
          FinGuard <span className="text-[#0F9B8E]">AI</span>
        </span>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#0F9B8E]/15 text-white border-l-2 border-[#0F9B8E]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-white/5 text-xs text-slate-500">
        Manage Smarter · Spend Better · Stay Protected
      </div>
    </aside>
  );
}

export default Sidebar;