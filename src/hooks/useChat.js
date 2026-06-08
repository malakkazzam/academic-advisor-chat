import { useState, useEffect, useCallback, useRef } from 'react'
import { chatApi } from '../lib/api'
import { toast } from 'sonner'

export const useChat = (conversationId = null, chatType = 'ai') => {
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const isFetchingRef = useRef(false)
  const abortControllerRef = useRef(null)
  const isMounted = useRef(true)

  // جديد - للبحث
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  // eslint-disable-next-line no-unused-vars
  const [pinnedConversations, setPinnedConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('pinnedConversations')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const fetchConversations = useCallback(async () => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    if (abortControllerRef.current) abortControllerRef.current.abort()
    abortControllerRef.current = new AbortController()
    try {
      const res = await chatApi.getConversations({ signal: abortControllerRef.current.signal })
      let all = Array.isArray(res.data) ? res.data : (res.data?.data || [])
      setConversations(all)
    } catch {
      setConversations([])
    } finally {
      isFetchingRef.current = false
    }
  }, [])

  const fetchMessages = useCallback(async (id) => {
    if (!id) return
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    setLoading(true)
    try {
      const res = await chatApi.getConversation(id)
      const msgs = res.data?.messages || (Array.isArray(res.data) ? res.data : [])
      if (isMounted.current) setMessages(msgs)
    } catch {
      if (isMounted.current) setMessages([])
    } finally {
      if (isMounted.current) setLoading(false)
      isFetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('pinnedConversations', JSON.stringify(pinnedConversations))
    }, 0)
    return () => clearTimeout(timer)
  }, [pinnedConversations])

  const pinConversation = useCallback((convId) => {
    setPinnedConversations(prev => {
      if (prev.includes(convId)) return prev
      if (prev.length >= 3) {
        toast.error('You can only pin up to 3 conversations', { duration: 2000 })
        return prev
      }
      return [...prev, convId]
    })
  }, [])

  const unpinConversation = useCallback((convId) => {
    setPinnedConversations(prev => prev.filter(id => id !== convId))
  }, [])

  const isConversationPinned = useCallback((convId) => {
    return pinnedConversations.includes(convId)
  }, [pinnedConversations])

  const deleteConversation = useCallback(async (id) => {
    await chatApi.deleteConversation(id)
    await fetchConversations()
    if (pinnedConversations.includes(id)) {
      unpinConversation(id)
    }
  }, [fetchConversations, pinnedConversations, unpinConversation])

  const clearCurrentChat = useCallback(() => {
    if (!conversationId) return
    setMessages([])
  }, [conversationId])

  // ✅ جديد - أرشفة محادثة
  const archiveConversation = useCallback(async (id) => {
    try {
      await chatApi.archiveConversation(id)
      await fetchConversations()
      toast.success('Conversation archived')
    } catch (error) {
      console.error('Archive error:', error)
      toast.error('Failed to archive conversation')
    }
  }, [fetchConversations])

  // ✅ جديد - تعليم رسالة كمقروءة
  const markMessageAsRead = useCallback(async (messageId) => {
    try {
      await chatApi.markMessageAsRead(messageId)
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }, [])

  // ✅ جديد - البحث في الرسائل
  const searchMessages = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return []
    }
    
    setSearching(true)
    try {
      const res = await chatApi.searchMessages(query)
      const results = res.data || []
      setSearchResults(results)
      return results
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Failed to search messages')
      return []
    } finally {
      setSearching(false)
    }
  }, [])

  // ✅ جديد - مسح نتائج البحث
  const clearSearch = useCallback(() => {
    setSearchResults([])
  }, [])

  // ✅ إرسال رسالة إلى الـ AI (باستخدام fetch مع معالجة أفضل للرد)
  const sendMessage = async (content, attachmentFile = null) => {
    // حالة الصوت
    if (typeof content === 'object' && content.type === 'audio') {
      const audioMessage = {
        id: content.audioId,
        role: 'user',
        content: content.content,
        timestamp: new Date().toISOString(),
        isAudio: true,
        audioUrl: content.audioUrl
      }
      setMessages(prev => [...prev, audioMessage])
      setIsSending(false)
      setLoading(false)
      return
    }

    // لو مفيش نص ولا صورة
    if ((!content?.trim() && !attachmentFile) || isSending) return

    setIsSending(true)
    setLoading(true)

    // معاينة الصورة
    const imagePreviewUrl = attachmentFile ? URL.createObjectURL(attachmentFile) : null

    // ✅ تحديد نص الرسالة: إذا كان النص فارغاً ويوجد صورة، أرسل نصاً افتراضياً
    const messageText = content?.trim() || (attachmentFile ? '📎 أرسلت صورة' : '')

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
      attachment: imagePreviewUrl,
      attachmentName: attachmentFile?.name,
    }

    const typingMessage = {
      id: `typing-${Date.now()}`,
      role: 'assistant',
      content: '',
      isTyping: true,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage, typingMessage])

    try {
      const formData = new FormData()
      // ✅ إرسال النص (مضمون أنه غير فارغ)
      formData.append('Message', messageText)
      formData.append('ConversationId', conversationId || '')
      
      if (attachmentFile) {
        formData.append('Attachment', attachmentFile)
      }

      const token = localStorage.getItem('token')
      const response = await fetch('/api/Chat/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      // معالجة الرد بشكل آمن
      let data = null
      let responseText = null
      
      try {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          data = await response.json()
        } else {
          responseText = await response.text()
          console.log('Response text:', responseText)
        }
      } catch {
        responseText = await response.text()
        console.warn('Could not parse response as JSON:', responseText)
      }

      if (!response.ok) {
        const errorMsg = data?.message || responseText || `فشل الإرسال (${response.status})`
        throw new Error(errorMsg)
      }

      let aiContent = null
      let aiSender = 'assistant'

      if (data && typeof data === 'object') {
        if (data.content) {
          aiContent = data.content
          if (data.sender === 'Bot') aiSender = 'assistant'
          else if (data.sender) aiSender = data.sender.toLowerCase()
        } else if (data.assistantMessage) {
          aiContent = data.assistantMessage.content || data.assistantMessage
        } else if (data.message) {
          aiContent = data.message
        } else if (data.response) {
          aiContent = data.response
        }
      } else if (responseText && response.ok) {
        aiContent = "✓ Your message has been sent successfully."
      }

      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isTyping)
        if (!aiContent) {
          aiContent = "I'm processing your request. Please wait a moment."
        }
        const aiMessage = {
          id: data?.id || `ai-${Date.now()}`,
          role: aiSender,
          content: aiContent,
          timestamp: data?.timestamp || new Date().toISOString()
        }
        return [...filtered, aiMessage]
      })

      if (!conversationId && data?.conversationId) {
        setTimeout(() => fetchConversations(), 500)
      }
    } catch (error) {
      console.error('Send message error:', error)
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isTyping)
        return [...filtered, {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: error.message || '⚠️ Sorry, I encountered an error. Please try again later.',
          timestamp: new Date().toISOString(),
          isError: true
        }]
      })
      toast.error(error.message || 'Failed to send message')
    } finally {
      setIsSending(false)
      setLoading(false)
    }
  }

  // إرسال رسالة إلى المستشار الأكاديمي
  const sendToAdvisorOnly = async (content) => {
    if (!content.trim() || isSending) return

    setIsSending(true)
    setLoading(true)

    const userMessage = {
      id: `advisor-user-${Date.now()}`,
      role: 'user',
      content: content,
      timestamp: new Date().toISOString(),
      isAdvisorMessage: true
    }

    setMessages(prev => [...prev, userMessage])

    try {
      const res = await chatApi.sendToAdvisor(content)
      console.log('API response (ignored):', res.data)
      
      setMessages(prev => [...prev, {
        id: `advisor-confirm-${Date.now()}`,
        role: 'assistant',
        content: '✓ Your message has been sent to your academic advisor.',
        timestamp: new Date().toISOString(),
        isAdvisorResponse: true
      }])
      
      setTimeout(() => fetchConversations(), 500)
    } catch (error) {
      console.error('Send to advisor error:', error)
      toast.error('Failed to send message to advisor')
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id))
    } finally {
      setIsSending(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    isMounted.current = true
    const timeoutId = setTimeout(() => {
      if (isMounted.current) fetchConversations()
    }, 300)
    return () => {
      isMounted.current = false
      clearTimeout(timeoutId)
    }
  }, [chatType, fetchConversations])

  useEffect(() => {
    let timeoutId
    if (conversationId) {
      timeoutId = setTimeout(() => {
        if (isMounted.current) fetchMessages(conversationId)
      }, 100)
    } else {
      timeoutId = setTimeout(() => {
        if (isMounted.current) setMessages([])
      }, 100)
    }
    return () => clearTimeout(timeoutId)
  }, [conversationId, fetchMessages])

  return {
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
    pinnedConversations,
    searchMessages,
    clearSearch,
    searchResults,
    searching,
    archiveConversation,
    markMessageAsRead
  }
}