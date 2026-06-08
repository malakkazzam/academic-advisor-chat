import { useState, useRef } from 'react'
import { Send, Paperclip, Image, X, Loader2 } from 'lucide-react'
import VoiceRecorder from './VoiceRecorder'
import { toast } from 'sonner'

const MessageInput = ({ onSend, disabled, placeholder }) => {
  const [message, setMessage] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (attachment && !disabled && !isUploading) {
      setIsUploading(true)
      onSend(message, attachment)
      setMessage('')
      setAttachment(null)
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    
    if (message.trim() && !disabled) {
      onSend(message.trim(), null)
      setMessage('')
    }
  }

  const handleVoiceRecorded = (audioData) => {
    if (!disabled) {
      onSend({
        type: 'audio',
        audioUrl: audioData.url,
        audioId: audioData.id,
        content: '[Voice message]'
      }, null)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select an image file (JPEG, PNG, GIF, WEBP)')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }
    
    setAttachment(file)
  }

  const removeAttachment = () => {
    setAttachment(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="border-t p-3 bg-white rounded-b-xl">
      {attachment && (
        <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image size={20} className="text-purple-500" />
            <span className="text-sm text-gray-600 truncate max-w-[200px]">{attachment.name}</span>
            <span className="text-xs text-gray-400">
              {(attachment.size / 1024).toFixed(1)} KB
            </span>
          </div>
          <button
            type="button"
            onClick={removeAttachment}
            className="p-1 rounded-full hover:bg-gray-200 transition"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/jpeg,image/png,image/gif,image/webp,image/jpg"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="p-2 rounded-full text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition disabled:opacity-50"
          title="Attach image"
        >
          <Paperclip size={20} />
        </button>
        
        <VoiceRecorder onRecordingComplete={handleVoiceRecorded} />
        
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder || 'Type your message...'}
          disabled={disabled || isUploading}
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
        />
        
        <button
          type="submit"
          disabled={disabled || (!message.trim() && !attachment) || isUploading}
          className={`p-2 rounded-full transition flex items-center justify-center ${
            (!message.trim() && !attachment) || disabled || isUploading
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  )
}

export default MessageInput