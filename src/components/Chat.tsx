
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useConversations } from '@/hooks/use-conversations';
import { useMessages } from '@/hooks/use-messages';
import ChatLayout from './ChatLayout';

const Chat: React.FC = () => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const isMobile = useIsMobile();
  
  // Custom hooks
  const { conversations, isLoading, handleChatCreated, setConversations } = useConversations();
  const { messages, handleSendMessage } = useMessages(activeConversationId);
  
  // Auto-hide sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
    }
  }, [isMobile]);
  
  // If we have chats and no active one selected, select the first one
  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);
  
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    
    // Mark conversation as read when selected
    setConversations(prev => 
      prev.map(conv => 
        conv.id === id 
          ? {
              ...conv,
              lastMessage: {
                ...conv.lastMessage,
                isRead: true
              },
              unreadCount: 0
            }
          : conv
      )
    );
    
    // Hide sidebar on mobile when conversation is selected
    if (isMobile) {
      setShowSidebar(false);
    }
  };
  
  const handleToggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeMessages = activeConversationId ? (messages[activeConversationId] || []) : [];
  
  return (
    <ChatLayout
      conversations={conversations}
      activeConversation={activeConversation}
      activeConversationId={activeConversationId}
      isLoading={isLoading}
      showSidebar={showSidebar}
      activeMessages={activeMessages}
      onSelectConversation={handleSelectConversation}
      onSendMessage={handleSendMessage}
      onMenuToggle={handleToggleSidebar}
      onChatCreated={handleChatCreated}
    />
  );
};

export default Chat;
