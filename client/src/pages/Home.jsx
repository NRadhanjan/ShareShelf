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
    <div className="min-h-screen bg-paper px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-ink">Browse items</h1>
          <p className="text-slate text-sm mt-1">Borrow what you need from fellow VITians</p>
        </div>

        <form onSubmit={handleSearch} className="max-w-md mb-8">
          <input
            type="text"
            placeholder="Search for calculators, lab coats, textbooks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 bg-white text-ink placeholder-slate/60 focus:outline-none focus:ring-2 focus:ring-teal"
          />
        </form>

        {loading && <p className="text-slate text-center py-10">Loading items...</p>}
        {error && <p className="text-red-600 text-center py-10">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <div className="text-center py-16">
            <p className="text-ink font-medium">No items found</p>
            <p className="text-slate text-sm mt-1">Be the first to list something.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Link
              key={item._id}
              to={`/items/${item._id}`}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-teal hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-ink font-semibold">{item.title}</h2>
                <span className="bg-mustard/20 text-ink text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ml-2">
                  Available
                </span>
              </div>
              <p className="text-slate text-sm line-clamp-2">{item.description}</p>
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                <span className="text-teal font-semibold">₹{item.pricePerLoan}</span>
                <span className="text-slate text-xs">{item.maxLoanDays} days max</span>
              </div>
              <p className="text-slate text-xs mt-2">Listed by {item.owner.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;