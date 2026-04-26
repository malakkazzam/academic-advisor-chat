// src/components/Chat/AIChatAssistant.jsx
import  { useState, useEffect, useRef, useCallback } from 'react';
import { chatAPI } from '../../services/api';
import { 
  FaRobot, 
  FaPaperPlane, 
  FaTrash, 
  FaRegCopy, 
  FaThumbsUp, 
  FaThumbsDown,
  FaSpinner,
  FaHistory,
  FaChevronLeft,
  
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import VoiceRecorder from './VoiceRecorder';

const AIChatAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: "🤖 **Welcome to AI Academic Assistant!**\n\nI'm here to help you with:\n• 📚 Course selection and recommendations\n• 📅 Registration deadlines and procedures\n• 📋 Academic policies and regulations\n• 💡 Study tips and success strategies\n• 🎯 Career guidance and internships\n\n**How can I help you today?**",
      timestamp: new Date(),
      feedback: null
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [audioMessage, setAudioMessage] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const checkConnectionRef = useRef(false);
  const messageIdCounter = useRef(1);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Check API connection
  useEffect(() => {
    if (!checkConnectionRef.current) {
      checkConnectionRef.current = true;
      const checkConnection = async () => {
        try {
          const response = await chatAPI.getConversations();
          if (response.status === 200) {
            setIsConnected(true);
          }
        } catch {
          setIsConnected(false);
          console.warn('Chat API connection issue');
        }
      };
      checkConnection();
    }
  }, []);

  // Fetch conversations from API
  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoadingHistory(true);
      try {
        const response = await chatAPI.getConversations();
        console.log('Fetched conversations:', response.data);
        
        const formattedConversations = (response.data || []).map(conv => ({
          id: conv.id,
          title: conv.title || `Conversation ${conv.id}`,
          lastMessage: conv.lastMessage || conv.lastMessageContent || 'No messages',
          date: conv.updatedAt || conv.createdAt || new Date().toISOString(),
          preview: conv.preview || (conv.lastMessageContent ? conv.lastMessageContent.substring(0, 50) : 'No messages')
        }));
        
        setConversations(formattedConversations);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    fetchConversations();
  }, []);

  const generateId = () => {
    messageIdCounter.current += 1;
    return `msg-${Date.now()}-${messageIdCounter.current}`;
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && !audioMessage) || isLoading) return;

    let messageContent = inputMessage;
    
    if (audioMessage) {
      messageContent = inputMessage || "[Voice message]";
      console.log('Sending with audio:', audioMessage);
      setAudioMessage(null);
    }
    
    if (!messageContent.trim()) return;

    const userMessage = {
      id: generateId(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
      feedback: null
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = messageContent;
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await chatAPI.sendMessage({
        content: currentMessage,
        type: audioMessage ? 'audio' : 'text'
      });
      
      console.log('Response from backend:', response.data);
      
      const aiResponse = response.data?.message || 
                         response.data?.response || 
                         response.data?.content ||
                         response.data?.reply ||
                         "Thank you for your message. I'll respond shortly.";
      
      const aiMessage = {
        id: generateId(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        feedback: null,
        messageId: response.data?.id
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      const convResponse = await chatAPI.getConversations();
      const formattedConversations = (convResponse.data || []).map(conv => ({
        id: conv.id,
        title: conv.title || `Conversation ${conv.id}`,
        lastMessage: conv.lastMessage || conv.lastMessageContent || currentMessage.substring(0, 30),
        date: conv.updatedAt || conv.createdAt || new Date().toISOString(),
        preview: conv.preview || currentMessage.substring(0, 50)
      }));
      setConversations(formattedConversations);
      
    } catch {
      console.error('Error sending message');
      
      let errorText = "⚠️ **Connection error occurred.**\n\nPlease try again.";
      
      const errorMessage = {
        id: generateId(),
        role: 'assistant',
        content: errorText,
        timestamp: new Date(),
        feedback: null
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleVoiceRecordingComplete = (audioBlob) => {
    console.log('Recording completed:', audioBlob);
    setAudioMessage(audioBlob);
    toast.success('Voice message recorded! Click send to share.');
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the conversation?')) {
      setMessages([
        {
          id: 'welcome-new',
          role: 'assistant',
          content: "✨ **Chat cleared.**\n\nHow can I help you today?",
          timestamp: new Date(),
          feedback: null
        }
      ]);
      toast.success('Chat cleared');
    }
  };

  const loadConversation = async (conversation) => {
    setActiveConversation(conversation.id);
    setIsLoadingHistory(true);
    
    try {
      const response = await chatAPI.getConversationById(conversation.id);
      console.log('Loaded conversation:', response.data);
      
      const loadedMessages = (response.data.messages || []).map(msg => ({
        id: msg.id,
        role: msg.senderId === 'user' ? 'user' : 'assistant',
        content: msg.content,
        timestamp: new Date(msg.createdAt),
        feedback: null
      }));
      
      if (loadedMessages.length > 0) {
        setMessages(loadedMessages);
      } else {
        toast.info('No messages in this conversation');
      }
      
      setShowHistory(false);
      toast.success(`Loaded: ${conversation.title}`);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    
    if (window.confirm('Delete this conversation?')) {
      try {
        await chatAPI.deleteConversation(conversationId);
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        
        if (activeConversation === conversationId) {
          setMessages([
            {
              id: 'welcome-new',
              role: 'assistant',
              content: "✨ **Chat cleared.**\n\nHow can I help you today?",
              timestamp: new Date(),
              feedback: null
            }
          ]);
          setActiveConversation(null);
        }
        
        toast.success('Conversation deleted');
      } catch {
        toast.error('Failed to delete conversation');
      }
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  const giveFeedback = async (messageId, type) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback: type } : msg
    ));
    toast.success(`Thank you for your feedback!`);
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const suggestedQuestions = [
    { text: "Tell me about available courses", icon: "📚" },
    { text: "What are the registration deadlines?", icon: "📅" },
    { text: "How can I improve my grades?", icon: "📊" },
    { text: "Tell me about scholarships", icon: "💰" },
    { text: "What are the academic policies?", icon: "📋" },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      
      {/* Chat History Sidebar - Monitored to the left like original */}
      <div className={`
        fixed lg:relative 
        ${showHistory ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0
        lg:w-80
        w-72
        bg-white 
        border-r border-gray-200 
        transition-transform duration-300 
        flex flex-col
        shadow-xl
        z-30
        h-full
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaHistory className="text-primary-500" />
              <h2 className="font-semibold text-gray-800">Chat History</h2>
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="p-1 text-gray-400 hover:text-gray-600 lg:hidden"
            >
              <FaChevronLeft size={18} />
            </button>
          </div>
        </div>
        
        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-3">
          {isLoadingHistory && conversations.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FaHistory className="mx-auto text-3xl mb-2 opacity-30" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new chat!</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => loadConversation(conv)}
                className={`group relative p-3 mb-2 rounded-lg cursor-pointer transition-all ${
                  activeConversation === conv.id
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-800 text-sm truncate flex-1">
                    {conv.title}
                  </h3>
                  <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                    {formatDate(conv.date)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{conv.preview}</p>
                <p className="text-xs text-gray-400 mt-1 truncate">{conv.lastMessage}</p>
                
                <button
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500 rounded"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))
          )}
        </div>
        
        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Background overlay for mobile */}
      {showHistory && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setShowHistory(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Menu button for mobile */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <FaHistory className="text-gray-600" size={18} />
            </button>
            
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
              <FaRobot className="text-white text-base sm:text-xl" />
            </div>
            
           <div>
  <h1 className="font-semibold text-gray-800 text-sm sm:text-base">
    AI Academic Advisor
  </h1>
  <p className="text-xs flex items-center gap-1">
    {isConnected ? (
      <span className="flex items-center gap-1 text-green-500">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        Online • Ready
      </span>
    ) : (
      <span className="flex items-center gap-1 text-yellow-500">
        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
        Connecting...
      </span>
    )}
  </p>
</div>
          </div>
          
          <button
            onClick={clearChat}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="New chat"
          >
            <FaTrash size={16} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div className={`flex gap-2 max-w-[85%] sm:max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                    <FaRobot size={14} className="text-white" />
                  </div>
                )}
                <div className="relative group">
                  <div className={`px-4 py-2 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                    <div className={`text-[10px] mt-1 ${
                      message.role === 'user' ? 'text-primary-100' : 'text-gray-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                  {message.role === 'assistant' && (
                    <div className="absolute -bottom-6 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white rounded-lg shadow-sm p-1">
                      <button onClick={() => copyMessage(message.content)} className="p-1 text-gray-400 hover:text-primary-500">
                        <FaRegCopy size={11} />
                      </button>
                      <button onClick={() => giveFeedback(message.id, 'like')} className="p-1 text-gray-400 hover:text-green-500">
                        <FaThumbsUp size={11} />
                      </button>
                      <button onClick={() => giveFeedback(message.id, 'dislike')} className="p-1 text-gray-400 hover:text-red-500">
                        <FaThumbsDown size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                  <FaRobot size={14} className="text-white" />
                </div>
                <div className="bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-200">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <VoiceRecorder onRecordingComplete={handleVoiceRecordingComplete} />
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="w-full input-field resize-none py-2 px-3 text-sm"
                rows={1}
                disabled={isLoading}
                style={{ minHeight: '40px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={(!inputMessage.trim() && !audioMessage) || isLoading}
              className="bg-primary-500 text-white px-4 rounded-lg hover:bg-primary-600 transition-all disabled:opacity-50"
            >
              {isLoading ? <FaSpinner className="animate-spin" size={18} /> : <FaPaperPlane size={18} />}
            </button>
          </div>
          
          {audioMessage && (
            <div className="mt-2 text-sm text-green-600 bg-green-50 rounded-lg p-2">
              🎤 Voice message recorded. Click send to share.
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mt-3">
            {suggestedQuestions.map((q, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(q.text)}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
              >
                {q.icon} {q.text}
              </button>
            ))}
          </div>
          
          <p className="text-center text-xs text-gray-400 mt-3">
            AI Advisor • Available 24/7 • Powered by advanced academic intelligence
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChatAssistant;