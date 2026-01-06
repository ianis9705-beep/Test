import { OllamaModel, Message } from '../types';

/**
 * Serviciu pentru comunicarea cu API-ul Ollama.
 * URL-ul default este localhost:11434.
 * Necesită ca Ollama să fie pornit cu OLLAMA_ORIGINS="*"
 */

const DEFAULT_URL = 'http://localhost:11434';

export const OllamaService = {
  /**
   * Verifică dacă Ollama este accesibil
   */
  checkConnection: async (baseUrl: string = DEFAULT_URL): Promise<boolean> => {
    try {
      const response = await fetch(`${baseUrl}/`);
      return response.status === 200;
    } catch (e) {
      console.error("Ollama connection failed", e);
      return false;
    }
  },

  /**
   * Obține lista de modele instalate local
   */
  getModels: async (baseUrl: string = DEFAULT_URL): Promise<OllamaModel[]> => {
    try {
      const response = await fetch(`${baseUrl}/api/tags`);
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error("Error fetching models:", error);
      return [];
    }
  },

  /**
   * Trimite chat-ul către Ollama
   * Folosim stream: false pentru simplitate în Faza 1 (așteptăm tot răspunsul înainte de a vorbi)
   */
  chat: async (
    baseUrl: string,
    model: string,
    messages: Message[]
  ): Promise<string> => {
    // Convertim formatul nostru intern de mesaje în formatul Ollama
    const apiMessages = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          messages: apiMessages,
          stream: false // Setăm true în viitor pentru efect de mașină de scris
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.message.content;
    } catch (error) {
      console.error("Chat error:", error);
      throw error;
    }
  }
};