import { Chat, Message, MessageStatus, MessageType, User } from '../types';
import { IService } from './types';
import { API_BASE_URL, WS_BASE_URL } from '../config';

class RealService implements IService {
  private token: string | null = localStorage.getItem('sl_token');
  private ws: WebSocket | null = null;
  private messageHandlers: ((msg: Message) => void)[] = [];

  constructor() {
    if (this.token) {
      this.connectWebSocket();
    }
  }

  // --- Auth ---

  async login(phoneNumber: string): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    });
    if (!res.ok) throw new Error('Failed to send OTP');
    
    // Return a temporary user object (real user comes after verify)
    return { id: 'temp', phoneNumber, isOnline: false, publicKey: '' };
  }

  async verifyOtp(phoneNumber: string, code: string): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, code }),
    });
    
    if (!res.ok) throw new Error('Invalid Code');
    
    const data = await res.json();
    this.token = data.token;
    localStorage.setItem('sl_token', data.token);
    localStorage.setItem('sl_user_session', JSON.stringify(data.user));
    
    this.connectWebSocket();
    return data.user;
  }

  // --- Data ---

  async getChats(): Promise<Chat[]> {
    const res = await fetch(`${API_BASE_URL}/chats`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return res.ok ? res.json() : [];
  }

  async getMessages(chatId: string): Promise<Message[]> {
    const res = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    const messages = await res.json();
    
    // Convert date strings to Date objects
    return messages.map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp)
    }));
  }

  async sendMessage(chatId: string, content: string, type: MessageType = MessageType.TEXT): Promise<Message> {
    // 1. Send via HTTP (standard REST pattern) or WebSocket
    const res = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ chatId, content, type })
    });

    if (!res.ok) throw new Error('Failed to send');
    const msg = await res.json();
    return { ...msg, timestamp: new Date(msg.timestamp) };
  }

  getUser(userId: string): User | undefined {
    // In a real app, you might fetch this from a local cache or API
    // For now, returning undefined forces a fetch in the UI or showing a placeholder
    return undefined; 
  }

  // --- Real-time ---

  private connectWebSocket() {
    if (this.ws) return;
    
    this.ws = new WebSocket(`${WS_BASE_URL}?token=${this.token}`);
    
    this.ws.onopen = () => {
      console.log('Connected to Realtime Server');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_MESSAGE') {
          // Dispatch to listeners (e.g., update ChatWindow)
          console.log('New Message Received:', data.payload);
        }
      } catch (e) {
        console.error('WS Error', e);
      }
    };
    
    this.ws.onclose = () => {
      this.ws = null;
      // Simple reconnect logic
      setTimeout(() => this.connectWebSocket(), 3000);
    };
  }

  disconnect() {
    if (this.ws) this.ws.close();
  }
}

export const realService = new RealService();
