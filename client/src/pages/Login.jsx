import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
          <p className="text-slate text-sm mt-1">Log in to ShareShelf</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6">
          {error && (
            <p className="bg-red-50 text-red-600 text-sm p-2 rounded-lg mb-4">{error}</p>
          )}

          <label className="text-ink text-sm font-medium block mb-1">VIT email</label>
          <input
            type="email"
            placeholder="you@vitstudent.ac.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 mb-4 rounded-lg border border-gray-300 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-teal"
            required
          />

          <label className="text-ink text-sm font-medium block mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2.5 mb-5 rounded-lg border border-gray-300 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-teal"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal hover:bg-teal-dark text-white font-medium p-2.5 rounded-lg disabled:opacity-50 transition"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="text-slate text-sm mt-4 text-center">
          Don't have an account? <Link to="/signup" className="text-teal font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;