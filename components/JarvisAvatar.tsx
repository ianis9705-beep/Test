import React from 'react';
import { JarvisStatus } from '../types';

interface JarvisAvatarProps {
  status: JarvisStatus;
  onClick: () => void;
}

/**
 * Componenta vizuală principală.
 * Animațiile sunt realizate exclusiv cu clase Tailwind.
 */
export const JarvisAvatar: React.FC<JarvisAvatarProps> = ({ status, onClick }) => {
  
  // Determinăm culorile și animațiile în funcție de stare
  const getStyles = () => {
    switch (status) {
      case 'listening':
        return {
          ring: 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.6)]',
          inner: 'bg-red-500 animate-pulse',
          icon: '🎤',
          container: 'animate-pulse'
        };
      case 'thinking':
        return {
          ring: 'border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.6)] border-t-transparent animate-spin',
          inner: 'bg-purple-900',
          icon: '🧠',
          container: ''
        };
      case 'speaking':
        return {
          ring: 'border-cyan-400 shadow-[0_0_60px_rgba(34,211,238,0.8)]',
          inner: 'bg-cyan-400 animate-pulse-fast',
          icon: '🔊',
          container: 'animate-bounce' // Ușoară mișcare când vorbește
        };
      case 'idle':
      default:
        return {
          ring: 'border-cyan-800 shadow-[0_0_30px_rgba(22,78,99,0.4)]',
          inner: 'bg-cyan-900/50 hover:bg-cyan-800 transition-colors',
          icon: '🎙️',
          container: ''
        };
    }
  };

  const style = getStyles();

  return (
    <div className="flex flex-col items-center justify-center py-10">
      {/* Container interactiv */}
      <div 
        onClick={onClick}
        className={`relative w-48 h-48 flex items-center justify-center cursor-pointer transition-all duration-500 ${style.container}`}
      >
        {/* Inelul exterior (Glow + Border) */}
        <div className={`absolute inset-0 rounded-full border-4 ${style.ring} transition-all duration-500`}></div>
        
        {/* Cercul secundar (ripple effect for listening) */}
        {status === 'listening' && (
          <div className="absolute inset-0 rounded-full border border-red-500 animate-ping-slow opacity-50"></div>
        )}

        {/* Miezul central */}
        <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl shadow-inner ${style.inner} transition-all duration-300`}>
          <span className="filter drop-shadow-lg">{style.icon}</span>
        </div>
      </div>

      {/* Text status indicator */}
      <div className="mt-6 text-jarvis-blue font-mono tracking-widest text-sm uppercase opacity-80">
        STATUS: {status}
      </div>
    </div>
  );
};