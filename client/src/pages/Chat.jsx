import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Chat() {
  const { requestId } = useParams();
  const { token, user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchMessages();
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

  if (loading) return <p className="text-gray-400 text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-400 text-center mt-10">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-6 flex flex-col">
      <div className="max-w-lg w-full mx-auto flex flex-col flex-1 bg-gray-800 rounded-lg overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2" style={{ maxHeight: '60vh' }}>
          {messages.length === 0 && (
            <p className="text-gray-500 text-sm text-center">No messages yet — say hi!</p>
          )}
          {messages.map((m) => {
            const isMe = m.sender._id === user.id;
            return (
              <div
                key={m._id}
                className={`max-w-[75%] p-2 rounded-lg text-sm ${
                  isMe ? 'self-end bg-blue-600 text-white' : 'self-start bg-gray-700 text-white'
                }`}
              >
                {m.text}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-gray-700">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message"
            className="flex-1 p-2 rounded bg-gray-700 text-white text-sm"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded text-sm"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;