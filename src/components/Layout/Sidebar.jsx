import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaHome, FaUsers, FaBook, FaBars, FaTimes } from 'react-icons/fa';

const Sidebar = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: FaHome },
    { path: '/admin', label: 'Users', icon: FaUsers },
    { path: '/admin', label: 'Regulations', icon: FaBook },
  ];

  return (
    <>
      {/* ✅ Mobile Top Bar */}
      <div className="lg:hidden flex justify-between items-center p-4 bg-white border-b shadow-sm">
        <h1 className="font-bold text-lg">UniGuide</h1>
        <button onClick={() => setOpen(true)}>
          <FaBars className="text-xl" />
        </button>
      </div>

      {/* ✅ Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ✅ Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg
          transform transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Mobile Close Button */}
        <div className="flex justify-between items-center p-4 border-b lg:hidden">
          <h2 className="font-semibold">Menu</h2>
          <button onClick={() => setOpen(false)}>
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Desktop Logo */}
        <div className="hidden lg:block px-6 py-6 text-2xl font-bold border-b">
          UniGuide
        </div>

        {/* Menu */}
        <nav className="mt-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 transition ${
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