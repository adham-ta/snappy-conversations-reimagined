
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  
  if (!user) {
    return null;
  }
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  // Get initials from email
  const getInitials = () => {
    if (!user.email) return 'U';
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:block text-sm text-white">
        {user.email}
      </div>
      
      <Avatar className="h-8 w-8 border border-white/20">
        <AvatarFallback className="bg-chat-primary text-white">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleSignOut}
        className="text-white hover:bg-white/10"
        title="Sign out"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default UserMenu;
