import { useEffect, useRef, useState } from 'react'
import { Bot, User, Loader2, Play, Pause } from 'lucide-react'

const MessageList = ({ messages, loading }) => {
  const bottomRef = useRef(null)
  const [playingAudio, setPlayingAudio] = useState(null)
  const audioRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const playAudio = (audioId, audioUrl) => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    
    if (playingAudio === audioId) {
      setPlayingAudio(null)
      return
    }
    
    const audio = new Audio(audioUrl)
    audioRef.current = audio
    audio.play()
    setPlayingAudio(audioId)
    
    audio.onended = () => {
      setPlayingAudio(null)
    }
  }

  if (loading && !messages.length) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
      </div>
    )
  }

  if (!messages.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
          <Bot className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-md font-medium text-gray-700">No messages yet</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-sm">
          Start a conversation with UniGuide AI Assistant.
        </p>
      </div>
    )
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // ✅ دالة لفتح الصورة في تبويب جديد
  const openImage = (imageUrl) => {
    window.open(imageUrl, '_blank')
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {messages.map((msg, idx) => {
        const isUser = msg.role === 'user' || msg.sender === 'Student'
        const isAudio = msg.isAudio === true
        const audioUrl = msg.audioUrl
        const isPlaying = playingAudio === msg.id
        const hasAttachment = msg.attachment || msg.attachmentUrl
        
        return (
          <div key={idx} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-gray-600" />
              </div>
            )}
            <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${isUser ? 'bg-purple-600 text-white' : 'bg-white border border-gray-100'}`}>
              
              {/* ✅ عرض الصورة المرفقة */}
              {hasAttachment && (
                <div className="mb-2">
                  <img 
                    src={msg.attachment || msg.attachmentUrl} 
                    alt={msg.attachmentName || 'Attached image'}
                    className="max-w-full max-h-48 rounded-lg cursor-pointer object-cover hover:opacity-90 transition"
                    onClick={() => openImage(msg.attachment || msg.attachmentUrl)}
                  />
                </div>
              )}
              
              {/* عرض رسالة صوتية مع زر تشغيل */}
              {isAudio && audioUrl ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => playAudio(msg.id, audioUrl)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition ${isUser ? 'bg-purple-500 hover:bg-purple-400' : 'bg-purple-100 hover:bg-purple-200'}`}
                  >
                    {isPlaying ? <Pause className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-purple-600" />}
                  </button>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full bg-purple-500 rounded-full ${isPlaying ? 'animate-pulse' : ''}`} style={{ width: isPlaying ? '100%' : '0%' }} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">Voice message</span>
                </div>
              ) : (
                // عرض النص العادي (لو في نص والصورة مع بعض)
                msg.content && msg.content !== '📎 Sent an image' && msg.content !== '📎 Sent an image' && (
                  <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                )
              )}
              
              {/* ✅ عرض الوقت (للمessages العادية والصور) */}
              {!isAudio && (
                <p className={`text-xs mt-1 ${isUser ? 'text-purple-200' : 'text-gray-400'}`}>
                  {formatTime(msg.timestamp)}
                </p>
              )}
            </div>
            {isUser && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            )}
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}

export default MessageList