import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/register', form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B1220] text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#0F9B8E]/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#0F9B8E]/10 blur-3xl"></div>

        <div className="flex items-center gap-3 relative z-10">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#0F9B8E]/20">
            <span className="absolute inline-flex h-9 w-9 rounded-full bg-[#0F9B8E]/30 shield-pulse"></span>
            <span>🛡</span>
          </span>
          <span className="font-display text-xl font-semibold">FinGuard <span className="text-[#0F9B8E]">AI</span></span>
        </div>

        <div className="relative z-10">
          <h2 className="font-display text-4xl font-semibold leading-tight mb-4">
            Your money,<br />under watch.
          </h2>
          <p className="text-slate-400 max-w-sm">
            Join FinGuard AI to auto-categorize expenses, catch fraud early, and forecast what's next.
          </p>
        </div>

        <p className="text-xs text-slate-500 relative z-10">© 2026 FinGuard AI</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F6F7FB]">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-semibold text-slate-900 mb-1">Create your account</h2>
          <p className="text-sm text-slate-500 mb-8">Start managing your finances smarter</p>

          {error && (
            <div className="mb-4 text-sm bg-red-50 text-red-600 border border-red-100 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Full name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none transition-all focus:border-[#0F9B8E] focus:ring-2 focus:ring-[#0F9B8E]/20"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none transition-all focus:border-[#0F9B8E] focus:ring-2 focus:ring-[#0F9B8E]/20"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none transition-all focus:border-[#0F9B8E] focus:ring-2 focus:ring-[#0F9B8E]/20"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#0F9B8E] transition-colors disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-center mt-6 text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0F9B8E] font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;