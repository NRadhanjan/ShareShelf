import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const statusStyles = {
  requested: 'bg-shelf-yellow/20 text-ink',
  approved: 'bg-campus-blue/10 text-campus-blue',
  pending_pickup: 'bg-campus-blue/10 text-campus-blue',
  active: 'bg-campus-blue text-white',
  returned: 'bg-gray-100 text-slate',
  rejected: 'bg-gray-100 text-slate',
};

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

  if (loading) return <p className="text-slate text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-paper px-6 py-10">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-ink mb-1">Incoming requests</h1>
        <p className="text-slate text-sm mb-6">Requests from other students on your items</p>

        {actionError && (
          <p className="bg-red-50 text-red-600 text-sm p-2 rounded-lg mb-4">{actionError}</p>
        )}

        {requests.length === 0 && (
          <div className="text-center py-16">
            <p className="text-ink font-medium">No incoming requests</p>
            <p className="text-slate text-sm mt-1">List an item to start lending.</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {requests.map((r) => (
            <div key={r._id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-ink font-semibold">{r.item.title}</p>
                  <p className="text-slate text-sm">From {r.borrower.name}</p>
                  <p className="text-slate text-sm mt-1">
                    {r.proposedDays} days · ₹{r.agreedPrice}
                  </p>
                  <Link to={`/chat/${r._id}`} className="text-campus-blue text-xs font-medium hover:underline inline-block mt-1">
                    Open chat
                  </Link>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize whitespace-nowrap ml-2 ${statusStyles[r.status]}`}>
                  {r.status.replace('_', ' ')}
                </span>
              </div>

              {r.status === 'requested' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => respond(r._id, 'approve')}
                    className="flex-1 bg-campus-blue hover:bg-campus-blue-dark text-white text-sm font-medium p-2 rounded-lg transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => respond(r._id, 'reject')}
                    className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-ink text-sm font-medium p-2 rounded-lg transition"
                  >
                    Reject
                  </button>
                </div>
              )}

              {(r.status === 'approved' || r.status === 'pending_pickup') && !r.ownerConfirmedHandover && (
                <button
                  onClick={() => confirmHandover(r._id)}
                  className="w-full bg-campus-blue hover:bg-campus-blue-dark text-white text-sm font-medium p-2 rounded-lg mt-3 transition"
                >
                  Confirm handover & payment received
                </button>
              )}

              {r.status === 'active' && !r.ownerConfirmedReturn && (
                <button
                  onClick={() => confirmReturn(r._id)}
                  className="w-full bg-campus-blue hover:bg-campus-blue-dark text-white text-sm font-medium p-2 rounded-lg mt-3 transition"
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

export default IncomingRequests;