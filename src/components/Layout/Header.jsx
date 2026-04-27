
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaRobot,FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
              <FaRobot className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold text-primary-500">UniGuide</span>
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