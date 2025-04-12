
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ConversationList from './ConversationList';
import ChatRoom from './ChatRoom';
import { 
  mockConversations, 
  mockMessages, 
  currentUser 
} from '@/data/mockData';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageProps } from './MessageBubble';

const Chat: React.FC = () => {
  const [conversations, setConversations] = useState(mockConversations);
  const [messages, setMessages] = useState(mockMessages);
  const [activeConversationId, setActiveConversationId] = useState('conv1');
  const [showSidebar, setShowSidebar] = useState(true);
  const isMobile = useIsMobile();
  
  // Auto-hide sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
    }
  }, [isMobile]);
  
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
  
  const handleSendMessage = (text: string) => {
    const newMessage: MessageProps = {
      id: uuidv4(),
      content: text,
      timestamp: new Date(),
      sender: currentUser,
      isCurrentUser: true
    };
    
    // Add message to current conversation
    setMessages(prev => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMessage]
    }));
    
    // Update last message in conversations list
    setConversations(prev => 
      prev.map(conv => 
        conv.id === activeConversationId
          ? {
              ...conv,
              lastMessage: {
                content: text,
                timestamp: new Date(),
                isRead: true,
                isFromCurrentUser: true
              }
            }
          : conv
      )
    );
  };

  const handleChatCreated = (chatId: string) => {
    // In a real app, you would fetch the chat details from the database
    // For now, we'll just add a mock conversation
    const newConversation = {
      id: chatId,
      contact: {
        name: "New Contact",
        avatar: "",
        status: "online"
      },
      lastMessage: {
        content: "Start a conversation",
        timestamp: new Date(),
        isRead: true,
        isFromCurrentUser: false
      },
      unreadCount: 0
    };
    
    setConversations(prev => [...prev, newConversation]);
    setActiveConversationId(chatId);
    setMessages(prev => ({
      ...prev,
      [chatId]: []
    }));
  };
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeMessages = messages[activeConversationId] || [];
  
  return (
    <div className="flex h-full overflow-hidden bg-chat-light">
      {/* Sidebar */}
      <div 
        className={`${
          showSidebar ? 'block' : 'hidden'
        } w-full md:w-80 lg:w-96 h-full flex-shrink-0`}
      >
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onChatCreated={handleChatCreated}
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
            onSendMessage={handleSendMessage}
            onMenuToggle={handleToggleSidebar}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-white">
            <p className="text-gray-500">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
