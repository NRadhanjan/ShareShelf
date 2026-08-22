import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function IncomingRequests() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests/incoming', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.requests);
    } catch (err) {
      setActionError('Could not load requests');
    } finally {
      setLoading(false);
    }
  };

  const respond = async (requestId, action) => {
    setActionError('');
    try {
      await api.patch(
        `/requests/${requestId}/respond`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const confirmHandover = async (requestId) => {
    setActionError('');
    try {
      await api.patch(
        `/requests/${requestId}/confirm-handover`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const confirmReturn = async (requestId) => {
    setActionError('');
    try {
      await api.patch(
        `/requests/${requestId}/confirm-return`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Something went wrong');
    }
  };

  if (loading) return <p className="text-gray-400 text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-6 max-w-lg mx-auto">Incoming Requests</h1>

      {actionError && (
        <p className="bg-red-500/20 text-red-400 text-sm p-2 rounded mb-4 max-w-lg mx-auto">
          {actionError}
        </p>
      )}

      {requests.length === 0 && (
        <p className="text-gray-400 text-center">No incoming requests</p>
      )}

      <div className="max-w-lg mx-auto flex flex-col gap-4">
        {requests.map((r) => (
          <div key={r._id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white font-medium">{r.item.title}</p>
                <p className="text-gray-400 text-sm">From {r.borrower.name}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {r.proposedDays} days · ₹{r.agreedPrice}
                </p>
              </div>
              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded capitalize">
                {r.status.replace('_', ' ')}
              </span>
            </div>

            {r.status === 'requested' && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => respond(r._id, 'approve')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm p-2 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => respond(r._id, 'reject')}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm p-2 rounded"
                >
                  Reject
                </button>
              </div>
            )}

            {(r.status === 'approved' || r.status === 'pending_pickup') && !r.ownerConfirmedHandover && (
              <button
                onClick={() => confirmHandover(r._id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm p-2 rounded mt-3"
              >
                Confirm handover & payment received
              </button>
            )}

            {r.status === 'active' && !r.ownerConfirmedReturn && (
              <button
                onClick={() => confirmReturn(r._id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm p-2 rounded mt-3"
              >
                Confirm item returned
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default IncomingRequests;