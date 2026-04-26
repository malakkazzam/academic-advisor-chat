import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  FaHome,
  FaRobot,
  FaUser,
  FaUsers,
  FaBook,
  FaChartLine,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const Sidebar = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const menuItems = React.useMemo(() => {
    switch (user?.role?.toLowerCase()) {
      case 'admin':
        return [
          { path: '/admin', label: 'Dashboard', icon: FaHome },
          { path: '/admin', label: 'Users Management', icon: FaUsers },
          { path: '/admin', label: 'Regulations', icon: FaBook },
        ];

      case 'advisor':
        return [
          { path: '/advisor', label: 'My Students', icon: FaUsers },
          { path: '/advisor/analytics', label: 'Analytics', icon: FaChartLine },
        ];

      default:
        return [
          { path: '/chat', label: 'AI Assistant', icon: FaRobot },
          { path: '/profile', label: 'Profile', icon: FaUser },
        ];
    }
  }, [user?.role]);

  if (!user) return null;

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between bg-white px-4 py-3 shadow-sm border-b">
        <h1 className="text-xl font-bold text-gray-800">UniGuide</h1>

        <button onClick={() => setOpen(true)}>
          <FaBars className="text-xl text-gray-700" />
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg
          transform transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:block lg:min-h-screen
        `}
      >
        {/* Mobile Close */}
        <div className="lg:hidden flex justify-between items-center px-4 py-4 border-b">
          <h2 className="text-lg font-bold">Menu</h2>

          <button onClick={() => setOpen(false)}>
            <FaTimes className="text-xl text-gray-600" />
          </button>
        </div>

        {/* Desktop Logo */}
        <div className="hidden lg:block px-6 py-6 text-2xl font-bold text-gray-800 border-b">
          UniGuide
        </div>

        <nav className="mt-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/advisor'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;