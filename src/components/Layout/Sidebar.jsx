// src/components/Layout/Sidebar.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaHome, FaRobot, FaUser, FaUsers, FaBook, FaChartLine, FaTimes } from 'react-icons/fa';

const Sidebar = ({ onClose }) => {
  const { user } = useAuth();
  const location = useLocation(); // ✅ مستخدمة

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
    <aside className="w-64 bg-white shadow-md min-h-screen flex-shrink-0 flex flex-col">
      {onClose && (
        <div className="p-4 border-b border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>
      )}
      
      <nav className="mt-4 flex-1">
        {menuItems.map((item) => {
          // ✅ استخدام location لتحديد active state
          const isActive = location.pathname === item.path || 
                          (item.path === '/admin' && location.pathname.startsWith('/admin/')) ||
                          (item.path === '/advisor' && location.pathname.startsWith('/advisor/'));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              end={item.path === '/admin' || item.path === '/advisor'}
              className={({ isActive: navIsActive }) =>
                `group relative flex items-center gap-3 px-6 py-3 text-gray-700 transition-all duration-300 ease-in-out ${
                  (navIsActive || isActive)
                    ? 'bg-primary-50 text-primary-500 border-r-4 border-primary-500' 
                    : 'hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent hover:text-primary-500'
                }`
              }
            >
              <item.icon 
                size={20} 
                className={`transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-3`}
              />
              
              <span className="transition-all duration-300 ease-in-out group-hover:translate-x-1">
                {item.label}
              </span>
              
              <span className="absolute bottom-2 left-6 w-0 h-0.5 bg-primary-500 transition-all duration-300 ease-in-out group-hover:w-8"></span>
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-400">AI Academic Advisor</p>
      </div>
    </aside>
  );
};

export default Sidebar;