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
    <nav className="bg-gray-800 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-white font-bold text-lg">ShareShelf</Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/my-requests" className="text-gray-300 hover:text-white text-sm">My Requests</Link>
            <Link to="/incoming" className="text-gray-300 hover:text-white text-sm">Requests</Link>
            <span className="text-gray-300 text-sm">Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-300 hover:text-white text-sm">Log in</Link>
            <Link to="/signup" className="text-gray-300 hover:text-white text-sm">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;