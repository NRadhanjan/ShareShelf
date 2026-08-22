import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function CreateItem() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerLoan, setPricePerLoan] = useState('');
  const [maxLoanDays, setMaxLoanDays] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post(
        '/items',
        { title, description, pricePerLoan, maxLoanDays },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/items/${res.data.item._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <p className="text-gray-400 text-center mt-10">
        Log in to list an item.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg w-full max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">List an item</h1>

        {error && (
          <p className="bg-red-500/20 text-red-400 text-sm p-2 rounded mb-4">{error}</p>
        )}

        <input
          type="text"
          placeholder="Item title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
          rows="3"
          required
        />
        <input
          type="number"
          min="0"
          placeholder="Suggested price (₹)"
          value={pricePerLoan}
          onChange={(e) => setPricePerLoan(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
          required
        />
        <input
          type="number"
          min="1"
          placeholder="Max loan duration (days)"
          value={maxLoanDays}
          onChange={(e) => setMaxLoanDays(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? 'Listing...' : 'List item'}
        </button>
      </form>
    </div>
  );
}

export default CreateItem;