
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary-500">
            UniGuide
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-primary-500">
              <FaUserCircle size={24} />
              <span className="hidden sm:inline">{user?.name || user?.fullName || 'User'}</span>
            </Link>
            <button 
              onClick={() => logout()} 
              className="text-gray-700 hover:text-red-500 transition-colors"
              aria-label="Logout"
            >
              <FaSignOutAlt size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;