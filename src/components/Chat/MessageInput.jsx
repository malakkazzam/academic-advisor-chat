import { useState } from 'react'
import { Send } from 'lucide-react'
import VoiceRecorder from './VoiceRecorder'

const MessageInput = ({ onSend, disabled, placeholder }) => {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleVoiceRecorded = (audioData) => {
    if (!disabled) {
      // ✅ إرسال البيانات الصوتية بدلاً من النص
      onSend({
        type: 'audio',
        audioUrl: audioData.url,
        audioId: audioData.id,
        content: '[Voice message]'
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t p-3 flex gap-2 bg-white rounded-b-xl">
      <VoiceRecorder onRecordingComplete={handleVoiceRecorded} />
      
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder || 'Type your message...'}
        disabled={disabled}
        className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
      
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="h-5 w-5" />
      </button>
    </form>
  )
}

export default MessageInput