// src/components/Admin/UsersManagement.jsx
import  { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminAPI.getUsers();
        setUsers(response.data);
      } catch {
        toast.error('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // ✅ [] فارغة -> يتم التنفيذ مرة واحدة فقط

  const toggleUserStatus = async (userId) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      // ✅ إعادة جلب المستخدمين بعد التحديث باستخدام نفس الدالة
      const response = await adminAPI.getUsers();
      setUsers(response.data);
      toast.success('User status updated');
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        const response = await adminAPI.getUsers();
        setUsers(response.data);
        toast.success('User deleted successfully');
      } catch {
        toast.error('Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="block lg:hidden divide-y divide-gray-100">
        {filteredUsers.map((user) => (
          <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-gray-800">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                user.role === 'admin' ? 'bg-red-100 text-red-700' :
                user.role === 'advisor' ? 'bg-green-100 text-green-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {user.role}
              </span>
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50">
              <button
                onClick={() => toggleUserStatus(user.id)}
                className="flex items-center gap-2 text-sm"
              >
                {user.isActive ? (
                  <FaToggleOn className="text-green-500 text-xl" />
                ) : (
                  <FaToggleOff className="text-gray-400 text-xl" />
                )}
                <span className="text-xs text-gray-500">{user.isActive ? 'Active' : 'Inactive'}</span>
              </button>
              <div className="flex gap-3">
                <button className="text-blue-500 hover:text-blue-700">
                  <FaEdit size={16} />
                </button>
                <button onClick={() => deleteUser(user.id)} className="text-red-500 hover:text-red-700">
                  <FaTrash size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-red-100 text-red-700' :
                    user.role === 'advisor' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => toggleUserStatus(user.id)}>
                    {user.isActive ? (
                      <FaToggleOn className="text-green-500 text-xl" />
                    ) : (
                      <FaToggleOff className="text-gray-400 text-xl" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-3">
                    <button className="text-blue-500 hover:text-blue-700">
                      <FaEdit size={16} />
                    </button>
                    <button onClick={() => deleteUser(user.id)} className="text-red-500 hover:text-red-700">
                      <FaTrash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No users found
        </div>
      )}
    </div>
  );
};

export default UsersManagement;