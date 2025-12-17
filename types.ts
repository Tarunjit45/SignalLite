export enum MessageType {
  TEXT = 'TEXT',
  VOICE = 'VOICE',
  SYSTEM = 'SYSTEM'
}

export enum MessageStatus {
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED'
}

export interface User {
  id: string;
  phoneNumber: string;
  avatarUrl?: string;
  lastSeen?: Date;
  isOnline: boolean;
  publicKey: string; // Mock Signal Identity Key
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string; // This would be encrypted in transit
  type: MessageType;
  timestamp: Date;
  status: MessageStatus;
  duration?: number; // For voice notes in seconds
}

export interface Chat {
  id: string;
  type: 'private' | 'group';
  name?: string; // For groups
  participants: string[]; // User IDs
  lastMessage?: Message;
  unreadCount: number;
}

export interface AppState {
  user: User | null;
  currentScreen: 'AUTH' | 'CHAT_LIST' | 'CHAT' | 'ENGINEERING_PLAN';
  activeChatId: string | null;
}
