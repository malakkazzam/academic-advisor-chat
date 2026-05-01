// src/components/Student/AdvisorMessages.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { getStudentAdvisorMessages, sendMessageToAdvisor } from '../../services/api';
import { FaUserTie, FaPaperPlane, FaSpinner, FaCommentDots } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdvisorMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const isMounted = useRef(true);
  const intervalRef = useRef(null);
  const isFetching = useRef(false); // منع الـ overlapping requests

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ تعريف fetchMessages كـ async function منفصلة مع cleanup
  const fetchMessages = useCallback(async () => {
    // منع الـ concurrent requests
    if (isFetching.current || !isMounted.current) return;
    
    isFetching.current = true;
    
    try {
      const response = await getStudentAdvisorMessages();
      if (isMounted.current) {
        setMessages(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      if (isMounted.current && !loading) {
        toast.error('Failed to load messages');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      isFetching.current = false;
    }
  }, [loading]);

  // ✅ useEffect مع async/await بطريقة صحيحة
  useEffect(() => {
    // Start fetching immediately
    const initFetch = async () => {
      await fetchMessages();
    };
    
    initFetch();
    
    // Set up polling every 30 seconds
    intervalRef.current = setInterval(() => {
      if (isMounted.current) {
        fetchMessages();
      }
    }, 30000);
    
    // Cleanup function
    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchMessages]); // ✅ fetchMessages هي الـ dependency الوحيدة

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    setSending(true);
    const messageText = inputMessage;
    setInputMessage('');

    // إضافة الرسالة محلياً فوراً
    const newMessage = {
      id: Date.now(),
      content: messageText,
      sender: 'Student',
      senderId: 'student',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
    scrollToBottom();

    try {
      await sendMessageToAdvisor(messageText);
      toast.success('Message sent to advisor');
      
      // ✅ جلب الرسائل بعد التأخير عشان نشوف رد الـ advisor
      setTimeout(() => {
        if (isMounted.current) {
          fetchMessages();
        }
      }, 1000);
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
      // لو فشلت، نشيل الرسالة اللي ضفناها
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
      setInputMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 sm:px-6 py-4 flex items-center gap-3 shadow-md">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <FaUserTie className="text-white text-lg" />
        </div>
        <div>
          <h2 className="font-semibold text-white text-base sm:text-lg">Academic Advisor</h2>
          <p className="text-white/70 text-xs">Typically responds within 24 hours</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <FaCommentDots className="text-5xl mb-3 opacity-30" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Send a message to your academic advisor</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isAdvisor = msg.sender === 'Advisor' || msg.senderId === 'advisor';
            return (
              <div
                key={msg.id || index}
                className={`flex ${isAdvisor ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[80%] ${isAdvisor ? 'items-start' : 'items-end'}`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    isAdvisor
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-400">
                      {isAdvisor ? 'Advisor' : 'You'}
                    </p>
                    <span className="text-xs text-gray-400">•</span>
                    <p className="text-xs text-gray-400">{formatTime(msg.timestamp)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask your academic advisor a question..."
            className="flex-1 resize-none py-2 px-4 text-sm rounded-xl border border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-all duration-200"
            rows={2}
            disabled={sending}
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || sending}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
          >
            {sending ? (
              <FaSpinner className="animate-spin" size={16} />
            ) : (
              <FaPaperPlane size={16} />
            )}
            <span className="hidden sm:inline text-sm">Send</span>
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Messages go directly to your academic advisor
        </p>
      </div>
    </div>
  );
};

export default AdvisorMessages;