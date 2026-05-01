// src/hooks/useChat.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getConversations, 
  getConversation, 
  sendMessage, 
  deleteConversation, 
  archiveConversation,
  sendToAdvisor,
  getAdvisorMessages
} from '../services/api';
import toast from 'react-hot-toast';

export const useChat = () => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [advisorMessages, setAdvisorMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // ✅ useRef عشان نشغل التحميل مرة واحدة فقط
  const hasLoaded = useRef(false);

  // ✅ loadConversations مستقرة (dependencies فاضية)
  const loadConversations = useCallback(async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const response = await getConversations();
      setConversations(response.data || []);
    } catch (err) {
      console.error('Error loading conversations:', err);
      toast.error('فشل في تحميل المحادثات');
    } finally {
      setIsLoading(false);
    }
  }, []); // ✅ empty dependencies

  // ✅ loadConversation مستقرة
  const loadConversation = useCallback(async (id) => {
    try {
      setIsLoading(true);
      const response = await getConversation(id);
      const messagesData = response.data?.messages || response.data || [];
      setMessages(messagesData);
    } catch (err) {
      console.error('Error loading conversation:', err);
      toast.error('فشل في تحميل المحادثة');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ sendNewMessage
  const sendNewMessage = useCallback(async (text, isVoice = false, voiceData = null) => {
    if (!text.trim() && !isVoice) return false;
    
    setIsSending(true);
    try {
      const response = await sendMessage({
        conversationId: currentConversation?.id || null,
        message: text,
        isVoice,
        voiceData
      });
      
      const newMessage = response.data?.message || response.data || {
        id: Date.now(),
        content: text,
        sender: 'User',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      if (!currentConversation) {
        await loadConversations();
      }
      
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('فشل إرسال الرسالة');
      return false;
    } finally {
      setIsSending(false);
    }
  }, [currentConversation, loadConversations]);

  // ✅ sendMessageToAdvisor
  const sendMessageToAdvisor = useCallback(async (message) => {
    try {
      const response = await sendToAdvisor(message);
      toast.success('تم إرسال الرسالة للمشرف');
      return response.data;
    } catch (err) {
      console.error('Error sending to advisor:', err);
      toast.error('فشل إرسال الرسالة للمشرف');
      throw err;
    }
  }, []);

  // ✅ loadAdvisorMessages
  const loadAdvisorMessages = useCallback(async () => {
    try {
      const response = await getAdvisorMessages();
      setAdvisorMessages(response.data || []);
    } catch (err) {
      console.error('Error loading advisor messages:', err);
      toast.error('فشل في تحميل رسائل المشرف');
    }
  }, []);

  // ✅ deleteChat
  const deleteChat = useCallback(async (conversationId) => {
    try {
      await deleteConversation(conversationId);
      toast.success('تم حذف المحادثة');
      await loadConversations();
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      toast.error('فشل حذف المحادثة');
    }
  }, [loadConversations, currentConversation]);

  // ✅ archiveChat
  const archiveChat = useCallback(async (conversationId) => {
    try {
      await archiveConversation(conversationId);
      toast.success('تم أرشفة المحادثة');
      await loadConversations();
    } catch (err) {
      console.error('Error archiving conversation:', err);
      toast.error('فشل أرشفة المحادثة');
    }
  }, [loadConversations]);

  // ✅ createNewChat
  const createNewChat = useCallback(() => {
    setCurrentConversation(null);
    setMessages([]);
  }, []);

  // ✅ selectConversation
  const selectConversation = useCallback(async (conversation) => {
    setCurrentConversation(conversation);
    await loadConversation(conversation.id);
  }, [loadConversation]);

  // ✅ useEffect الآمن 100% - بيشتغل مرة واحدة بس
  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadConversations();
    }
  }, [loadConversations]);

  return {
    conversations,
    currentConversation,
    messages,
    advisorMessages,
    isLoading,
    isSending,
    sendMessage: sendNewMessage,
    sendMessageToAdvisor,
    loadAdvisorMessages,
    deleteChat,
    archiveChat,
    createNewChat,
    selectConversation,
    loadConversations,
    loadConversation,
  };
};