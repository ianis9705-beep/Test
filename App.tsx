import React, { useState, useEffect, useRef } from 'react';
import { Message, JarvisStatus, AppSettings } from './types';
import { JarvisAvatar } from './components/JarvisAvatar';
import { ChatInterface } from './components/ChatInterface';
import { SettingsPanel } from './components/SettingsPanel';
import { OllamaService } from './services/ollamaService';
import { SpeechRecognizer, speakText, stopSpeaking } from './services/audioService';
import { ArrowLeftIcon, Cog6ToothIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/solid';

const App: React.FC = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'home' | 'settings' | 'tools'>('home');
  const [status, setStatus] = useState<JarvisStatus>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Setări implicite
  const [settings, setSettings] = useState<AppSettings>({
    ollamaUrl: 'http://localhost:11434',
    model: '', // Va fi setat automat dacă e gol
    voiceName: '',
    useVoiceOutput: true
  });

  // Referință pentru recunoașterea vocală pentru a persista între randări
  const recognizerRef = useRef<SpeechRecognizer | null>(null);

  // --- INIT ---
  useEffect(() => {
    // Încercăm să selectăm un model default dacă nu există unul
    if (!settings.model) {
      OllamaService.getModels(settings.ollamaUrl).then(models => {
        if (models.length > 0) {
          setSettings(prev => ({ ...prev, model: models[0].name }));
        }
      });
    }
  }, [settings.ollamaUrl, settings.model]);

  // Inițializare Speech Recognizer
  useEffect(() => {
    recognizerRef.current = new SpeechRecognizer(
      (text) => {
        // Când primim text de la microfon
        handleUserMessage(text);
      },
      () => {
        // Când se oprește ascultarea (fără rezultat sau eroare)
        if (status === 'listening') setStatus('idle');
      },
      (err) => {
        console.error("Speech Error", err);
        setStatus('idle');
      }
    );
  }, [status]); // Re-creăm dacă status se schimbă (simplificare pentru scope)

  // --- HANDLERS ---

  const handleMicClick = () => {
    if (status === 'speaking') {
      stopSpeaking();
      setStatus('idle');
      return;
    }

    if (status === 'listening') {
      recognizerRef.current?.stop();
      setStatus('idle');
    } else {
      setStatus('listening');
      recognizerRef.current?.start();
    }
  };

  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;

    // 1. Adaugă mesaj utilizator
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setStatus('thinking');

    try {
      // 2. Trimite la Ollama
      if (!settings.model) {
        throw new Error("Nu este selectat niciun model LLM. Mergi la Setări.");
      }

      const responseText = await OllamaService.chat(
        settings.ollamaUrl,
        settings.model,
        [...messages, userMsg]
      );

      // 3. Adaugă răspuns Jarvis
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);

      // 4. Speak (TTS)
      if (settings.useVoiceOutput) {
        setStatus('speaking');
        speakText(responseText, settings.voiceName, () => {
          setStatus('idle');
        });
      } else {
        setStatus('idle');
      }

    } catch (error: any) {
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: `Eroare: ${error.message || 'Ceva nu a mers bine.'}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
      setStatus('idle');
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUserMessage(inputText);
  };

  // --- RENDER ---

  const renderContent = () => {
    switch (activeTab) {
      case 'settings':
        return <SettingsPanel settings={settings} onSave={setSettings} />;
      case 'tools':
        return (
          <div className="text-center p-10 text-gray-500">
            <WrenchScrewdriverIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl">Modulul Tools</h2>
            <p>Faza 3: Aici vor fi încărcate automat uneltele din folder.</p>
          </div>
        );
      case 'home':
      default:
        return (
          <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
            {/* Zona Avatar */}
            <div className="flex-none mb-4">
              <JarvisAvatar status={status} onClick={handleMicClick} />
            </div>

            {/* Zona Chat */}
            <ChatInterface messages={messages} />

            {/* Zona Input Text */}
            <form onSubmit={handleTextSubmit} className="mt-4 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Scrie un mesaj..."
                className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:border-jarvis-blue focus:outline-none transition-colors"
                disabled={status === 'listening' || status === 'thinking'}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || status === 'thinking'}
                className="bg-jarvis-blue text-black font-bold px-6 py-3 rounded-lg hover:bg-cyan-300 disabled:opacity-50 transition-colors"
              >
                TRIMITE
              </button>
            </form>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-jarvis-dark text-gray-200 font-sans selection:bg-jarvis-blue selection:text-black">
      {/* Header / Nav */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-jarvis-blue to-blue-700"></div>
            <h1 className="text-xl font-bold tracking-wider text-white">JARVIS <span className="text-xs text-jarvis-blue font-normal px-1 border border-jarvis-blue rounded">LOCAL</span></h1>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('home')}
              className={`p-2 rounded-lg transition-colors ${activeTab === 'home' ? 'text-jarvis-blue bg-white/10' : 'text-gray-400 hover:text-white'}`}
              title="Home"
            >
              <ArrowLeftIcon className="h-6 w-6" /> 
              {/* Note: Icon used as 'Back to Home' metaphor */}
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`p-2 rounded-lg transition-colors ${activeTab === 'tools' ? 'text-jarvis-blue bg-white/10' : 'text-gray-400 hover:text-white'}`}
              title="Tools"
            >
              <WrenchScrewdriverIcon className="h-6 w-6" />
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-lg transition-colors ${activeTab === 'settings' ? 'text-jarvis-blue bg-white/10' : 'text-gray-400 hover:text-white'}`}
              title="Settings"
            >
              <Cog6ToothIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-4 md:p-6 pb-20 h-[calc(100vh-64px)] overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;