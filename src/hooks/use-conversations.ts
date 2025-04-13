
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ConversationProps } from '@/components/ConversationItem';
import { useRealtimeSubscription } from './use-supabase-listeners';

export const useConversations = () => {
  const [conversations, setConversations] = useState<ConversationProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

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
    useRealtimeSubscription('chat_participants', 'INSERT', `user_id=eq.${user.id}`, () => {
      fetchChats();
    });
    
  }, [user, toast]);

  const handleChatCreated = (chatId: string) => {
    // After a new chat is created, refresh the conversations list
    if (user) {
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
            });
        });
    }
  };

  return {
    conversations,
    isLoading,
    handleChatCreated,
    setConversations
  };
};
