
import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import ConversationItem, { ConversationProps } from './ConversationItem';
import NewChatButton from './NewChatButton';

interface ConversationListProps {
  conversations: ConversationProps[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onChatCreated?: (chatId: string) => void;
  isLoading?: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onChatCreated = () => {},
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredConversations = searchTerm
    ? conversations.filter(conv => 
        conv.contact.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : conversations;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-r dark:border-gray-700">
      <div className="p-3 border-b dark:border-gray-700 space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full py-2 pl-10 pr-4 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-chat-primary dark:focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <NewChatButton onChatCreated={onChatCreated} />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-chat-primary dark:text-blue-400" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchTerm 
              ? 'No conversations match your search' 
              : 'No conversations yet. Start a new chat!'}
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div 
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <ConversationItem
                {...conversation}
                isActive={conversation.id === activeConversationId}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
