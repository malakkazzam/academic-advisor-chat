import  { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../services/api';
import { FaUsers,  FaChartLine, FaUserPlus } from 'react-icons/fa';
import UsersManagement from './UsersManagement';
import RegulationsManagement from './RegulationsManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdvisors: 0,
    totalStudents: 0,
    totalConversations: 0
  });
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // جلب بيانات dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await adminAPI.getDashboard();
        if (isMounted.current) {
          console.log('Dashboard data:', response.data);
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, []);

  // دالة تغيير التبويب - تأكد من أنها تعمل
  const handleTabChange = (tab) => {
    console.log('Changing tab to:', tab);
    setActiveTab(tab);
  };

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: FaUsers, color: 'bg-blue-500' },
    { title: 'Advisors', value: stats.totalAdvisors, icon: FaUserPlus, color: 'bg-green-500' },
    { title: 'Students', value: stats.totalStudents, icon: FaUsers, color: 'bg-purple-500' },
    { title: 'Conversations', value: stats.totalConversations, icon: FaChartLine, color: 'bg-orange-500' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      
      {/* Tabs - تأكد من أن onClick يعمل */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          <button
            onClick={() => handleTabChange('overview')}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === 'overview'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleTabChange('users')}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === 'users'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
            }`}
          >
            Users Management
          </button>
          <button
            onClick={() => handleTabChange('regulations')}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === 'regulations'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
            }`}
          >
            Regulations
          </button>
        </nav>
      </div>

      {/* محتوى التبويبات */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                      </div>
                      <div className={`${stat.color} p-3 rounded-full text-white`}>
                        <stat.icon size={24} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Users Management</h2>
            <UsersManagement />
          </div>
        )}

        {activeTab === 'regulations' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Regulations Management</h2>
            <RegulationsManagement />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;