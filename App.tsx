import React, { useState } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { ChatList } from './components/ChatList';
import { ChatWindow } from './components/ChatWindow';
import { EngineeringPlan } from './components/EngineeringPlan';

export default function App() {
  // Check localStorage for existing session
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('sl_user_session');
  });
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showEngineeringPlan, setShowEngineeringPlan] = useState(false);

  if (!isAuthenticated) {
    return <AuthScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  if (showEngineeringPlan) {
    return <EngineeringPlan onBack={() => setShowEngineeringPlan(false)} />;
  }

  return (
    <div className="flex h-full w-full bg-gray-900 overflow-hidden">
      {/* Desktop: Sidebar + Main Content */}
      <div className={`${activeChatId ? 'hidden md:flex' : 'flex'} w-full md:w-auto flex-col h-full`}>
         <ChatList 
            onSelectChat={setActiveChatId} 
            activeChatId={activeChatId} 
            onOpenPlan={() => setShowEngineeringPlan(true)}
         />
      </div>

      {/* Main Chat Area */}
      <div className={`${!activeChatId ? 'hidden md:flex' : 'flex'} flex-1 h-full flex-col bg-gray-900 relative`}>
        {activeChatId ? (
          <ChatWindow 
            chatId={activeChatId} 
            onBack={() => setActiveChatId(null)} 
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 select-none opacity-50">
            <div className="w-24 h-24 bg-gray-800 rounded-full mb-4 flex items-center justify-center">
                <span className="text-4xl">💬</span>
            </div>
            <p className="text-lg">Select a conversation to start messaging</p>
            <p className="text-sm mt-2">End-to-end encrypted</p>
          </div>
        )}
      </div>
    </div>
  );
}