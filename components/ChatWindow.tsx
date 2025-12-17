import React, { useEffect, useState, useRef } from 'react';
import { Chat, Message, MessageStatus, MessageType } from '../types';
import { service } from '../services'; // Updated import

interface ChatWindowProps {
  chatId: string;
  onBack: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [chatInfo, setChatInfo] = useState<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // Load chat info and messages
    service.getChats().then(chats => {
      const chat = chats.find(c => c.id === chatId);
      setChatInfo(chat || null);
    });
    service.getMessages(chatId).then(setMessages);

    // Mock real-time updates could go here
    const interval = setInterval(() => {
        service.getMessages(chatId).then(msgs => {
            if (msgs.length !== messages.length) setMessages(msgs);
        });
    }, 2000);
    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    // Scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const tempText = inputText;
    setInputText(''); // Clear immediately
    
    // Optimistic Update handled by service
    const newMsg = await service.sendMessage(chatId, tempText);
    setMessages(prev => [...prev, newMsg]);
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      service.sendMessage(chatId, "🎤 Voice Note (0:05)", MessageType.VOICE).then(msg => {
          setMessages(prev => [...prev, msg]);
      });
    } else {
      setIsRecording(true);
    }
  };

  if (!chatInfo) return <div className="flex-1 flex items-center justify-center text-gray-500">Loading...</div>;

  const chatName = chatInfo.type === 'group' ? chatInfo.name : service.getUser(chatInfo.participants.find(p => p !== 'me-123')!)?.phoneNumber;

  return (
    <div className="flex flex-col h-full bg-[#0b101a]">
      {/* Header */}
      <div className="h-16 flex items-center px-4 bg-gray-800 border-b border-gray-700 shadow-sm flex-shrink-0">
        <button onClick={onBack} className="md:hidden mr-4 text-gray-400">
          ←
        </button>
        <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold mr-3">
                {chatName ? chatName[1] : '?'}
            </div>
            <div>
                 <h2 className="text-gray-100 font-semibold text-sm">{chatName}</h2>
                 <p className="text-xs text-gray-500 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                    Encrypted Signal Protocol
                 </p>
            </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar" ref={scrollRef}>
        <div className="text-center text-xs text-gray-600 my-4 bg-gray-900/50 py-1 rounded mx-auto w-fit px-3">
          🔒 Messages are end-to-end encrypted. No one outside of this chat, not even SignalLite, can read or listen to them.
        </div>
        
        {messages.map((msg) => {
          const isMe = msg.senderId === 'me-123';
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[75%] px-4 py-2 rounded-lg text-sm shadow-md ${
                  isMe ? 'bg-green-700 text-white rounded-tr-none' : 'bg-gray-700 text-gray-200 rounded-tl-none'
                }`}
              >
                {msg.type === MessageType.VOICE && (
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-1"></div>
                        <div className="h-1 w-24 bg-gray-400/50 rounded-full overflow-hidden">
                             <div className="h-full w-1/2 bg-white"></div>
                        </div>
                    </div>
                )}
                <p>{msg.content}</p>
                <div className="flex justify-end items-center mt-1 space-x-1">
                  <span className="text-[10px] opacity-70">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && (
                    <span className="text-[10px]">
                      {msg.status === MessageStatus.SENDING && '🕒'}
                      {msg.status === MessageStatus.SENT && '✓'}
                      {msg.status === MessageStatus.DELIVERED && '✓✓'}
                      {msg.status === MessageStatus.READ && <span className="text-blue-300">✓✓</span>}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-3 bg-gray-800 border-t border-gray-700 flex items-center gap-2">
        <button className="text-gray-400 p-2 hover:bg-gray-700 rounded-full transition">
          +
        </button>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Message"
          className="flex-1 bg-gray-900 text-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-600"
        />
        {inputText.length > 0 ? (
           <button 
           onClick={handleSend}
           className="bg-green-600 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center hover:bg-green-500 transition shadow-lg">
           ➤
         </button>
        ) : (
            <button 
            onClick={handleVoiceRecord}
            className={`${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-700'} text-white p-2 rounded-full w-10 h-10 flex items-center justify-center transition`}>
            {isRecording ? '■' : '🎤'}
          </button>
        )}
       
      </div>
    </div>
  );
};
