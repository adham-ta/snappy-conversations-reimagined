
import React from 'react';
import { Menu, Settings, Phone, Video } from 'lucide-react';
import Avatar from './Avatar';

interface ChatHeaderProps {
  contact: {
    name: string;
    avatar: string;
    status?: 'online' | 'offline' | 'away';
  };
  onMenuToggle: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ contact, onMenuToggle }) => {
  return (
    <div className="flex items-center justify-between p-3 border-b">
      <div className="flex items-center">
        <button 
          onClick={onMenuToggle} 
          className="p-2 rounded-full hover:bg-gray-100 lg:hidden mr-2"
        >
          <Menu size={20} />
        </button>
        <Avatar src={contact.avatar} alt={contact.name} />
        <div className="ml-3">
          <h2 className="font-semibold text-sm">{contact.name}</h2>
          <div className="flex items-center text-xs text-gray-500">
            <span 
              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                contact.status === 'online' ? 'bg-green-500' : 
                contact.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
              }`}
            />
            {contact.status === 'online' ? 'Online' : 
             contact.status === 'away' ? 'Away' : 'Offline'}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Phone size={18} />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Video size={18} />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
