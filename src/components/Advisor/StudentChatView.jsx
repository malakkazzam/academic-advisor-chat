// src/components/Advisor/StudentChatView.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUserGraduate, FaPaperPlane, FaSpinner, FaCheck, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const StudentChatView = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [showEmailSearch, setShowEmailSearch] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const isMounted = useRef(true);
  const isFetching = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchAllStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/Advisor/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
    return [];
  };

  // ✅ جلب المحادثة - مرة واحدة فقط
  const fetchConversation = async () => {
    if (!student || !isMounted.current || isFetching.current) return;
    
    isFetching.current = true;
    
    try {
      const token = localStorage.getItem('token');
      
      const convRes = await fetch(`/api/Advisor/students/${student.id}/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (convRes.ok && isMounted.current) {
        const conversations = await convRes.json();
        console.log('Student conversations loaded once');
        
        if (conversations && conversations.messages) {
          setMessages(conversations.messages);
        } else {
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
      if (isMounted.current) {
        setError('Failed to load conversation');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        isFetching.current = false;
      }
    }
  };

  // ✅ إرسال رسالة جديدة
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending || !student) return;
    
    setSending(true);
    const messageText = inputMessage;
    setInputMessage('');
    
    const tempMsg = {
      id: Date.now(),
      content: messageText,
      senderId: 'advisor',
      sender: 'Advisor',
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    setMessages(prev => [...prev, tempMsg]);
    scrollToBottom();
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/Advisor/students/${student.id}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageText)
      });
      
      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempMsg.id ? { ...msg, status: 'sent' } : msg
        ));
        toast.success('Message sent to student');
        
        // ✅ تحديث المحادثة مرة واحدة فقط بعد الإرسال
        setTimeout(() => {
          if (isMounted.current) {
            fetchConversation();
          }
        }, 1000);
      } else {
        throw new Error('Send failed');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(msg => msg.id !== tempMsg.id));
      setInputMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleSearchStudent = async () => {
    if (!searchEmail.trim()) {
      toast.error('Please enter an email');
      return;
    }
    
    setLoading(true);
    const allStudents = await fetchAllStudents();
    const foundStudent = allStudents.find(s => 
      s.email?.toLowerCase() === searchEmail.toLowerCase()
    );
    
    if (foundStudent) {
      setStudent(foundStudent);
      setShowEmailSearch(false);
      setSearchEmail('');
      await fetchConversation();
      toast.success(`Connected to ${foundStudent.fullName || foundStudent.name}`);
    } else {
      toast.error('No student found with this email');
      setLoading(false);
    }
  };

  // ✅ تحميل الطالب من الرابط (مرة واحدة فقط)
  useEffect(() => {
    if (studentId && !student) {
      const loadStudent = async () => {
        setLoading(true);
        const allStudents = await fetchAllStudents();
        const found = allStudents.find(s => s.id === parseInt(studentId));
        if (found && isMounted.current) {
          setStudent(found);
          await fetchConversation();
        } else if (isMounted.current) {
          setLoading(false);
          setError('Student not found');
        }
      };
      loadStudent();
    }
  }, [studentId]); // ✅ studentId فقط كـ dependency

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !showEmailSearch && !sending) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  };

  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach(msg => {
      const date = formatDate(msg.timestamp);
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-500 text-sm">Loading conversation...</p>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] text-center">
        <FaExclamationTriangle className="text-yellow-500 text-5xl mb-4" />
        <p className="text-gray-600 mb-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 py-3 flex items-center gap-3 shadow-md">
        <button onClick={() => navigate('/advisor')} className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all">
          <FaArrowLeft size={18} />
        </button>
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <FaUserGraduate className="text-white text-lg" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-white">
            {student?.fullName || student?.name || 'Select a student'}
          </h2>
          {student && (
            <p className="text-white/70 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              {student.email}
            </p>
          )}
        </div>
        <button onClick={() => setShowEmailSearch(true)} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all">
          <FaSearch size={18} />
        </button>
      </div>

      {showEmailSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Find Student by Email</h3>
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Enter student email..."
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
              autoFocus
              onKeyPress={(e) => { if (e.key === 'Enter') handleSearchStudent(); }}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowEmailSearch(false)} className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={handleSearchStudent} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">Search</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#efeae2]">
        {!student ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <FaUserGraduate className="text-5xl mb-3 opacity-40" />
            <p className="text-sm">Select a student to start messaging</p>
            <p className="text-xs">Click the search icon and enter student email</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <FaUserGraduate className="text-5xl mb-3 opacity-40" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Type a message to start the conversation</p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, msgs]) => (
            <div key={date}>
              <div className="text-center my-4">
                <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full shadow-sm">{date}</span>
              </div>
              {msgs.map((msg, idx) => {
                const isAdvisor = msg.senderId === 'advisor' || msg.sender === 'Advisor';
                return (
                  <div key={msg.id || idx} className={`flex mb-3 ${isAdvisor ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isAdvisor ? 'mr-2' : 'ml-2'}`}>
                      <div className={`rounded-2xl px-4 py-2 shadow-sm ${isAdvisor ? 'bg-[#dcf8c5] text-gray-800 rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'}`}>
                        <p className="text-sm break-words">{msg.content}</p>
                        <div className={`text-[10px] mt-1 flex items-center gap-1 justify-end ${isAdvisor ? 'text-gray-500' : 'text-gray-400'}`}>
                          <span>{formatTime(msg.timestamp)}</span>
                          {isAdvisor && msg.status === 'sending' && <FaSpinner className="animate-spin" size={10} />}
                          {isAdvisor && msg.status === 'sent' && <FaCheck className="text-gray-400" size={10} />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t">
        <div className="flex gap-2 items-end">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={student ? "Type a message..." : "Select a student first..."}
            className="flex-1 resize-none p-3 text-sm border-0 rounded-2xl bg-gray-100 focus:bg-white focus:ring-1 focus:ring-green-500 focus:outline-none transition-all"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '100px' }}
            disabled={sending || !student}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || sending || !student}
            className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-green-700 transition-all shadow-md"
          >
            {sending ? <FaSpinner className="animate-spin" size={18} /> : <FaPaperPlane size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentChatView;