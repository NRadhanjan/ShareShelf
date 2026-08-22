import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [regNo, setRegNo] = useState('');
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
      await api.post('/auth/signup', {
        name,
        email,
        regNo,
        password,
      });

      // Auto-login after successful signup
      const loginRes = await api.post('/auth/login', {
        email,
        password,
      });

      login(loginRes.data.token, loginRes.data.user);
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
        <h1 className="text-2xl font-bold text-white mb-6">Sign up for ShareShelf</h1>

        {error && (
          <p className="bg-red-500/20 text-red-400 text-sm p-2 rounded mb-4">{error}</p>
        )}

        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
          required
        />
        <input
          type="email"
          placeholder="VIT email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
          required
        />
        <input
          type="text"
          placeholder="Registration number"
          value={regNo}
          onChange={(e) => setRegNo(e.target.value)}
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
          {loading ? 'Signing up...' : 'Sign up'}
        </button>

        <p className="text-gray-400 text-sm mt-4 text-center">
          Already have an account? <Link to="/login" className="text-blue-400">Log in</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;