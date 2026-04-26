// src/components/Chat/MessageInput.jsx
import  { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaMicrophone, FaSmile, FaImage } from 'react-icons/fa';

const MessageInput = ({ onSendMessage, sending, placeholder = "Type a message..." }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !sending) {
      onSendMessage(message);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceRecord = () => {
    // Voice recording functionality (optional)
    alert('Voice recording feature coming soon!');
  };

  const handleEmoji = () => {
    // Emoji picker functionality (optional)
    alert('Emoji picker coming soon!');
  };

  const handleImageUpload = () => {
    // Image upload functionality (optional)
    alert('Image upload coming soon!');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
      <div className="flex gap-2 items-end">
        {/* Action Buttons */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={handleVoiceRecord}
            className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition-colors"
            title="Voice message"
          >
            <FaMicrophone size={18} />
          </button>
          <button
            type="button"
            onClick={handleEmoji}
            className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition-colors"
            title="Add emoji"
          >
            <FaSmile size={18} />
          </button>
          <button
            type="button"
            onClick={handleImageUpload}
            className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition-colors"
            title="Upload image"
          >
            <FaImage size={18} />
          </button>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full input-field resize-none py-2 px-3"
            rows="1"
            disabled={sending}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="btn-primary px-4 py-2 h-10 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPaperPlane size={16} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
      
      {/* Character counter */}
      {message.length > 0 && (
        <div className="text-right mt-1">
          <span className="text-xs text-gray-400">
            {message.length} characters
          </span>
        </div>
      )}
    </form>
  );
};

export default MessageInput;