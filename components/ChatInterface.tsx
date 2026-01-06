import React, { useEffect, useRef } from 'react';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll la ultimul mesaj
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px] w-full max-w-2xl mx-auto rounded-xl bg-jarvis-panel/50 border border-white/5 backdrop-blur-sm">
      {messages.length === 0 && (
        <div className="text-center text-gray-500 italic mt-10">
          Jarvis este gata. Apasă pe cerc pentru a vorbi sau scrie un mesaj.
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] p-3 rounded-lg text-sm md:text-base leading-relaxed ${
              msg.role === 'user'
                ? 'bg-cyan-900 text-cyan-50 rounded-tr-none'
                : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
            }`}
          >
            {msg.content}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};