import { Message, AppSettings } from '../types';

/**
 * MemoryService - Faza 2
 * Gestionează memoria pe termen lung a lui Jarvis folosind LocalStorage.
 * Nu necesită Vector DB, păstrează totul local în browser.
 */

const STORAGE_KEYS = {
  SETTINGS: 'jarvis_settings',
  HISTORY: 'jarvis_chat_history'
};

export const MemoryService = {
  // --- Settings ---
  
  saveSettings: (settings: AppSettings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error("Memory Save Error (Settings):", e);
    }
  },

  loadSettings: (defaultSettings: AppSettings): AppSettings => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch (e) {
      console.error("Memory Load Error (Settings):", e);
      return defaultSettings;
    }
  },

  // --- Chat History ---

  saveConversation: (messages: Message[]) => {
    try {
      // Limităm istoricul la ultimele 50 de mesaje pentru performanță
      const recentMessages = messages.slice(-50);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(recentMessages));
    } catch (e) {
      console.error("Memory Save Error (History):", e);
    }
  },

  loadConversation: (): Message[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Memory Load Error (History):", e);
      return [];
    }
  },

  clearMemory: () => {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  }
};