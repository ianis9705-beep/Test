// Definim stările posibile ale lui Jarvis pentru a controla UI-ul și logica
export type JarvisStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

// Rolurile în conversație
export type Role = 'user' | 'assistant' | 'system';

// Structura unui mesaj
export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

// Modelul pentru configurarea aplicației
export interface AppSettings {
  ollamaUrl: string;
  model: string;
  voiceName: string; // Numele vocii browserului
  useVoiceOutput: boolean;
}

// Interfața pentru un model Ollama
export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

// Extindem Window pentru Speech Recognition (API experimental în unele browsere)
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}