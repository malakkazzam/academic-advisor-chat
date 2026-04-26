// src/components/Layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaHome, FaRobot, FaUser, FaUsers, FaBook, FaChartLine } from 'react-icons/fa';

const Sidebar = () => {
  const { user } = useAuth();

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
      default: // student
        return [
          { path: '/chat', label: 'AI Assistant', icon: FaRobot }, // ✅ Changed to AI Assistant
          { path: '/profile', label: 'Profile', icon: FaUser },
        ];
    }
  }, [user?.role]);

  if (!user) return null;

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen">
      <nav className="mt-8">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/advisor'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-500 transition-colors ${
                isActive ? 'bg-primary-50 text-primary-500 border-r-4 border-primary-500' : ''
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;