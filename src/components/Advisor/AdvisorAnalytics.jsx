import  { useState, useEffect } from 'react';
import { advisorAPI } from '../../services/api';
import { FaChartLine, FaUsers, FaComments, FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdvisorAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    totalConversations: 0,
    unreadMessages: 0,
    activeChats: 0
  });
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);

  
  const fetchAnalytics = async () => {
    try {
      const response = await advisorAPI.getAnalytics();
      console.log('Analytics data:', response.data);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    }
  };

  
  const fetchStudents = async () => {
    try {
      const response = await advisorAPI.getStudents();
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAnalytics(), fetchStudents()]);
      setLoading(false);
    };
    
    loadData();
  }, []); // مصفوفة dependencies فارغة

  const statCards = [
    { 
      title: 'Total Students', 
      value: analytics.totalStudents || students.length, 
      icon: FaUsers, 
      color: 'bg-blue-500',
      description: 'Students assigned to you'
    },
    { 
      title: 'Total Conversations', 
      value: analytics.totalConversations || 0, 
      icon: FaComments, 
      color: 'bg-green-500',
      description: 'All chat conversations'
    },
    { 
      title: 'Unread Messages', 
      value: analytics.unreadMessages || 0, 
      icon: FaEnvelope, 
      color: 'bg-yellow-500',
      description: 'Messages waiting for reply'
    },
    { 
      title: 'Active Chats', 
      value: analytics.activeChats || 0, 
      icon: FaChartLine, 
      color: 'bg-purple-500',
      description: 'Ongoing conversations'
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-2">View your teaching statistics and performance metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-full text-white`}>
                <stat.icon size={24} />
              </div>
              <span className="text-3xl font-bold text-gray-800">{stat.value}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{stat.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Students List with Chat Activity */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Student Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.fullName || student.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{student.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {student.lastActive ? new Date(student.lastActive).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {student.messageCount || 0} messages
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a 
                      href={`/advisor/chat/${student.id}`}
                      className="text-primary-500 hover:text-primary-700 font-medium"
                    >
                      Chat →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdvisorAnalytics;