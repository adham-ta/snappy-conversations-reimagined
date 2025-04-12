
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const NewChatButton = ({ onChatCreated }: { onChatCreated: (chatId: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userIdentifier, setUserIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateChat = async () => {
    if (!userIdentifier.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email, username, or name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Search for user by email or username
      const { data: profiles, error: searchError } = await supabase
        .from('profiles')
        .select('id, username, email')
        .or(`username.ilike.%${userIdentifier}%, email.ilike.%${userIdentifier}%`);

      if (searchError) throw searchError;
      
      if (!profiles || profiles.length === 0) {
        toast({
          title: "User not found",
          description: "No user found with that email or username",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Create new chat
      const newChatId = uuidv4();
      const { error: chatError } = await supabase
        .from('chats')
        .insert({ id: newChatId });

      if (chatError) throw chatError;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to create a chat",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Add both users as chat participants
      const participants = [
        { chat_id: newChatId, user_id: user.id },
        { chat_id: newChatId, user_id: profiles[0].id }
      ];

      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      toast({
        title: "Chat created",
        description: `Chat with ${profiles[0].username || profiles[0].email} created successfully`,
      });

      setIsOpen(false);
      setUserIdentifier('');
      onChatCreated(newChatId);
    } catch (error: any) {
      toast({
        title: "Error creating chat",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        className="flex items-center gap-2 bg-chat-primary hover:bg-chat-primary/90"
      >
        <Plus size={18} />
        <span>New Chat</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Chat</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="user-identifier">User Email or Username</Label>
              <Input
                id="user-identifier"
                value={userIdentifier}
                onChange={(e) => setUserIdentifier(e.target.value)}
                placeholder="Enter email or username"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateChat} 
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Chat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewChatButton;
