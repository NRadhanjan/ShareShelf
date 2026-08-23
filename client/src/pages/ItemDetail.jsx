import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function ItemDetail() {
  const { id } = useParams();
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

  if (loading) return <p className="text-slate text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;

  const isOwner = user && item.owner._id === user.id;

  return (
    <div className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-lg mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold text-ink">{item.title}</h1>
            <span className="bg-mustard/20 text-ink text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ml-2">
              Available
            </span>
          </div>
          <p className="text-slate mt-2">{item.description}</p>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 text-sm">
            <span className="text-teal font-semibold">₹{item.pricePerLoan} suggested</span>
            <span className="text-slate">Max {item.maxLoanDays} days</span>
          </div>
          <p className="text-slate text-sm mt-2">Listed by {item.owner.name}</p>

          {!user && (
            <p className="text-slate text-sm mt-6 bg-gray-50 p-3 rounded-lg">
              Log in to request this item.
            </p>
          )}

          {user && isOwner && (
            <p className="text-slate text-sm mt-6 bg-gray-50 p-3 rounded-lg">
              This is your own listing.
            </p>
          )}

          {user && !isOwner && requestStatus !== 'success' && (
            <form onSubmit={handleRequest} className="mt-6 border-t border-gray-100 pt-5">
              <h2 className="text-ink font-semibold mb-3">Request to borrow</h2>

              {requestStatus && requestStatus !== 'success' && (
                <p className="bg-red-50 text-red-600 text-sm p-2 rounded-lg mb-3">
                  {requestStatus}
                </p>
              )}

              <label className="text-ink text-sm font-medium block mb-1">Days needed</label>
              <input
                type="number"
                min="1"
                max={item.maxLoanDays}
                value={proposedDays}
                onChange={(e) => setProposedDays(Number(e.target.value))}
                className="w-full p-2.5 mb-3 rounded-lg border border-gray-300 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-teal"
                required
              />

              <label className="text-ink text-sm font-medium block mb-1">Proposed price (₹)</label>
              <input
                type="number"
                min="0"
                value={agreedPrice}
                onChange={(e) => setAgreedPrice(Number(e.target.value))}
                className="w-full p-2.5 mb-4 rounded-lg border border-gray-300 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-teal"
                required
              />

              <button
                type="submit"
                disabled={requestLoading}
                className="w-full bg-teal hover:bg-teal-dark text-white font-medium p-2.5 rounded-lg disabled:opacity-50 transition"
              >
                {requestLoading ? 'Sending request...' : 'Send request'}
              </button>
            </form>
          )}

          {requestStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
              <p className="text-green-700 font-medium text-sm">Request sent!</p>
              <p className="text-green-600 text-sm mt-0.5">The owner will review it shortly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;