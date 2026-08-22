import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function Home() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async (searchTerm = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/items', {
        params: searchTerm ? { search: searchTerm } : {},
      });
      setItems(res.data.items);
    } catch (err) {
      setError('Could not load items');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems(search);
  };

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white"
        />
      </form>

      {loading && <p className="text-gray-400 text-center">Loading...</p>}
      {error && <p className="text-red-400 text-center">{error}</p>}

      {!loading && items.length === 0 && (
        <p className="text-gray-400 text-center">No items found</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {items.map((item) => (
          <Link
            key={item._id}
            to={`/items/${item._id}`}
            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition"
          >
            <span className="inline-block bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded mb-2">
            Available
            </span>
            <h2 className="text-white font-semibold text-lg">{item.title}</h2>
            <p className="text-gray-400 text-sm mt-1">{item.description}</p>
            <div className="flex justify-between items-center mt-3">
              <span className="text-blue-400 font-medium">₹{item.pricePerLoan}</span>
              <span className="text-gray-500 text-xs">{item.maxLoanDays} days max</span>
            </div>
            <p className="text-gray-500 text-xs mt-2">Listed by {item.owner.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;