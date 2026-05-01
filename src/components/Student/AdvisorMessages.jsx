// src/components/Student/AdvisorMessages.jsx
import { useState, useEffect, useRef } from 'react';
import { FaUserTie, FaPaperPlane, FaSpinner, FaCommentDots } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdvisorMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ استخدام /api بدل الرابط الكامل
  const loadConversation = () => {
    const token = localStorage.getItem('token');
    
    fetch('/api/Chat/conversations', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(conversations => {
      console.log('All conversations:', conversations);
      
      // دور على محادثة المشرف
      const advisorConv = conversations.find(c => 
        c.title === 'محادثة مع المشرف الأكاديمي' || 
        (c.title && c.title.toLowerCase().includes('advisor'))
      );
      
      if (advisorConv && advisorConv.id) {
        console.log('Advisor conversation found:', advisorConv.id);
        // جيب رسايل المحادثة
        fetch(`/api/Chat/conversations/${advisorConv.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(convData => {
          console.log('Messages:', convData.messages);
          setMessages(convData.messages || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching messages:', err);
          setLoading(false);
        });
      } else {
        console.log('No advisor conversation found');
        setMessages([]);
        setLoading(false);
      }
    })
    .catch(err => {
      console.error('Error fetching conversations:', err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadConversation();
    
    intervalRef.current = setInterval(() => {
      loadConversation();
    }, 30000);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const sendMessage = () => {
    if (!inputMessage.trim() || sending) return;

    setSending(true);
    const text = inputMessage;
    setInputMessage('');

    const tempMsg = {
      id: Date.now(),
      content: text,
      sender: 'Student',
      timestamp: new Date().toISOString(),
      temp: true
    };
    setMessages(prev => [...prev, tempMsg]);
    scrollToBottom();

    const token = localStorage.getItem('token');
    
    // ✅ استخدام /api بدل الرابط الكامل
    fetch('/api/Chat/send-to-advisor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message: text })
    })
    .then(res => {
      if (res.ok) {
        toast.success('Message sent to advisor');
        setTimeout(() => loadConversation(), 500);
      } else {
        throw new Error('Send failed');
      }
    })
    .catch(err => {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      setInputMessage(text);
    })
    .finally(() => {
      setSending(false);
    });
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
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-4 flex items-center gap-3 shadow-md">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <FaUserTie className="text-white text-lg" />
        </div>
        <div>
          <h2 className="font-semibold text-white">Academic Advisor</h2>
          <p className="text-white/70 text-xs">Typically responds within 24 hours</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <FaCommentDots className="text-5xl mx-auto mb-3 opacity-30" />
            <p>No messages yet</p>
            <p className="text-xs">Send a message to your academic advisor</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isAdvisor = msg.sender === 'Advisor' || msg.senderId === 'advisor' || msg.sender === 'advisor';
            return (
              <div key={msg.id || idx} className={`flex ${isAdvisor ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isAdvisor ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200'}`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isAdvisor ? 'text-purple-200' : 'text-gray-400'}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask your academic advisor a question..."
            className="flex-1 resize-none p-2 text-sm border rounded-xl focus:border-purple-500 focus:outline-none"
            rows={2}
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || sending}
            className="bg-purple-600 text-white px-5 rounded-xl disabled:opacity-50"
          >
            {sending ? <FaSpinner className="animate-spin" size={16} /> : <FaPaperPlane size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvisorMessages;