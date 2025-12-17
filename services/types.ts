import { Chat, Message, MessageType, User } from '../types';

export interface IService {
  login(phoneNumber: string): Promise<User>;
  verifyOtp(phoneNumber: string, code: string): Promise<User>;
  getChats(): Promise<Chat[]>;
  getMessages(chatId: string): Promise<Message[]>;
  sendMessage(chatId: string, content: string, type?: MessageType): Promise<Message>;
  getUser(userId: string): User | undefined;
  // Cleanup method for WebSockets
  disconnect?(): void;
}
