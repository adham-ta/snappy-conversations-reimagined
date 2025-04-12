
import React from 'react';
import { Search } from 'lucide-react';
import ConversationItem, { ConversationProps } from './ConversationItem';
import NewChatButton from './NewChatButton';

interface ConversationListProps {
  conversations: ConversationProps[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onChatCreated?: (chatId: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onChatCreated = () => {},
}) => {
  return (
    <div className="h-full flex flex-col bg-white border-r">
      <div className="p-3 border-b space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full py-2 pl-10 pr-4 bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-chat-primary"
          />
        </div>
        <NewChatButton onChatCreated={onChatCreated} />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No conversations yet. Start a new chat!
          </div>
        ) : (
          conversations.map((conversation) => (
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
