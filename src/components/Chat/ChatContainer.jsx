import { useState, useEffect, useCallback, useRef } from 'react'
import { useChat } from '../../hooks/useChat'
import { useAuth } from '../../hooks/useAuth'
import { chatApi } from '../../lib/api'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { Bot, UserCog, PlusCircle, Trash2, Eraser, Pin, PinOff, Menu, X, MessageSquare, Lock } from 'lucide-react'
import { toast } from 'sonner'

const ChatContainer = () => {
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [chatType, setChatType] = useState('ai')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [readOnlyChat, setReadOnlyChat] = useState(null)
  const [readOnlyMessages, setReadOnlyMessages] = useState([])
  
  const isFetchingRef = useRef(false)

  const { 
    messages, 
    conversations, 
    loading, 
    isSending, 
    sendMessage, 
    sendToAdvisorOnly,
    fetchConversations,
    deleteConversation,
    clearCurrentChat,
    pinConversation,
    unpinConversation,
    isConversationPinned,
  } = useChat(selectedConversation, chatType)

  const fetchReadOnlyMessages = async (convId) => {
    try {
      const res = await chatApi.getConversation(convId)
      const msgs = res.data?.messages || (Array.isArray(res.data) ? res.data : [])
      setReadOnlyMessages(msgs)
    } catch {
      setReadOnlyMessages([])
    }
  }

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setSidebarOpen(true)
      else setSidebarOpen(false)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const loadConversations = useCallback(async () => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    try {
      await fetchConversations()
    } finally {
      setTimeout(() => {
        isFetchingRef.current = false
      }, 1000)
    }
  }, [fetchConversations])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isFetchingRef.current) {
        loadConversations()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [loadConversations])

  const handleSendMessage = async (content) => {
    if (readOnlyChat) {
      toast.error('This conversation is read-only. You cannot send messages here.')
      return
    }
    if (chatType === 'ai') {
      const result = await sendMessage(content)
      if (result?.newConversationId) {
        setSelectedConversation(result.newConversationId)
        if (isMobile) setSidebarOpen(false)
      }
    } else {
      await sendToAdvisorOnly(content)
    }
    setTimeout(() => loadConversations(), 500)
  }

  const handleNewChat = () => {
    setSelectedConversation(null)
    setChatType('ai')
    setReadOnlyChat(null)
    setReadOnlyMessages([])
    if (isMobile) setSidebarOpen(false)
    toast.success('New conversation started', { icon: '✨', duration: 2000 })
    setTimeout(() => loadConversations(), 500)
  }

  const handleClearChat = async () => {
    if (!selectedConversation) {
      toast.error('No active conversation to clear')
      return
    }
    if (window.confirm('Clear all messages in this conversation? This cannot be undone.')) {
      try {
        await clearCurrentChat()
        toast.success('Chat cleared', { icon: '🧹', duration: 2000 })
      } catch {
        toast.error('Failed to clear chat')
      }
    }
    await loadConversations()
    if (isMobile) setSidebarOpen(false)
  }

  const handleDeleteConversation = async (convId, convTitle) => {
    setShowDeleteConfirm(convId)
    try {
      await deleteConversation(convId)
      toast.success(`Conversation "${convTitle || 'Untitled'}" deleted`, { icon: '✅', duration: 2000 })
      if (selectedConversation === convId) {
        setSelectedConversation(null)
        setChatType('ai')
        setReadOnlyChat(null)
      }
      await loadConversations()
    } catch {
      toast.error('Failed to delete conversation')
    } finally {
      setShowDeleteConfirm(null)
    }
  }

  const handlePinToggle = async (convId, e) => {
    e.stopPropagation()
    if (isConversationPinned(convId)) {
      unpinConversation(convId)
      toast.success('Conversation unpinned', { icon: '📌', duration: 1000 })
    } else {
      pinConversation(convId)
      toast.success('Conversation pinned', { icon: '📌', duration: 1000 })
    }
    await loadConversations()
  }

  const handleAdvisorChatClick = () => {
    setChatType('advisor')
    setSelectedConversation(null)
    setReadOnlyChat(null)
    setReadOnlyMessages([])
    if (isMobile) setSidebarOpen(false)
    toast.info('Chatting with your academic advisor', { icon: '👨‍🏫', duration: 2000 })
  }

  const handleReadOnlyConversation = async (conv) => {
    setReadOnlyChat(conv)
    setSelectedConversation(null)
    setChatType('readonly')
    await fetchReadOnlyMessages(conv.id)
    if (isMobile) setSidebarOpen(false)
    toast.info('Viewing conversation (read-only mode)', { icon: '🔒', duration: 2000 })
  }

  const handleSelectConversation = (convId) => {
    setSelectedConversation(convId)
    setChatType('ai')
    setReadOnlyChat(null)
    setReadOnlyMessages([])
    if (isMobile) setSidebarOpen(false)
  }

  const formatRelativeDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    const now = new Date()
    const diff = Math.floor((now - d) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    if (diff < 7) return `${diff}d ago`
    return d.toLocaleDateString()
  }

  const regularConversations = (conversations || []).filter(conv => 
    conv && !conv.title?.toLowerCase().includes('advisor')
  )
  
  const advisorConversations = (conversations || []).filter(conv => 
    conv && conv.title?.toLowerCase().includes('advisor')
  )

  const sortedAllConversations = [...regularConversations].sort((a, b) => {
    const aPinned = isConversationPinned(a?.id)
    const bPinned = isConversationPinned(b?.id)
    if (aPinned && !bPinned) return -1
    if (!aPinned && bPinned) return 1
    return new Date(b?.updatedAt) - new Date(a?.updatedAt)
  })

  const pinnedCount = sortedAllConversations.filter(c => isConversationPinned(c?.id)).length

  const displayMessages = readOnlyChat ? readOnlyMessages : messages
  const isReadOnlyMode = readOnlyChat !== null

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <div className="flex h-[calc(100vh-73px)] gap-3 md:gap-4 relative bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-100">
      {/* ✅ الشريط الجانبي */}
      <div className={`
        fixed md:relative top-0 left-0 z-40 h-full bg-white rounded-r-xl shadow-xl border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        w-80
        md:translate-x-0 md:rounded-none md:shadow-md
      `}>
        {sidebarOpen && (
          <>
            <div className="p-3 border-b flex justify-between items-center">
              <h2 className="font-semibold text-gray-700">History</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleNewChat}
                  className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600 transition"
                  title="New Chat"
                >
                  <PlusCircle size={18} />
                </button>
                {isMobile && (
                  <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

           <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              {/* Advisor Section */}
              <div className="space-y-1">
                <div className="px-2 pt-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Advisor
                </div>
                {advisorConversations.length > 0 ? (
                  advisorConversations.map(conv => (
                    <button
                      key={conv?.id}
                      onClick={() => {
                        handleAdvisorChatClick()
                        if (isMobile) toggleSidebar()
                      }}
                      className="w-full text-left p-2 rounded-lg transition-all hover:bg-purple-50 flex items-center gap-2"
                    >
                      <UserCog size={18} className="text-purple-500" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-sm">{conv?.title || 'Academic Advisor'}</span>
                          <span className="text-xs text-gray-400">{formatRelativeDate(conv?.updatedAt)}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{conv?.lastMessage || 'No messages yet'}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <button
                    onClick={() => {
                      handleAdvisorChatClick()
                      if (isMobile) toggleSidebar()
                    }}
                    className="w-full text-left p-2 rounded-lg transition-all hover:bg-purple-50 flex items-center gap-2 border border-purple-100"
                  >
                    <UserCog size={18} className="text-purple-500" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">Academic Advisor</span>
                        <span className="text-xs text-gray-400">Start chatting</span>
                      </div>
                      <p className="text-xs text-gray-500">Message your academic advisor</p>
                    </div>
                  </button>
                )}
              </div>

              {/* Chat History Section */}
              <div className="space-y-1 mt-4">
                <div className="px-2 pt-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Chat History
                </div>
                {pinnedCount > 0 && (
                  <div className="px-2 text-xs text-gray-400 flex items-center gap-1">
                    <Pin size={12} /> Pinned ({pinnedCount}/3)
                  </div>
                )}
                {sortedAllConversations.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-8">
                    <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                    <button onClick={handleNewChat} className="block mx-auto mt-3 text-purple-600 text-sm hover:underline">
                      Start a new chat →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {sortedAllConversations.map((conv) => {
                      const isPinned = isConversationPinned(conv?.id)
                      const title = conv?.title || ''
                      const isReadOnly = title.includes('محادثة مع المشرف الأكاديمي') || 
                                         title.includes('إعلان من المشرف') ||
                                         title.toLowerCase().includes('advisor') ||
                                         title.toLowerCase().includes('announcement')
                      
                      return (
                        <div key={conv?.id} className="group relative">
                          <button
                            onClick={() => {
                              if (isReadOnly) {
                                handleReadOnlyConversation(conv)
                              } else {
                                handleSelectConversation(conv?.id)
                              }
                              if (isMobile) toggleSidebar()
                            }}
                            className={`w-full text-left p-2 rounded-lg transition-all ${
                              (selectedConversation === conv?.id || readOnlyChat?.id === conv?.id)
                                ? 'bg-purple-100 border-l-4 border-purple-600' 
                                : isReadOnly 
                                  ? 'hover:bg-gray-100 border border-gray-200' 
                                  : 'hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-sm truncate flex-1 flex items-center gap-1">
                                {isPinned && <Pin size={12} className="text-purple-500 shrink-0" />}
                                {conv?.title || `Chat ${conv?.id}`}
                                {isReadOnly && <Lock size={12} className="text-gray-400 shrink-0 ml-1" />}
                              </span>
                              <span className="text-xs text-gray-400 ml-2 shrink-0">
                                {formatRelativeDate(conv?.updatedAt)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-1 pr-6">
                              {conv?.lastMessage || 'No messages yet'}
                            </p>
                          </button>
                          
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePinToggle(conv?.id, e)
                              }}
                              className={`p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition bg-white shadow-sm ${isPinned ? 'text-purple-600' : 'text-gray-400 hover:text-purple-600'}`}
                              title={isPinned ? 'Unpin' : 'Pin'}
                            >
                              {isPinned ? <Pin size={14} /> : <PinOff size={14} />}
                            </button>
                            <button
                              onClick={() => handleDeleteConversation(conv?.id, conv?.title)}
                              disabled={showDeleteConfirm === conv?.id}
                              className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 shadow-sm"
                              title="Delete conversation"
                            >
                              {showDeleteConfirm === conv?.id ? (
                                <div className="animate-spin h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* خلفية داكنة عند فتح السايدبار على الموبايل */}
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={toggleSidebar} />
      )}

      {/* منطقة الدردشة الرئيسية */}
      <div className="flex-1 bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-100 rounded-xl shadow-md border flex flex-col min-w-0">
        {/* ✅ رأس الشات مع زر القائمة في مكانه الصحيح */}
        <div className="p-3 md:p-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-3">
              {isMobile && !sidebarOpen && (
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-white/20 text-white transition"
                >
                  <Menu size={20} />
                </button>
              )}
              {isReadOnlyMode ? (
                <Lock className="h-5 w-5 md:h-6 md:w-6 text-white" />
              ) : chatType === 'ai' ? (
                <Bot className="h-5 w-5 md:h-6 md:w-6 text-white" />
              ) : (
                <UserCog className="h-5 w-5 md:h-6 md:w-6 text-white" />
              )}
              <div className="min-w-0">
                <h3 className="font-semibold text-white text-sm md:text-base truncate">
                  {isReadOnlyMode 
                    ? `🔒 ${readOnlyChat?.title || 'Conversation'} (Read Only)`
                    : chatType === 'ai' 
                      ? 'UniGuide AI Assistant' 
                      : 'Academic Advisor'}
                </h3>
                <p className="text-xs text-purple-200 truncate hidden sm:block">
                  {isReadOnlyMode 
                    ? 'You can only view this conversation'
                    : chatType === 'ai' 
                      ? `Logged in as ${user?.fullName || user?.email?.split('@')[0] || 'User'}`
                      : 'Direct messaging with your academic advisor'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              {!isReadOnlyMode && (
                <button onClick={handleNewChat} className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition text-xs md:text-sm">
                  <PlusCircle size={14} className="md:h-4 md:w-4" />
                  <span className="hidden sm:inline">New</span>
                </button>
              )}
              {!isReadOnlyMode && selectedConversation && messages.length > 0 && chatType === 'ai' && (
                <button onClick={handleClearChat} className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 bg-amber-500/80 hover:bg-amber-600 text-white rounded-lg transition text-xs md:text-sm">
                  <Eraser size={14} className="md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <MessageList messages={displayMessages} loading={loading || isSending} chatType={isReadOnlyMode ? 'readonly' : chatType} />
        
        {!isReadOnlyMode ? (
          <MessageInput 
            onSend={handleSendMessage} 
            disabled={loading || isSending} 
            placeholder={chatType === 'ai' ? 'Ask UniGuide AI...' : 'Message your academic advisor...'} 
          />
        ) : (
          <div className="p-3 text-center text-gray-500 text-sm border-t border-gray-200 bg-white/50">
            <Lock size={14} className="inline mr-1" /> This conversation is read-only. You cannot send messages here.
          </div>
        )}
      </div>
    </div>
  )
}
export default ChatContainer