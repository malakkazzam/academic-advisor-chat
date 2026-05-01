// src/components/Advisor/StudentChatView.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { advisorAPI } from '../../services/api';
import { FaArrowLeft, FaUserGraduate, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const StudentChatView = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchConversation = async () => {
      if (!studentId) return;
      
      try {
        const response = await advisorAPI.getStudentConversations(studentId);
        if (isMounted.current) {
          setMessages(response.data?.messages || []);
          setStudent(response.data?.student);
        }
      } catch (err) {
        console.error('Error loading conversation:', err);
        if (isMounted.current) {
          toast.error('Failed to load conversation');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchConversation();
  }, [studentId]);

  // ✅ Modified: send message as plain string (not object)
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending) return;
    
    setSending(true);
    
    try {
      // ✅ Send message as plain string, not as object
       await advisorAPI.sendMessageToStudent(studentId, inputMessage);

      
      if (isMounted.current) {
        // Add the new message to the list
        const newMessage = {
          id: Date.now(),
          content: inputMessage,
          senderId: 'advisor',
          sender: 'Advisor',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
        toast.success('Message sent');
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    } finally {
      if (isMounted.current) {
        setSending(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 shadow-md">
        <button
          onClick={() => navigate('/advisor')}
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
        >
          <FaArrowLeft size={18} />
        </button>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center">
          <FaUserGraduate className="text-white text-sm sm:text-base" />
        </div>
        <div>
          <h2 className="font-semibold text-white text-sm sm:text-base">
            {student?.fullName || student?.name || `Student ${studentId}`}
          </h2>
          <p className="text-white/70 text-[10px] sm:text-xs">{student?.email}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <FaUserGraduate className="text-4xl mb-3 opacity-30" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex ${message.senderId === 'advisor' || message.sender === 'Advisor' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] sm:max-w-[70%] ${message.senderId === 'advisor' || message.sender === 'Advisor' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
                  message.senderId === 'advisor' || message.sender === 'Advisor'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}>
                  <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                  {formatTime(message.timestamp || message.createdAt || new Date())}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 input-field resize-none py-2 px-3 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200"
            rows={window.innerWidth < 640 ? 1 : 2}
            disabled={sending}
            style={{ minHeight: '40px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || sending}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-5 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
          >
            {sending ? (
              <FaSpinner className="animate-spin" size={16} />
            ) : (
              <FaPaperPlane size={16} />
            )}
            <span className="hidden sm:inline text-sm">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentChatView;