import { useState, useEffect, useRef } from 'react';
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
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await adminAPI.getDashboard();
        if (isMounted.current) setStats(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted.current) setLoading(false);
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
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
   <div className="min-h-screen w-full bg-gray-50 overflow-x-hidden">

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b px-4 py-3 flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-lg font-bold">UniGuide Admin</h1>
          <p className="text-xs text-gray-500">Manage your platform</p>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <FaBars className="text-xl" />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white p-3 space-y-2 shadow">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">

        {/* Desktop Tabs */}
        <div className="hidden lg:flex gap-2 mb-6 border-b">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow-sm">
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <h2 className="text-2xl font-bold">{stat.value}</h2>
                </div>
              ))}
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm text-center">
              No recent activity
            </div>

          </div>
        )}

        {activeTab === 'users' && <UsersManagement />}
        {activeTab === 'regulations' && <RegulationsManagement />}

      </div>
    </div>
  );
};

export default AdminDashboard;