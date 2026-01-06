import { Tool } from '../types';

/**
 * ToolRegistry - Faza 3
 * Simulează încărcarea dinamică a tool-urilor.
 * Într-o aplicație completă Node.js, aici s-ar citi un folder de pe disc.
 * Aici definim Metadata pentru modulele existente.
 */

const AVAILABLE_TOOLS: Tool[] = [
  // --- CORE TOOLS ---
  {
    id: 'core-chat',
    name: 'LLM Chat Interface',
    description: 'Modulul principal de conversație. Interfațează cu Ollama API pentru generarea răspunsurilor.',
    version: '1.0.0',
    isEnabled: true,
    type: 'core',
    icon: '💬'
  },
  {
    id: 'core-stt',
    name: 'Voice Input (STT)',
    description: 'Motor de recunoaștere vocală local (Web Speech API). Transformă vocea în text.',
    version: '1.0.0',
    isEnabled: true,
    type: 'core',
    icon: '🎤'
  },
  {
    id: 'core-tts',
    name: 'Voice Output (TTS)',
    description: 'Sinteză vocală locală. Îi oferă lui Jarvis o voce folosind resursele sistemului de operare.',
    version: '1.0.0',
    isEnabled: true,
    type: 'core',
    icon: '🔊'
  },
  {
    id: 'core-memory',
    name: 'Local Memory',
    description: 'Persistență locală. Salvează istoricul conversațiilor și preferințele utilizatorului în browser.',
    version: '0.9.0',
    isEnabled: true,
    type: 'core',
    icon: '💾'
  },

  // --- EXTENSION TOOLS ---
  {
    id: 'ext-calc',
    name: 'Calculator & Unit Converter',
    description: 'Unealtă pentru calcule matematice rapide și conversii de unități (ex: km → mile, °C → °F).',
    version: '0.5.0',
    isEnabled: true,
    type: 'extension',
    icon: '🧮'
  },
  {
    id: 'ext-timer',
    name: 'Reminder & Timer',
    description: 'Setează mementouri și cronometre. Gestionează timpul eficient.',
    version: '0.1.0',
    isEnabled: true,
    type: 'extension',
    icon: '⏰'
  },
  {
    id: 'ext-notes',
    name: 'Note & File Organizer',
    description: 'Manager pentru notițe text și organizarea fișierelor locale.',
    version: '0.2.0',
    isEnabled: true,
    type: 'extension',
    icon: '📝'
  },
  {
    id: 'ext-weather',
    name: 'Weather Checker',
    description: 'Verifică starea vremii (local sau fallback offline).',
    version: '0.8.0',
    isEnabled: true,
    type: 'extension',
    icon: '⛅'
  },
  {
    id: 'ext-search',
    name: 'Quick Search / Wiki',
    description: 'Căutare rapidă în baza de cunoștințe locală sau surse externe simple.',
    version: '0.3.0',
    isEnabled: true,
    type: 'extension',
    icon: '🔍'
  },
  {
    id: 'ext-media',
    name: 'Media Player Control',
    description: 'Control media simplu pentru redarea fișierelor audio/video locale.',
    version: '0.1.0',
    isEnabled: false,
    type: 'extension',
    icon: '⏯️'
  }
];

export const ToolRegistry = {
  /**
   * "Detectează" și returnează toate tool-urile disponibile.
   */
  getAvailableTools: (): Tool[] => {
    // Aici s-ar putea adăuga logică pentru a încărca plugin-uri externe
    return [...AVAILABLE_TOOLS];
  },

  getToolById: (id: string): Tool | undefined => {
    return AVAILABLE_TOOLS.find(t => t.id === id);
  }
};