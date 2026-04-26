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
    { title: 'Total Users', value: stats.totalUsers || 0, icon: FaUsers, color: 'bg-blue-500' },
    { title: 'Advisors', value: stats.totalAdvisors || 0, icon: FaUserPlus, color: 'bg-green-500' },
    { title: 'Students', value: stats.totalStudents || 0, icon: FaUsers, color: 'bg-purple-500' },
    { title: 'Conversations', value: stats.totalConversations || 0, icon: FaChartLine, color: 'bg-orange-500' },
  ];

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: FaChartLine },
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'regulations', label: 'Regulations', icon: FaBook },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-gray-800">UniGuide Admin</h1>
          <p className="text-xs text-gray-500">Manage your platform</p>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <FaBars className="text-gray-600 text-xl" />
        </button>
      </div>

      {/* Mobile Tabs Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 p-3 space-y-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-base ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Desktop Tabs */}
        <div className="hidden lg:block border-b border-gray-200 mb-6">
          <nav className="flex gap-2">
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
          <div className="space-y-5">
            {/* Stats Cards - 2 columns on mobile, 4 on desktop */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {statCards.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-xs sm:text-sm">{stat.title}</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.color} flex items-center justify-center shadow-sm`}>
                      <stat.icon className="text-white text-lg sm:text-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Recent Activity</h3>
              <div className="text-center py-6 sm:py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <FaChartLine className="text-gray-400 text-xl" />
                </div>
                <p className="text-gray-500 text-sm">No recent activity to display</p>
                <p className="text-gray-400 text-xs mt-1">Activity will appear here</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Users Management</h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Manage all users in the system</p>
            </div>
            <div className="overflow-x-auto">
              <UsersManagement />
            </div>
          </div>
        )}

        {/* Regulations Tab */}
        {activeTab === 'regulations' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Regulations Management</h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Manage academic regulations and policies</p>
            </div>
            <div className="p-4 sm:p-5">
              <RegulationsManagement />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;