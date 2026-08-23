import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const statusStyles = {
  requested: 'bg-mustard/20 text-ink',
  approved: 'bg-teal/10 text-teal',
  pending_pickup: 'bg-teal/10 text-teal',
  active: 'bg-teal text-white',
  returned: 'bg-gray-100 text-slate',
  rejected: 'bg-gray-100 text-slate',
};

function MyRequests() {
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
      const res = await api.get('/requests/my-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const statusPriority = {
        requested: 1,
        approved: 2,
        pending_pickup: 2,
        active: 3,
        returned: 4,
        rejected: 5,
      };

      const sorted = res.data.requests.sort((a, b) => {
        const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setRequests(sorted);
    } catch (err) {
      setActionError('Could not load requests');
    } finally {
      setLoading(false);
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

  if (loading) return <p className="text-slate text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-paper px-6 py-10">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-ink mb-1">My requests</h1>
        <p className="text-slate text-sm mb-6">Items you've asked to borrow</p>

        {actionError && (
          <p className="bg-red-50 text-red-600 text-sm p-2 rounded-lg mb-4">{actionError}</p>
        )}

        {requests.length === 0 && (
          <div className="text-center py-16">
            <p className="text-ink font-medium">No requests yet</p>
            <p className="text-slate text-sm mt-1">Browse items to find something to borrow.</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {requests.map((r) => (
            <div key={r._id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-ink font-semibold">{r.item.title}</p>
                  <p className="text-slate text-sm">Owner: {r.owner.name}</p>
                  <p className="text-slate text-sm mt-1">
                    {r.proposedDays} days · ₹{r.agreedPrice}
                  </p>
                  {r.dueDate && (
                    <p className="text-slate text-xs mt-1">
                      Due {new Date(r.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  <Link to={`/chat/${r._id}`} className="text-teal text-xs font-medium hover:underline inline-block mt-1">
                    Open chat
                  </Link>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize whitespace-nowrap ml-2 ${statusStyles[r.status]}`}>
                  {r.status.replace('_', ' ')}
                </span>
              </div>

              {(r.status === 'approved' || r.status === 'pending_pickup') && !r.borrowerConfirmedHandover && (
                <button
                  onClick={() => confirmHandover(r._id)}
                  className="w-full bg-teal hover:bg-teal-dark text-white text-sm font-medium p-2 rounded-lg mt-3 transition"
                >
                  Confirm handover & payment sent
                </button>
              )}

              {r.status === 'active' && !r.borrowerConfirmedReturn && (
                <button
                  onClick={() => confirmReturn(r._id)}
                  className="w-full bg-teal hover:bg-teal-dark text-white text-sm font-medium p-2 rounded-lg mt-3 transition"
                >
                  Confirm item returned
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyRequests;