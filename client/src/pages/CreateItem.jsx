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
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <p className="text-slate text-center">Log in to list an item.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-ink">List an item</h1>
          <p className="text-slate text-sm mt-1">Let other students borrow something you own</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6">
          {error && (
            <p className="bg-red-50 text-red-600 text-sm p-2 rounded-lg mb-4">{error}</p>
          )}

          <label className="text-ink text-sm font-medium block mb-1">Item title</label>
          <input
            type="text"
            placeholder="e.g. Scientific Calculator"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 mb-4 rounded-lg border border-gray-300 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-campus-blue"
            required
          />

          <label className="text-ink text-sm font-medium block mb-1">Description</label>
          <textarea
            placeholder="Condition, model, anything a borrower should know"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 mb-4 rounded-lg border border-gray-300 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-campus-blue resize-none"
            rows="3"
            required
          />

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="text-ink text-sm font-medium block mb-1">Price (₹)</label>
              <input
                type="number"
                min="0"
                placeholder="40"
                value={pricePerLoan}
                onChange={(e) => setPricePerLoan(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-campus-blue"
                required
              />
            </div>
            <div>
              <label className="text-ink text-sm font-medium block mb-1">Max days</label>
              <input
                type="number"
                min="1"
                placeholder="3"
                value={maxLoanDays}
                onChange={(e) => setMaxLoanDays(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-campus-blue"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-campus-blue hover:bg-campus-blue-dark text-white font-medium p-2.5 rounded-lg disabled:opacity-50 transition"
          >
            {loading ? 'Listing...' : 'List item'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateItem;