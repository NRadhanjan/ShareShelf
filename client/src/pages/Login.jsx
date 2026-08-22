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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-6">Log in to ShareShelf</h1>

        {error && (
          <p className="bg-red-500/20 text-red-400 text-sm p-2 rounded mb-4">{error}</p>
        )}

        <input
          type="email"
          placeholder="VIT email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <p className="text-gray-400 text-sm mt-4 text-center">
          Don't have an account? <Link to="/signup" className="text-blue-400">Sign up</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;