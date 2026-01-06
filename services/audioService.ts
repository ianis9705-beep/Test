/**
 * Serviciu pentru Text-to-Speech (TTS) și Speech-to-Text (STT)
 * Folosește API-urile native ale browserului pentru a rula 100% local.
 */

// --- Text to Speech ---

export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  return window.speechSynthesis.getVoices();
};

export const speakText = (text: string, voiceName: string, onEnd?: () => void) => {
  // Oprim orice vorbire curentă
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Căutăm vocea preferată
  const voices = window.speechSynthesis.getVoices();
  const selectedVoice = voices.find(v => v.name === voiceName);
  
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  // Setări de bază pentru a suna mai natural
  utterance.rate = 1.0; 
  utterance.pitch = 1.0;

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = (e) => {
      console.error("TTS Error", e);
      onEnd();
    };
  }

  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  window.speechSynthesis.cancel();
};

// --- Speech to Text ---

// Aceasta este o clasă helper pentru a gestiona recunoașterea vocală
export class SpeechRecognizer {
  recognition: any;
  isListening: boolean = false;

  constructor(
    onResult: (text: string) => void, 
    onEnd: () => void,
    onError: (err: any) => void
  ) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error("Browser-ul nu suportă Speech API.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false; // Se oprește automat după ce utilizatorul tace
    this.recognition.interimResults = false;
    this.recognition.lang = 'ro-RO'; // Default română, poate fi configurabil

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    this.recognition.onerror = (event: any) => {
      console.error("STT Error:", event.error);
      this.isListening = false;
      onError(event.error);
    };
  }

  start() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
      } catch (e) {
        console.error("Could not start recognition", e);
      }
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}