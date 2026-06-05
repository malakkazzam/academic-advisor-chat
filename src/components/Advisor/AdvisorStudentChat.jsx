import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { chatApi } from '../../lib/api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const AdvisorStudentChat = () => {
  const { id } = useParams()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState('')

  const fetchMessages = async () => {
    if (!id) return

    try {
      const res = await chatApi.getAdvisorStudentConversation(id)

      const msgs =
        res.data?.messages || (Array.isArray(res.data) ? res.data : [])

      setMessages(msgs)
    } catch {
      toast.error('Failed to load conversation')
    }
  }

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true)

      await fetchMessages()

      setLoading(false)
    }

    loadMessages()
  }, [id])

  const handleSend = async () => {
    if (!input.trim()) return

    setSending(true)

    try {
      await chatApi.replyToStudent(id, input)

      setInput('')

      await fetchMessages()

      toast.success('Reply sent')
    } catch {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-10 w-10 text-purple-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[70vh] bg-white rounded-xl shadow-md border border-gray-100">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No messages yet. Start the conversation.
          </div>
        )}

        {messages.map((msg, idx) => {
          const isStudent =
            msg.sender === 'Student' || msg.role === 'user'

          return (
            <div
              key={idx}
              className={`flex ${
                isStudent ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                  isStudent
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">
                  {msg.content}
                </p>

                <span className="text-xs opacity-70 mt-1 block">
                  {msg.timestamp
                    ? new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div className="border-t p-3 flex gap-2 bg-gray-50 rounded-b-xl">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your reply..."
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />

        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="bg-purple-600 text-white px-5 py-2 rounded-full hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center"
        >
          {sending ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            'Send'
          )}
        </button>
      </div>
    </div>
  )
}

export default AdvisorStudentChat