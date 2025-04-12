
import { MessageProps } from '@/components/MessageBubble';
import { ConversationProps } from '@/components/ConversationItem';

// Mock users
export const currentUser = {
  id: 'current-user',
  name: 'You',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
};

export const contacts = [
  {
    id: 'user1',
    name: 'Emma Wilson',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    status: 'online' as const
  },
  {
    id: 'user2',
    name: 'James Chen',
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
    status: 'offline' as const
  },
  {
    id: 'user3',
    name: 'Olivia Taylor',
    avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
    status: 'away' as const
  },
  {
    id: 'user4',
    name: 'William Davis',
    avatar: 'https://randomuser.me/api/portraits/men/37.jpg',
    status: 'online' as const
  },
  {
    id: 'user5',
    name: 'Sophia Martinez',
    avatar: 'https://randomuser.me/api/portraits/women/29.jpg',
    status: 'offline' as const
  }
];

// Helper to create messages with proper timestamps
const createMessage = (
  id: string,
  content: string,
  sender: typeof currentUser | typeof contacts[0],
  hoursAgo: number,
  isCurrentUser: boolean
): MessageProps => {
  const timestamp = new Date();
  timestamp.setHours(timestamp.getHours() - hoursAgo);
  
  return {
    id,
    content,
    sender,
    timestamp,
    isCurrentUser
  };
};

// Mock messages for conversations
export const mockMessages: Record<string, MessageProps[]> = {
  'conv1': [
    createMessage('msg1', 'Hey, how are you doing?', contacts[0], 6, false),
    createMessage('msg2', 'I\'m good, thanks for asking! How about you?', currentUser, 6, true),
    createMessage('msg3', 'I\'m doing pretty well. Working on that project we discussed.', contacts[0], 5, false),
    createMessage('msg4', 'Oh nice! How\'s the progress?', currentUser, 5, true),
    createMessage('msg5', 'It\'s coming along well. I should have a demo ready by tomorrow.', contacts[0], 4, false),
    createMessage('msg6', 'That\'s great news! Looking forward to seeing it.', currentUser, 4, true),
    createMessage('msg7', 'Are we still meeting for coffee this weekend?', contacts[0], 2, false),
    createMessage('msg8', 'Yes, absolutely! How about Saturday at 2pm?', currentUser, 1, true),
    createMessage('msg9', 'Perfect! See you then.', contacts[0], 0.5, false),
  ],
  'conv2': [
    createMessage('msg10', 'Did you review the document I sent?', contacts[1], 12, false),
    createMessage('msg11', 'Yes, I did. It looks good overall.', currentUser, 10, true),
    createMessage('msg12', 'Great! Any suggestions for improvements?', contacts[1], 10, false),
    createMessage('msg13', 'I\'ll send you my notes by EOD.', currentUser, 8, true),
  ],
  'conv3': [
    createMessage('msg14', 'Happy birthday! 🎂', currentUser, 24, true),
    createMessage('msg15', 'Thank you so much! 😊', contacts[2], 23, false),
    createMessage('msg16', 'Are you having a party?', currentUser, 23, true),
    createMessage('msg17', 'Yes, this Saturday. Would love if you could come!', contacts[2], 22, false),
    createMessage('msg18', 'I\'ll be there!', currentUser, 21, true),
  ],
  'conv4': [
    createMessage('msg19', 'Meeting is scheduled for tomorrow at 10am.', contacts[3], 30, false),
    createMessage('msg20', 'I\'ll be there. Do we need to prepare anything?', currentUser, 28, true),
    createMessage('msg21', 'Just bring your laptop and ideas!', contacts[3], 27, false),
  ],
  'conv5': [
    createMessage('msg22', 'Can you help me with this design issue?', currentUser, 49, true),
    createMessage('msg23', 'Sure, what\'s the problem?', contacts[4], 48, false),
    createMessage('msg24', 'I\'ll send you screenshots.', currentUser, 48, true),
    createMessage('msg25', 'Please do, and I\'ll take a look.', contacts[4], 47, false),
  ],
};

// Create conversations
export const mockConversations: ConversationProps[] = contacts.map((contact, index) => {
  const conversationId = `conv${index + 1}`;
  const messages = mockMessages[conversationId] || [];
  const lastMessage = messages[messages.length - 1];
  
  return {
    id: conversationId,
    contact,
    lastMessage: {
      content: lastMessage.content,
      timestamp: lastMessage.timestamp,
      isRead: index !== 0 && index !== 2,
      isFromCurrentUser: lastMessage.isCurrentUser
    },
    unreadCount: (index === 0 || index === 2) ? index + 1 : 0
  };
});
