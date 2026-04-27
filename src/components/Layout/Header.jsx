import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaRobot, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-white/20">
      <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo with blue gradient text */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
              <FaRobot className="text-white text-sm" />
            </div>
            {/* ✅ Blue gradient text like before */}
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              UniGuide
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors duration-200">
              <FaUserCircle size={24} />
              <span className="hidden sm:inline">{user?.name || user?.fullName || 'User'}</span>
            </Link>
            <button 
              onClick={() => logout()} 
              className="text-gray-700 hover:text-red-500 transition-colors duration-200"
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