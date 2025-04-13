
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ConversationProps } from './ConversationItem';
import ConversationList from './ConversationList';
import ChatRoom from './ChatRoom';
import { MessageProps } from './MessageBubble';

interface ChatLayoutProps {
  conversations: ConversationProps[];
  activeConversation: ConversationProps | undefined;
  activeConversationId: string | null;
  isLoading: boolean;
  showSidebar: boolean;
  activeMessages: MessageProps[];
  onSelectConversation: (id: string) => void;
  onSendMessage: (text: string) => void;
  onMenuToggle: () => void;
  onChatCreated: (chatId: string) => void;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({
  conversations,
  activeConversation,
  activeConversationId,
  isLoading,
  showSidebar,
  activeMessages,
  onSelectConversation,
  onSendMessage,
  onMenuToggle,
  onChatCreated
}) => {
  return (
    <div className="flex h-full overflow-hidden bg-chat-light dark:bg-gray-900">
      {/* Sidebar */}
      <div 
        className={`${
          showSidebar ? 'block' : 'hidden'
        } w-full md:w-80 lg:w-96 h-full flex-shrink-0`}
      >
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId || ''}
          onSelectConversation={onSelectConversation}
          onChatCreated={onChatCreated}
          isLoading={isLoading}
        />
      </div>
      
      {/* Chat area */}
      <div className={`${
        !showSidebar ? 'block' : 'hidden md:block'
      } flex-1 h-full`}>
        {activeConversation ? (
          <ChatRoom
            conversation={activeConversation}
            messages={activeMessages}
            onSendMessage={onSendMessage}
            onMenuToggle={onMenuToggle}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              {isLoading ? 'Loading conversations...' : 'Select a conversation or start a new chat'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
