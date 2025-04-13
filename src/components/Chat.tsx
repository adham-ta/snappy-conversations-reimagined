
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ConversationList from './ConversationList';
import ChatRoom from './ChatRoom';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageProps } from './MessageBubble';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Chat: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<Record<string, MessageProps[]>>({});
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Auto-hide sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
    }
  }, [isMobile]);
  
  // Fetch chats from Supabase
  useEffect(() => {
    if (!user) return;
    
    const fetchChats = async () => {
      setIsLoading(true);
      try {
        // Get chats where the current user is a participant
        const { data: participations, error: participationsError } = await supabase
          .from('chat_participants')
          .select('chat_id')
          .eq('user_id', user.id);
        
        if (participationsError) throw participationsError;
        
        if (!participations || participations.length === 0) {
          setIsLoading(false);
          return;
        }
        
        const chatIds = participations.map(p => p.chat_id);
        
        // For each chat, get the other participant's info
        const fetchedConversations = [];
        
        for (const chatId of chatIds) {
          // Get all participants for this chat
          const { data: chatParticipants, error: participantsError } = await supabase
            .from('chat_participants')
            .select('user_id')
            .eq('chat_id', chatId);
            
          if (participantsError) continue;
          
          // Find participant who is not the current user
          const otherParticipantIds = chatParticipants
            .filter(p => p.user_id !== user.id)
            .map(p => p.user_id);
            
          if (otherParticipantIds.length === 0) continue;
          
          // Get profile info for other participant
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', otherParticipantIds);
            
          if (profilesError || !profiles || profiles.length === 0) continue;
          
          // Get last message for this chat
          const { data: lastMessages, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: false })
            .limit(1);
            
          const lastMessage = lastMessages && lastMessages.length > 0 ? lastMessages[0] : null;
          
          // Add to conversations
          fetchedConversations.push({
            id: chatId,
            contact: {
              id: profiles[0].id,
              name: profiles[0].display_name || profiles[0].username,
              avatar: profiles[0].avatar_url || '',
              status: profiles[0].last_seen ? 'online' : 'offline'
            },
            lastMessage: {
              content: lastMessage ? lastMessage.content : 'Start a conversation',
              timestamp: lastMessage ? new Date(lastMessage.created_at) : new Date(),
              isRead: true,
              isFromCurrentUser: lastMessage ? lastMessage.sender_id === user.id : false
            },
            unreadCount: 0
          });
        }
        
        setConversations(fetchedConversations);
        
        // If we have chats and no active one selected, select the first one
        if (fetchedConversations.length > 0 && !activeConversationId) {
          setActiveConversationId(fetchedConversations[0].id);
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load conversations',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChats();
    
    // Set up real-time subscription for new chat participants
    const participantsChannel = supabase
      .channel('chat_participants_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_participants',
        filter: `user_id=eq.${user.id}` 
      }, (payload) => {
        // Refresh chats when a new chat participant is added
        fetchChats();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(participantsChannel);
    };
  }, [user, toast, activeConversationId]);
  
  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId || !user) return;
    
    const fetchMessages = async () => {
      try {
        // Modified query to properly fetch sender information
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id, 
            content, 
            created_at, 
            sender_id
          `)
          .eq('chat_id', activeConversationId)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        if (data) {
          // Get all unique sender IDs
          const senderIds = [...new Set(data.map(msg => msg.sender_id))];
          
          // Fetch all sender profiles in one go
          const { data: senderProfiles, error: senderError } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .in('id', senderIds);
            
          if (senderError) throw senderError;
          
          // Create lookup map for sender profiles
          const senderMap = senderProfiles ? 
            senderProfiles.reduce((acc, profile) => ({
              ...acc,
              [profile.id]: profile
            }), {}) : {};
          
          const formattedMessages = data.map(msg => {
            const senderProfile = senderMap[msg.sender_id] || {};
            
            return {
              id: msg.id,
              content: msg.content,
              timestamp: new Date(msg.created_at),
              sender: {
                id: msg.sender_id,
                name: senderProfile.display_name || senderProfile.username || 'Unknown',
                avatar: senderProfile.avatar_url || ''
              },
              isCurrentUser: msg.sender_id === user.id
            };
          });
          
          setMessages(prev => ({
            ...prev,
            [activeConversationId]: formattedMessages
          }));
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load messages',
          variant: 'destructive'
        });
      }
    };
    
    fetchMessages();
    
    // Set up real-time subscription for messages
    const messagesChannel = supabase
      .channel('messages_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `chat_id=eq.${activeConversationId}` 
      }, (payload) => {
        fetchMessages();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [activeConversationId, user, toast]);
  
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
  
  const handleSendMessage = async (text: string) => {
    if (!activeConversationId || !user || !text.trim()) return;
    
    try {
      // Insert message into Supabase
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: activeConversationId,
          content: text,
          sender_id: user.id
        })
        .select();
        
      if (error) throw error;
      
      // Update UI optimistically
      const newMessage: MessageProps = {
        id: data?.[0]?.id || uuidv4(),
        content: text,
        timestamp: new Date(),
        sender: {
          id: user.id,
          name: user.email || 'You',
          avatar: ''
        },
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
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  };

  const handleChatCreated = (chatId: string) => {
    // After a new chat is created, refresh the conversations list
    if (user) {
      setActiveConversationId(chatId);
      
      // Fetch the new conversation details
      supabase
        .from('chat_participants')
        .select('user_id')
        .eq('chat_id', chatId)
        .neq('user_id', user.id)
        .single()
        .then(({ data: participant, error }) => {
          if (error || !participant) return;
          
          supabase
            .from('profiles')
            .select('*')
            .eq('id', participant.user_id)
            .single()
            .then(({ data: profile, error: profileError }) => {
              if (profileError || !profile) return;
              
              const newConversation = {
                id: chatId,
                contact: {
                  id: profile.id,
                  name: profile.display_name || profile.username,
                  avatar: profile.avatar_url || '',
                  status: profile.last_seen ? 'online' : 'offline'
                },
                lastMessage: {
                  content: 'Start a conversation',
                  timestamp: new Date(),
                  isRead: true,
                  isFromCurrentUser: false
                },
                unreadCount: 0
              };
              
              setConversations(prev => [...prev, newConversation]);
              setMessages(prev => ({
                ...prev,
                [chatId]: []
              }));
            });
        });
    }
  };
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeMessages = activeConversationId ? (messages[activeConversationId] || []) : [];
  
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
          onSelectConversation={handleSelectConversation}
          onChatCreated={handleChatCreated}
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
            onSendMessage={handleSendMessage}
            onMenuToggle={handleToggleSidebar}
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

export default Chat;
