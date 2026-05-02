// src/components/Student/AdvisorMessages.jsx
import { useState, useEffect, useRef } from 'react';
import { FaUserTie, FaPaperPlane, FaSpinner, FaCommentDots, FaCheck, FaCheckDouble } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdvisorMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const isMounted = useRef(true);
  const isFetching = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // تحميل الصوت
  useEffect(() => {
    audioRef.current = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // ✅ استخدام نفس Conversation ID اللي يستخدمه المشرف (ID 37)
  const ADVISOR_CONVERSATION_ID = 37;

  // ✅ جلب المحادثة بشكل آمن
  const loadConversation = async () => {
    if (!isMounted.current || isFetching.current) return;
    
    isFetching.current = true;
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`/api/Chat/conversations/${ADVISOR_CONVERSATION_ID}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const convData = await response.json();
        const newMessages = convData.messages || [];
        
        // تشغيل الصوت عند وصول رسالة جديدة من المشرف
        if (newMessages.length > previousMessageCount && previousMessageCount > 0 && isMounted.current) {
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
          }
          toast.success('New message from advisor!');
        }
        
        if (isMounted.current) {
          setPreviousMessageCount(newMessages.length);
          setMessages(newMessages);
        }
      } else if (response.status === 404) {
        // إذا لم توجد المحادثة، ننشئ واحدة جديدة
        const createRes = await fetch('/api/Chat/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            conversationId: null,
            message: "Starting advisor conversation",
            type: 'text'
          })
        });
        if (createRes.ok) {
          const newConv = await createRes.json();
          console.log('New conversation created:', newConv.conversationId || newConv.id);
        }
        if (isMounted.current) {
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        isFetching.current = false;
      }
    }
  };

  // ✅ تحديث دوري آمن
  const updateMessages = async () => {
    if (!isMounted.current) return;
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`/api/Chat/conversations/${ADVISOR_CONVERSATION_ID}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const convData = await response.json();
        const newMessages = convData.messages || [];
        
        if (newMessages.length > previousMessageCount && previousMessageCount > 0 && isMounted.current) {
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
          }
          toast.success('New message from advisor!');
        }
        
        if (isMounted.current) {
          setPreviousMessageCount(newMessages.length);
          setMessages(newMessages);
        }
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  // ✅ useEffect الآمن للتحميل الأولي
  useEffect(() => {
    isMounted.current = true;
    
    const init = async () => {
      await loadConversation();
    };
    init();
    
    intervalRef.current = setInterval(updateMessages, 5000);
    
    return () => {
      isMounted.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ✅ إرسال رسالة
  const sendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    setSending(true);
    const text = inputMessage;
    setInputMessage('');

    const tempMsg = {
      id: Date.now(),
      content: text,
      sender: 'Student',
      senderId: 'student',
      timestamp: new Date().toISOString(),
      temp: true,
      status: 'sending'
    };
    setMessages(prev => [...prev, tempMsg]);
    scrollToBottom();

    const token = localStorage.getItem('token');
    
    try {
      // ✅ إرسال إلى نفس Conversation ID (37)
      const response = await fetch('/api/Chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId: ADVISOR_CONVERSATION_ID,
          message: text,
          type: 'text'
        })
      });
      
      if (response.ok) {
        setMessages(prev => prev.map(m => 
          m.id === tempMsg.id ? { ...m, status: 'sent', temp: false } : m
        ));
        toast.success('Message sent');
        setTimeout(() => updateMessages(), 500);
      } else {
        throw new Error('Send failed');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to send');
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      setInputMessage(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Header - WhatsApp style */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 py-3 flex items-center gap-3 shadow-md">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <FaUserTie className="text-white text-lg" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-white">Academic Advisor</h2>
          <p className="text-white/70 text-xs flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Online • Typically responds within 24 hours
          </p>
        </div>
      </div>

      {/* Messages Area - WhatsApp style */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#efeae2]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <FaCommentDots className="text-5xl mb-3 opacity-40" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Send a message to your academic advisor</p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, msgs]) => (
            <div key={date}>
              <div className="text-center my-4">
                <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full shadow-sm">
                  {date}
                </span>
              </div>
              {msgs.map((msg, idx) => {
                const isAdvisor = msg.sender === 'Advisor' || msg.senderId === 'advisor';
                return (
                  <div key={msg.id || idx} className={`flex mb-3 ${isAdvisor ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[70%] ${isAdvisor ? 'ml-2' : 'mr-2'}`}>
                      <div className={`rounded-2xl px-4 py-2 shadow-sm ${
                        isAdvisor 
                          ? 'bg-white text-gray-800 rounded-tl-none' 
                          : 'bg-[#dcf8c5] text-gray-800 rounded-tr-none'
                      }`}>
                        <p className="text-sm break-words">{msg.content}</p>
                        <div className={`text-[10px] mt-1 flex items-center gap-1 justify-end ${
                          isAdvisor ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <span>{formatTime(msg.timestamp)}</span>
                          {!isAdvisor && (
                            msg.status === 'sending' ? (
                              <FaSpinner className="animate-spin text-gray-400" size={10} />
                            ) : msg.status === 'sent' ? (
                              <FaCheck className="text-gray-400" size={10} />
                            ) : (
                              <FaCheckDouble className="text-blue-500" size={10} />
                            )
                          )}
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

      {/* Input Area - WhatsApp style */}
      <div className="p-3 bg-white border-t">
        <div className="flex gap-2 items-end">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 resize-none p-3 text-sm border-0 rounded-2xl bg-gray-100 focus:bg-white focus:ring-1 focus:ring-green-500 focus:outline-none transition-all"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '100px' }}
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || sending}
            className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-green-700 transition-all shadow-md"
          >
            {sending ? <FaSpinner className="animate-spin" size={18} /> : <FaPaperPlane size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvisorMessages;