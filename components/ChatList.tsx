import React, { useEffect, useState } from 'react';
import { Chat, User } from '../types';
import { service } from '../services'; // Updated import

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  activeChatId: string | null;
  onOpenPlan: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({ onSelectChat, activeChatId, onOpenPlan }) => {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    service.getChats().then(setChats);
  }, []);

  const getChatName = (chat: Chat) => {
    if (chat.type === 'group') return chat.name;
    const otherId = chat.participants.find(id => id !== 'me-123');
    const user = service.getUser(otherId || '');
    return user ? user.phoneNumber : 'Unknown';
  };

  const getAvatar = (chat: Chat) => {
      if (chat.type === 'group') return `https://ui-avatars.com/api/?name=${chat.name}&background=random`;
       const otherId = chat.participants.find(id => id !== 'me-123');
       const user = service.getUser(otherId || '');
       return user?.avatarUrl;
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800 w-full md:w-80 flex-shrink-0">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white tracking-tight">SignalLite</h1>
        <button onClick={onOpenPlan} className="text-xs text-blue-400 hover:text-blue-300 border border-blue-900 bg-blue-900/20 px-2 py-1 rounded">
          Arch. Plan
        </button>
      </div>
      
      <div className="overflow-y-auto flex-1 no-scrollbar">
        {chats.map(chat => {
          const isActive = chat.id === activeChatId;
          const name = getChatName(chat);
          const avatar = getAvatar(chat);
          
          return (
            <div 
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`p-4 flex items-center cursor-pointer hover:bg-gray-800 transition-colors ${isActive ? 'bg-gray-800' : ''}`}
            >
              <img src={avatar} alt="avatar" className="w-12 h-12 rounded-full mr-3 bg-gray-700 object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-gray-200 font-medium truncate">{name}</h3>
                  <span className="text-xs text-gray-500">
                    {chat.lastMessage?.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {chat.lastMessage?.senderId === 'me-123' && <span className="text-gray-400">✓ </span>}
                  {chat.lastMessage?.content}
                </p>
              </div>
              {chat.unreadCount > 0 && (
                <div className="ml-2 bg-green-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {chat.unreadCount}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-gray-800 text-center">
        <button className="w-full bg-gray-800 text-gray-300 py-2 rounded-lg hover:bg-gray-700 transition text-sm font-medium">
          Start New Chat
        </button>
      </div>
    </div>
  );
};
