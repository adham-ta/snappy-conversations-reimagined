
import React, { useState, useRef } from 'react';
import { Paperclip, Smile, Mic, Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  return (
    <div className="border-t p-3 bg-white">
      <div className="flex items-end rounded-lg border bg-white p-1">
        <button className="p-2 text-gray-500 hover:text-gray-800">
          <Paperclip size={20} />
        </button>
        
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 resize-none max-h-[150px] px-2 py-2 focus:outline-none"
          rows={1}
        />
        
        <div className="flex items-center">
          <button className="p-2 text-gray-500 hover:text-gray-800">
            <Smile size={20} />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-800">
            <Mic size={20} />
          </button>
          <button 
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className={`p-2 rounded-full ${
              message.trim() 
                ? 'text-white bg-chat-primary hover:bg-blue-600' 
                : 'text-gray-400 bg-gray-100'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
