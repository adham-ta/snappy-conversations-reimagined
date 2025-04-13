
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageProps } from '@/components/MessageBubble';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeSubscription } from './use-supabase-listeners';
import { v4 as uuidv4 } from 'uuid';

export const useMessages = (activeConversationId: string | null) => {
  const [messages, setMessages] = useState<Record<string, MessageProps[]>>({});
  const { toast } = useToast();
  const { user } = useAuth();

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
    useRealtimeSubscription('messages', 'INSERT', `chat_id=eq.${activeConversationId}`, () => {
      fetchMessages();
    });
    
  }, [activeConversationId, user, toast]);
  
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
      
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
      return null;
    }
  };
  
  return {
    messages,
    handleSendMessage
  };
};
