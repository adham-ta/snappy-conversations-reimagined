
import React from 'react';
import { format } from 'date-fns';
import Avatar from './Avatar';
import { cn } from '@/lib/utils';

export interface MessageProps {
  id: string;
  content: string;
  timestamp: Date;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  isCurrentUser: boolean;
  showAvatar?: boolean;
}

const MessageBubble: React.FC<MessageProps> = ({
  content,
  timestamp,
  sender,
  isCurrentUser,
  showAvatar = true,
}) => {
  return (
    <div 
      className={cn(
        "flex items-end mb-4 animate-message-fade-in",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      {!isCurrentUser && showAvatar ? (
        <div className="flex-shrink-0 mr-2">
          <Avatar src={sender.avatar} alt={sender.name} size="sm" />
        </div>
      ) : !isCurrentUser ? (
        <div className="w-8 flex-shrink-0 mr-2"></div>
      ) : null}

      <div 
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2 text-sm",
          isCurrentUser 
            ? "bg-chat-primary text-white rounded-br-sm" 
            : "bg-chat-secondary text-gray-800 rounded-bl-sm"
        )}
      >
        {content}
        <div 
          className={cn(
            "text-[10px] mt-1",
            isCurrentUser ? "text-blue-100" : "text-gray-500"
          )}
        >
          {format(timestamp, 'h:mm a')}
        </div>
      </div>

      {isCurrentUser && showAvatar ? (
        <div className="flex-shrink-0 ml-2">
          <Avatar src={sender.avatar} alt={sender.name} size="sm" />
        </div>
      ) : null}
    </div>
  );
};

export default MessageBubble;
