import { Chat, Message, MessageStatus, MessageType, User } from '../types';
import { IService } from './types';

// ... (Keep existing mock data constants: MOCK_USER_ID, CONTACTS, INITIAL_CHATS, INITIAL_MESSAGES) ...
const MOCK_USER_ID = 'me-123';

const CONTACTS: User[] = [
  { id: 'u-1', phoneNumber: '+1 555 0101', isOnline: true, publicKey: 'pk_1', avatarUrl: 'https://picsum.photos/200' },
  { id: 'u-2', phoneNumber: '+1 555 0102', isOnline: false, lastSeen: new Date(), publicKey: 'pk_2', avatarUrl: 'https://picsum.photos/201' },
  { id: 'u-3', phoneNumber: '+1 555 0103', isOnline: true, publicKey: 'pk_3', avatarUrl: 'https://picsum.photos/202' },
];

const INITIAL_CHATS: Chat[] = [
  {
    id: 'c-1',
    type: 'private',
    participants: ['me-123', 'u-1'],
    unreadCount: 2,
    lastMessage: {
      id: 'm-0',
      chatId: 'c-1',
      senderId: 'u-1',
      content: 'Hey, are we still on for the migration?',
      type: MessageType.TEXT,
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      status: MessageStatus.READ
    }
  },
  {
    id: 'c-2',
    type: 'group',
    name: 'Dev Team',
    participants: ['me-123', 'u-1', 'u-2'],
    unreadCount: 0,
    lastMessage: {
      id: 'm-1',
      chatId: 'c-2',
      senderId: 'me-123',
      content: 'I deployed the fix.',
      type: MessageType.TEXT,
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      status: MessageStatus.READ
    }
  }
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  'c-1': [
    { id: 'm-10', chatId: 'c-1', senderId: 'me-123', content: 'Did you check the logs?', type: MessageType.TEXT, timestamp: new Date(Date.now() - 1000 * 60 * 10), status: MessageStatus.READ },
    { id: 'm-11', chatId: 'c-1', senderId: 'u-1', content: 'Yes, looking at them now.', type: MessageType.TEXT, timestamp: new Date(Date.now() - 1000 * 60 * 8), status: MessageStatus.READ },
    { id: 'm-12', chatId: 'c-1', senderId: 'u-1', content: 'Hey, are we still on for the migration?', type: MessageType.TEXT, timestamp: new Date(Date.now() - 1000 * 60 * 5), status: MessageStatus.READ },
  ],
  'c-2': [
    { id: 'm-20', chatId: 'c-2', senderId: 'u-2', content: 'Server is down.', type: MessageType.TEXT, timestamp: new Date(Date.now() - 1000 * 60 * 120), status: MessageStatus.READ },
    { id: 'm-21', chatId: 'c-2', senderId: 'me-123', content: 'I deployed the fix.', type: MessageType.TEXT, timestamp: new Date(Date.now() - 1000 * 60 * 60), status: MessageStatus.READ },
  ]
};

// Simulation Service
class MockService implements IService {
  private chats: Chat[] = [...INITIAL_CHATS];
  private messages: Record<string, Message[]> = { ...INITIAL_MESSAGES };
  private currentUser: User | null = null;
  private STORAGE_KEY = 'sl_user_session';

  constructor() {
    try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            this.currentUser = JSON.parse(stored);
        }
    } catch (e) {
        console.error('Failed to load session', e);
    }
  }

  login(phoneNumber: string): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Just return dummy data for OTP request in mock
        resolve({ id: 'temp', phoneNumber, isOnline: false, publicKey: '' });
      }, 800);
    });
  }

  verifyOtp(phoneNumber: string, code: string): Promise<User> {
     return new Promise((resolve, reject) => {
       setTimeout(() => {
        if (code !== '123456') {
            reject(new Error('Invalid code'));
            return;
        }
        this.currentUser = {
          id: MOCK_USER_ID,
          phoneNumber,
          isOnline: true,
          publicKey: 'pk_me_123'
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentUser));
        resolve(this.currentUser);
       }, 800);
     });
  }

  getChats(): Promise<Chat[]> {
    return Promise.resolve(this.chats);
  }

  getMessages(chatId: string): Promise<Message[]> {
    return Promise.resolve(this.messages[chatId] || []);
  }

  sendMessage(chatId: string, content: string, type: MessageType = MessageType.TEXT): Promise<Message> {
    return new Promise((resolve) => {
      const newMessage: Message = {
        id: `m-${Date.now()}`,
        chatId,
        senderId: MOCK_USER_ID,
        content,
        type,
        timestamp: new Date(),
        status: MessageStatus.SENDING
      };

      if (!this.messages[chatId]) this.messages[chatId] = [];
      this.messages[chatId].push(newMessage);

      setTimeout(() => {
        newMessage.status = MessageStatus.SENT;
        resolve(newMessage);
      }, 300);

      setTimeout(() => {
        newMessage.status = MessageStatus.DELIVERED;
      }, 1500);
      
      setTimeout(() => {
        newMessage.status = MessageStatus.READ;
      }, 3500);
    });
  }

  getUser(userId: string): User | undefined {
    if (userId === MOCK_USER_ID) return this.currentUser!;
    return CONTACTS.find(u => u.id === userId);
  }
}

export const mockService = new MockService();
