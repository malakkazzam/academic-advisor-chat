// src/components/Advisor/StudentsList.jsx
import  { useState, useEffect } from 'react';
import { advisorAPI } from '../../services/api';
import { FaComments, FaChartLine, FaUserGraduate, FaSearch, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await advisorAPI.getStudents();
        setStudents(response.data);
      } catch {
        toast.error('Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const startChat = (studentId) => {
    navigate(`/advisor/chat/${studentId}`);
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Students</h1>
          <p className="text-gray-500 text-sm sm:text-base mt-1">Manage and communicate with your assigned students</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Students Grid - Responsive */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FaUserGraduate className="mx-auto text-4xl text-gray-300 mb-3" />
            <p className="text-gray-500">No students found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredStudents.map((student) => (
              <div key={student.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                        <FaUserGraduate className="text-white text-base sm:text-lg" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{student.name}</h3>
                        <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-1">
                          <FaEnvelope size={10} className="sm:w-3 sm:h-3" />
                          {student.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-3 mt-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <FaChartLine size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span className="text-xs sm:text-sm">GPA: {student.gpa || 'N/A'}</span>
                      </div>
                      <button
                        onClick={() => startChat(student.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all text-xs sm:text-sm font-medium"
                      >
                        <FaComments size={12} className="sm:w-3.5 sm:h-3.5" />
                        Chat
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-400">
            Showing {filteredStudents.length} of {students.length} students
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentsList;