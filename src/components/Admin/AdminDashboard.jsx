// src/components/Admin/AdminDashboard.jsx
import  { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../services/api';
import { FaUsers, FaBook, FaChartLine, FaUserPlus, FaBars } from 'react-icons/fa';
import UsersManagement from './UsersManagement';
import RegulationsManagement from './RegulationsManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await adminAPI.getDashboard();
        if (isMounted.current) {
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

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: FaUsers, color: 'from-blue-500 to-blue-600' },
    { title: 'Advisors', value: stats.totalAdvisors, icon: FaUserPlus, color: 'from-green-500 to-green-600' },
    { title: 'Students', value: stats.totalStudents, icon: FaUsers, color: 'from-purple-500 to-purple-600' },
    { title: 'Conversations', value: stats.totalConversations, icon: FaChartLine, color: 'from-orange-500 to-orange-600' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'regulations', label: 'Regulations', icon: FaBook },
  ];

  // ✅ إذا كان في حالة تحميل، أظهر مؤشر التحميل
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-20">
        <h1 className="text-lg font-bold text-gray-800">Admin Panel</h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <FaBars className="text-gray-600" />
        </button>
      </div>

      {/* Mobile Tabs Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 p-2 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={18} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Desktop Tabs */}
        <div className="hidden lg:block border-b border-gray-200 mb-6">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm rounded-t-lg transition-all ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {statCards.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-xs sm:text-sm">{stat.title}</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-sm`}>
                      <stat.icon className="text-white text-base sm:text-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <p className="text-gray-500 text-sm">No recent activity to display.</p>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Users Management</h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">Manage all users in the system</p>
            </div>
            <div className="overflow-x-auto">
              <UsersManagement />
            </div>
          </div>
        )}

        {/* Regulations Tab */}
        {activeTab === 'regulations' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Regulations Management</h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">Manage academic regulations and policies</p>
            </div>
            <div className="p-4 sm:p-6">
              <RegulationsManagement />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;