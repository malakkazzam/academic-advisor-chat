// src/components/Advisor/AdvisorAnalytics.jsx
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

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await advisorAPI.getAnalytics();
        setAnalytics(response.data);
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await advisorAPI.getStudents();
        setStudents(response.data);
      } catch {
        console.error('Failed to fetch students');
      }
    };

    fetchAnalytics();
    fetchStudents();
  }, []);

  const statCards = [
    { title: 'Total Students', value: analytics.totalStudents || students.length, icon: FaUsers, color: 'from-blue-500 to-blue-600', desc: 'Students assigned to you' },
    { title: 'Conversations', value: analytics.totalConversations || 0, icon: FaComments, color: 'from-green-500 to-green-600', desc: 'Total chat conversations' },
    { title: 'Unread Messages', value: analytics.unreadMessages || 0, icon: FaEnvelope, color: 'from-yellow-500 to-yellow-600', desc: 'Messages waiting for reply' },
    { title: 'Active Chats', value: analytics.activeChats || 0, icon: FaChartLine, color: 'from-purple-500 to-purple-600', desc: 'Ongoing conversations' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-500 text-sm sm:text-base mt-1">View your teaching statistics and performance metrics</p>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-4 sm:p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-sm`}>
                  <stat.icon className="text-white text-sm sm:text-base" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-gray-800">{stat.value}</span>
              </div>
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{stat.title}</h3>
              <p className="text-gray-400 text-[10px] sm:text-xs mt-0.5">{stat.desc}</p>
            </div>
          ))}
        </div>

        {/* Student Activity Table - Responsive */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">Student Activity</h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Recent interactions with your students</p>
          </div>
          
          {/* Mobile Cards View */}
          <div className="block lg:hidden divide-y divide-gray-100">
            {students.map((student) => (
              <div key={student.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{student.fullName || student.name}</h3>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {student.lastActive ? new Date(student.lastActive).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50">
                  <span className="text-xs text-gray-500">{student.messageCount || 0} messages</span>
                  <a
                    href={`/advisor/chat/${student.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Chat →
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Messages</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{student.fullName || student.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {student.lastActive ? new Date(student.lastActive).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                        {student.messageCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <a href={`/advisor/chat/${student.id}`} className="text-blue-600 hover:text-blue-700 font-medium">
                        Chat →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {students.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No students found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvisorAnalytics;