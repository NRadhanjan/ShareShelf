import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [proposedDays, setProposedDays] = useState(1);
  const [agreedPrice, setAgreedPrice] = useState('');
  const [requestStatus, setRequestStatus] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/items/${id}`);
      setItem(res.data.item);
      setAgreedPrice(res.data.item.pricePerLoan);
    } catch (err) {
      setError('Item not found');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    setRequestStatus('');
    setRequestLoading(true);

    try {
      await api.post(
        '/requests',
        { itemId: id, proposedDays, agreedPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequestStatus('success');
    } catch (err) {
      setRequestStatus(err.response?.data?.error || 'Something went wrong');
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) return <p className="text-gray-400 text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-400 text-center mt-10">{error}</p>;

  const isOwner = user && item.owner._id === user.id;

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      <div className="max-w-lg mx-auto bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white">{item.title}</h1>
        <p className="text-gray-400 mt-2">{item.description}</p>

        <div className="flex justify-between items-center mt-4 text-sm">
          <span className="text-blue-400 font-medium">₹{item.pricePerLoan} suggested</span>
          <span className="text-gray-500">Max {item.maxLoanDays} days</span>
        </div>
        <p className="text-gray-500 text-sm mt-2">Listed by {item.owner.name}</p>

        {!user && (
          <p className="text-gray-400 text-sm mt-6">
            Log in to request this item.
          </p>
        )}

        {user && isOwner && (
          <p className="text-gray-400 text-sm mt-6">
            This is your own listing.
          </p>
        )}

        {user && !isOwner && requestStatus !== 'success' && (
          <form onSubmit={handleRequest} className="mt-6 border-t border-gray-700 pt-4">
            <h2 className="text-white font-medium mb-3">Request to borrow</h2>

            {requestStatus && requestStatus !== 'success' && (
              <p className="bg-red-500/20 text-red-400 text-sm p-2 rounded mb-3">
                {requestStatus}
              </p>
            )}

            <label className="text-gray-400 text-sm block mb-1">Days needed</label>
            <input
              type="number"
              min="1"
              max={item.maxLoanDays}
              value={proposedDays}
              onChange={(e) => setProposedDays(Number(e.target.value))}
              className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
              required
            />

            <label className="text-gray-400 text-sm block mb-1">Proposed price (₹)</label>
            <input
              type="number"
              min="0"
              value={agreedPrice}
              onChange={(e) => setAgreedPrice(Number(e.target.value))}
              className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
              required
            />

            <button
              type="submit"
              disabled={requestLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded disabled:opacity-50"
            >
              {requestLoading ? 'Sending request...' : 'Send request'}
            </button>
          </form>
        )}

        {requestStatus === 'success' && (
          <p className="bg-green-500/20 text-green-400 text-sm p-3 rounded mt-6">
            Request sent! The owner will review it.
          </p>
        )}
      </div>
    </div>
  );
}

export default ItemDetail;