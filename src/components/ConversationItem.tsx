
import React from 'react';
import { format } from 'date-fns';
import Avatar from './Avatar';
import { cn } from '@/lib/utils';

export interface ConversationProps {
  id: string;
  contact: {
    id: string;
    name: string;
    avatar: string;
    status?: 'online' | 'offline' | 'away';
  };
  lastMessage: {
    content: string;
    timestamp: Date;
    isRead: boolean;
    isFromCurrentUser?: boolean;
  };
  unreadCount?: number;
  isActive?: boolean;
}

const ConversationItem: React.FC<ConversationProps> = ({
  contact,
  lastMessage,
  unreadCount = 0,
  isActive = false,
}) => {
  return (
    <div 
      className={cn(
        "flex items-center p-3 cursor-pointer transition-colors",
        isActive ? "bg-chat-light" : "hover:bg-gray-50"
      )}
    >
      <div className="relative">
        <Avatar src={contact.avatar} alt={contact.name} />
        {contact.status === 'online' && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
        )}
        {contact.status === 'away' && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 border-2 border-white rounded-full"></span>
        )}
      </div>
      
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h3 className="font-medium text-sm truncate">{contact.name}</h3>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
            {format(lastMessage.timestamp, 'h:mm a')}
          </span>
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <p className={cn(
            "text-xs truncate", 
            unreadCount > 0 && !lastMessage.isFromCurrentUser ? "font-semibold" : "text-gray-500"
          )}>
            {lastMessage.isFromCurrentUser ? "You: " : ""}{lastMessage.content}
          </p>
          
          {unreadCount > 0 && !lastMessage.isFromCurrentUser && (
            <span className="ml-2 bg-chat-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
