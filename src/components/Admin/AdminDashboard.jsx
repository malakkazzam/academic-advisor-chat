// src/components/Admin/AdminDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { FaUsers,  FaChartLine, FaUserPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import UsersManagement from './UsersManagement';
import RegulationsManagement from './RegulationsManagement';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdvisors: 0,
    totalStudents: 0,
    totalConversations: 0
  });
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  // تحديد المحتوى المناسب بناءً على الـ URL
  const activeContent = (() => {
    if (location.pathname === '/admin/users') return 'users';
    if (location.pathname === '/admin/regulations') return 'regulations';
    return 'dashboard';
  })();

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ✅ جلب البيانات فقط عندما نكون في الـ Dashboard
  useEffect(() => {
    if (activeContent !== 'dashboard') {
      // إذا لم نكن في الـ Dashboard، ننهي التحميل فورًا
      if (isMounted.current) {
        setLoading(false);
      }
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const response = await adminAPI.getDashboard();
        if (isMounted.current) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        if (error.response?.status === 403) {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [activeContent, navigate]);

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers || 0, icon: FaUsers, color: 'bg-blue-500' },
    { title: 'Advisors', value: stats.totalAdvisors || 0, icon: FaUserPlus, color: 'bg-green-500' },
    { title: 'Students', value: stats.totalStudents || 0, icon: FaUsers, color: 'bg-purple-500' },
    { title: 'Conversations', value: stats.totalConversations || 0, icon: FaChartLine, color: 'bg-orange-500' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Dashboard Content */}
        {activeContent === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="text-white text-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <FaChartLine className="text-gray-400 text-xl" />
                </div>
                <p className="text-gray-500 text-sm">No recent activity to display</p>
                <p className="text-gray-400 text-xs mt-1">Activity will appear here</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Management */}
        {activeContent === 'users' && <UsersManagement />}

        {/* Regulations Management */}
        {activeContent === 'regulations' && <RegulationsManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;