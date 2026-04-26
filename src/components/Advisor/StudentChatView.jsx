import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { advisorAPI } from '../../services/api';
import MessageList from '../Chat/MessageList';
import MessageInput from '../Chat/MessageInput';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const StudentChatView = () => {
  const { studentId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // جلب المحادثة
  useEffect(() => {
    const fetchConversation = async () => {
      if (!studentId) return;
      
      try {
        const response = await advisorAPI.getStudentConversations(studentId);
        console.log('Conversation response:', response.data);
        
        if (isMounted.current) {
          // تحقق من بنية البيانات
          const messagesData = Array.isArray(response.data) ? response.data : (response.data.messages || []);
          setMessages(messagesData);
          setStudent(response.data.student || response.data);
        }
      } catch (error) {
        console.error('Failed to load conversation:', error);
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

  // ✅ دالة إرسال الرسالة مع تجربة كل التنسيقات
  const handleSendMessage = async (content, type = 'text') => {
    if (!content.trim()) return;
    
    setSending(true);
    
    // قائمة بجميع التنسيقات الممكنة التي قد يتوقعها الـ API
    const possibleFormats = [
      // التنسيق 1: basic
      { content: content, type: type },
      // التنسيق 2: uppercase
      { Content: content, Type: type },
      // التنسيق 3: message
      { message: content, messageType: type },
      // التنسيق 4: text
      { text: content, messageType: type },
      // التنسيق 5: body
      { body: content, type: type },
      // التنسيق 6: with recipient
      { content: content, type: type, recipientId: parseInt(studentId) },
      // التنسيق 7: with receiverId
      { content: content, type: type, receiverId: parseInt(studentId) },
      // التنسيق 8: كما في documentation
      { Message: content, Type: type, StudentId: parseInt(studentId) },
      // التنسيق 9: plain text
      { text: content },
      // التنسيق 10: another format
      { msg: content, msgType: type }
    ];
    
    let success = false;
    let lastError = null;
    
    for (const format of possibleFormats) {
      try {
        console.log('Trying format:', format);
        const response = await advisorAPI.sendMessageToStudent(studentId, format);
        console.log('Success with format:', format);
        console.log('Response:', response.data);
        
        if (isMounted.current) {
          const newMessage = response.data;
          setMessages(prev => [...prev, newMessage]);
        }
        
        toast.success('Message sent');
        success = true;
        break;
      } catch (error) {
        console.log(`Failed with format:`, format, error.response?.status);
        lastError = error;
        continue;
      }
    }
    
    if (!success) {
      console.error('All formats failed. Last error:', lastError);
      console.error('Error response:', lastError?.response?.data);
      
      const errorMessage = lastError?.response?.data?.message || 
                          lastError?.response?.data?.title || 
                          'Failed to send message';
      toast.error(errorMessage);
    }
    
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] bg-white rounded-lg shadow-md flex flex-col">
      <div className="bg-primary-500 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-semibold">
          Chat with {student?.fullName || student?.name || 'Student'}
        </h2>
        <p className="text-sm opacity-90">{student?.email}</p>
      </div>
      
      <div className="flex-1 flex flex-col">
        <MessageList messages={messages} currentUserId={user?.id} />
        <MessageInput onSendMessage={handleSendMessage} sending={sending} />
      </div>
    </div>
  );
};

export default StudentChatView;