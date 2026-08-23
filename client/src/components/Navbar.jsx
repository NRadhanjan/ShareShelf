import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-1.5 font-bold text-lg text-ink">
        Share<span className="text-campus-blue">Shelf</span>
      </Link>

      <div className="flex items-center gap-5">
        {user ? (
          <>
            <Link to="/" className="text-slate hover:text-campus-blue text-sm font-medium">Browse</Link>
            <Link to="/create-item" className="text-slate hover:text-campus-blue text-sm font-medium">List an item</Link>
            <Link to="/my-requests" className="text-slate hover:text-campus-blue text-sm font-medium">My requests</Link>
            <Link to="/incoming" className="text-slate hover:text-campus-blue text-sm font-medium">Requests</Link>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <span className="bg-shelf-yellow/20 text-ink text-sm font-medium px-3 py-1 rounded-full">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-slate hover:text-red-600 text-sm font-medium"
              >
                Log out
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="text-slate hover:text-campus-blue text-sm font-medium">Log in</Link>
            <Link
              to="/signup"
              className="bg-campus-blue hover:bg-campus-blue-dark text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;