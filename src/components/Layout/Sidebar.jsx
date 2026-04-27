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
          { path: '/admin/users', label: 'Users', icon: FaUsers },
          { path: '/admin/regulations', label: 'Regulations', icon: FaBook },
        ];
      case 'advisor':
        return [
          { path: '/advisor', label: 'My Students', icon: FaUsers },
          { path: '/advisor/analytics', label: 'Analytics', icon: FaChartLine },
        ];
      case 'student':
        return [
          { path: '/chat', label: 'AI Assistant', icon: FaRobot },
          { path: '/profile', label: 'Profile', icon: FaUser },
        ];
      default:
        return [
          { path: '/profile', label: 'Profile', icon: FaUser },
        ];
    }
  }, [user?.role]);

  if (!user) return null;

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen flex-shrink-0">
      {/* Logo */}
      {/* <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-500">UniGuide</h1>
      </div> */}
      
      <nav className="mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin' || item.path === '/advisor'}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-6 py-3 text-gray-700 transition-all duration-300 ease-in-out ${
                isActive 
                  ? 'bg-primary-50 text-primary-500 border-r-4 border-primary-500' 
                  : 'hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent hover:text-primary-500'
              }`
            }
          >
            {/* أيقونة مع hover effect */}
            <item.icon 
              size={20} 
              className={`transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-3 ${
                location.pathname === item.path ? 'text-primary-500' : ''
              }`}
            />
            
            {/* النص */}
            <span className="transition-all duration-300 ease-in-out group-hover:translate-x-1">
              {item.label}
            </span>
            
            {/* خط تحت النص عند hover */}
            <span className="absolute bottom-2 left-6 w-0 h-0.5 bg-primary-500 transition-all duration-300 ease-in-out group-hover:w-8"></span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;