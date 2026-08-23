import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
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

function Chat() {
  const { requestId } = useParams();
  const { token, user } = useAuth();

  const [loanRequest, setLoanRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [requestId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data.messages);
    } catch (err) {
      // silently ignore polling errors
    }
  };

  const fetchData = async () => {
    try {
      const [requestRes, messagesRes] = await Promise.all([
        api.get(`/requests/${requestId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`/messages/${requestId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setLoanRequest(requestRes.data.loanRequest);
      setMessages(messagesRes.data.messages);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await api.post(
        `/messages/${requestId}`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, res.data.message]);
      setText('');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not send message');
    }
  };

  if (loading) return <p className="text-slate text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;

  const isBorrower = loanRequest.borrower._id === user.id;
  const otherPerson = isBorrower ? loanRequest.owner : loanRequest.borrower;

  return (
    <div className="min-h-screen bg-paper px-4 py-6 flex flex-col">
      <div className="max-w-lg w-full mx-auto flex flex-col flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden">

        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div>
            <p className="text-ink font-semibold">{otherPerson.name}</p>
            <p className="text-slate text-sm">{loanRequest.item.title}</p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${statusStyles[loanRequest.status]}`}>
            {loanRequest.status.replace('_', ' ')}
            {loanRequest.status === 'active' && loanRequest.dueDate && (
              <> · Due {new Date(loanRequest.dueDate).toLocaleDateString()}</>
            )}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-paper" style={{ maxHeight: '55vh' }}>
          {messages.length === 0 && (
            <p className="text-slate text-sm text-center mt-4">No messages yet — say hi!</p>
          )}
          {messages.map((m) => {
            const isMe = m.sender._id === user.id;
            return (
              <div
                key={m._id}
                className={`max-w-[75%] p-2.5 rounded-lg text-sm ${
                  isMe
                    ? 'self-end bg-campus-blue text-white'
                    : 'self-start bg-white border border-gray-200 text-ink'
                }`}
              >
                {m.text}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-gray-200 bg-white">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message"
            className="flex-1 p-2.5 rounded-lg border border-gray-300 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-campus-blue"
          />
          <button
            type="submit"
            className="bg-campus-blue hover:bg-campus-blue-dark text-white px-4 rounded-lg text-sm font-medium transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;