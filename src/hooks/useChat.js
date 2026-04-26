import { useState, useEffect } from 'react';
import { chatAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useChat = (conversationId = null) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // تحميل المحادثات
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await chatAPI.getConversations();
        setConversations(response.data);
      } catch {
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []); // مصفوفة فارغة - يتم التنفيذ مرة واحدة فقط

  // تحميل محادثة محددة
  useEffect(() => {
    const loadConversation = async () => {
      if (!conversationId) return;
      
      try {
        const response = await chatAPI.getConversationById(conversationId);
        setCurrentConversation(response.data);
        setMessages(response.data.messages || []);
        
        // تحديث حالة القراءة
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const unreadMessages = response.data.messages?.filter(
          m => !m.isRead && m.receiverId === user?.id
        );
        
        if (unreadMessages?.length) {
          await Promise.all(
            unreadMessages.map(message => chatAPI.markMessageAsRead(message.id))
          );
        }
      } catch {
        toast.error('Failed to load conversation');
      }
    };

    loadConversation();
  }, [conversationId]); // يتغير فقط عندما يتغير conversationId

  // إرسال رسالة
  const sendMessage = async (content, receiverId, type = 'text') => {
    setSending(true);
    try {
      const response = await chatAPI.sendMessage({
        receiverId,
        content,
        type,
        conversationId: currentConversation?.id
      });
      
      setMessages(prev => [...prev, response.data]);
      return response.data;
    } catch {
      toast.error('Failed to send message');
      return null;
    } finally {
      setSending(false);
    }
  };

  // حذف محادثة
  const deleteConversation = async (id) => {
    try {
      await chatAPI.deleteConversation(id);
      setConversations(prev => prev.filter(conv => conv.id !== id));
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
        setMessages([]);
      }
      toast.success('Conversation deleted');
    } catch {
      toast.error('Failed to delete conversation');
    }
  };

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    sending,
    sendMessage,
    deleteConversation
  };
};