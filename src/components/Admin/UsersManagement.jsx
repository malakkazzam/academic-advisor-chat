import  { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../services/api';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import toast from 'react-hot-toast';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  // منع تحديث الحالة بعد إلغاء تحميل المكون
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // تعريف وتنفيذ fetchUsers داخل useEffect مباشرة
  useEffect(() => {
   const fetchUsers = async () => {
  try {
    const response = await adminAPI.getUsers();
    console.log('Users response:', response.data);
    // إذا كانت البيانات داخل response.data.data
    const usersData = response.data.data || response.data;
    setUsers(usersData);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    toast.error('Failed to fetch users');
  } finally {
    setLoading(false);
  }
};

    fetchUsers();
  }, []); // مصفوفة dependencies فارغة - يتم التنفيذ مرة واحدة

  const toggleUserStatus = async (userId) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      // إعادة جلب المستخدمين بعد التحديث
      const response = await adminAPI.getUsers();
      if (isMounted.current) {
        setUsers(response.data);
      }
      toast.success('User status updated');
    } catch {
      if (isMounted.current) {
        toast.error('Failed to update user status');
      }
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        const response = await adminAPI.getUsers();
        if (isMounted.current) {
          setUsers(response.data);
        }
        toast.success('User deleted successfully');
      } catch {
        if (isMounted.current) {
          toast.error('Failed to delete user');
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'advisor' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleUserStatus(user.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {user.isActive ? <FaToggleOn size={24} className="text-green-500" /> : <FaToggleOff size={24} className="text-red-500" />}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex gap-2">
                    <button className="text-blue-500 hover:text-blue-700">
                      <FaEdit />
                    </button>
                    <button onClick={() => deleteUser(user.id)} className="text-red-500 hover:text-red-700">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersManagement;