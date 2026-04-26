// src/components/Chat/MessageList.jsx
import { useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { FaUser, FaRobot, FaCheck, FaCheckDouble } from 'react-icons/fa';

const MessageList = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    return format(new Date(timestamp), 'hh:mm a');
  };

  const isOwnMessage = (message) => {
    return message.senderId === currentUserId;
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <FaRobot className="text-4xl mx-auto mb-2 opacity-30" />
          <p>No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const isOwn = isOwnMessage(message);
        
        return (
          <div
            key={message.id || index}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isOwn ? 'bg-primary-500' : 'bg-gray-400'
              }`}>
                {isOwn ? (
                  <FaUser size={14} className="text-white" />
                ) : (
                  <FaRobot size={14} className="text-white" />
                )}
              </div>
              
              {/* Message Bubble */}
              <div>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    isOwn
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {/* Message Status */}
                <div className={`flex items-center gap-1 mt-1 text-xs ${
                  isOwn ? 'justify-end' : 'justify-start'
                }`}>
                  <span className="text-gray-400">
                    {formatMessageTime(message.timestamp)}
                  </span>
                  {isOwn && (
                    <span className="text-gray-400">
                      {message.isRead ? <FaCheckDouble size={10} /> : <FaCheck size={10} />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;