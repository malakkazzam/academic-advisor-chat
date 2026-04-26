import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaHome, FaUsers, FaBook,  FaTimes } from 'react-icons/fa';

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
      {/* Mobile Header */}
      {/* <div className="lg:hidden flex justify-between p-4 bg-white border-b">
        <h1>UniGuide</h1>
        <button onClick={() => setOpen(true)}>
          <FaBars />
        </button>
      </div> */}

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 w-64 h-full bg-white z-50 transform transition ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        
        <div className="flex justify-between p-4 border-b lg:hidden">
          <h2>Menu</h2>
          <button onClick={() => setOpen(false)}>
            <FaTimes />
          </button>
        </div>

        <nav className="mt-4">
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className="block px-6 py-3 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

      </aside>
    </>
  );
};

export default Sidebar;