import  { useState, useEffect } from 'react';
import { advisorAPI } from '../../services/api';
import { FaComments, FaChartLine, FaUserGraduate } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // الحل: تعريف وتنفيذ fetchStudents داخل useEffect مباشرة
  useEffect(() => {
    // استخدام IIFE (Immediately Invoked Function Expression)
    const fetchStudents = async () => {
      try {
        const response = await advisorAPI.getStudents();
        setStudents(response.data);
      } catch {
        toast.error('Failed to fetch students');
        console.error('Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []); // مصفوفة dependencies فارغة - يتم التنفيذ مرة واحدة فقط

  const startChat = (studentId) => {
    navigate(`/advisor/chat/${studentId}`);
  };

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
        <h1 className="text-3xl font-bold text-gray-800">My Students</h1>
        <p className="text-gray-500 mt-2">Manage and communicate with your assigned students</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => (
          <div key={student.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <FaUserGraduate className="text-primary-500 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{student.name}</h3>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaChartLine />
                    <span className="text-sm">GPA: {student.gpa || 'N/A'}</span>
                  </div>
                  <button
                    onClick={() => startChat(student.id)}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    <FaComments /> Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentsList;