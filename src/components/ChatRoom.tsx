
import React, { useRef, useEffect } from 'react';
import MessageBubble, { MessageProps } from './MessageBubble';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import { ConversationProps } from './ConversationItem';

interface ChatRoomProps {
  conversation: ConversationProps;
  messages: MessageProps[];
  onSendMessage: (text: string) => void;
  onMenuToggle: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  conversation,
  messages,
  onSendMessage,
  onMenuToggle,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Group messages by date to show date dividers
  const groupMessagesByDate = () => {
    const grouped: { [key: string]: MessageProps[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
    });
    
    return grouped;
  };

  // Process messages to determine when to show avatar (only for consecutive messages)
  const processMessagesForDisplay = (messagesArray: MessageProps[]) => {
    return messagesArray.map((message, index, arr) => {
      const prevMessage = index > 0 ? arr[index - 1] : null;
      
      // Only show avatar if this is the last message in a sequence from the same sender
      const showAvatar = !prevMessage || 
                          prevMessage.sender.id !== message.sender.id || 
                          index === arr.length - 1;
                          
      return { ...message, showAvatar };
    });
  };

  const groupedMessages = groupMessagesByDate();

  return (
    <div className="flex flex-col h-full bg-white">
      <ChatHeader 
        contact={conversation.contact} 
        onMenuToggle={onMenuToggle} 
      />
      
      <div className="flex-1 overflow-y-auto p-4 chat-messages">
        {Object.entries(groupedMessages).map(([date, messagesForDate]) => (
          <div key={date}>
            <div className="flex justify-center my-4">
              <span className="px-3 py-1 text-xs bg-gray-100 rounded-full text-gray-500">
                {new Date(date).toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            
            {processMessagesForDisplay(messagesForDate).map((message) => (
              <MessageBubble
                key={message.id}
                {...message}
                showAvatar={message.showAvatar}
              />
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
};

export default ChatRoom;
