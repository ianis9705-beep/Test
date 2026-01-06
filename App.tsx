import React, { useState, useEffect, useRef } from 'react';
import { Message, JarvisStatus, AppSettings, Tool } from './types';
import { JarvisAvatar } from './components/JarvisAvatar';
import { ChatInterface } from './components/ChatInterface';
import { SettingsPanel } from './components/SettingsPanel';
import { ToolList } from './components/ToolList';
import { OllamaService } from './services/ollamaService';
import { MemoryService } from './services/memoryService';
import { ToolRegistry } from './services/toolRegistry';
import { SpeechRecognizer, speakText, stopSpeaking } from './services/audioService';
import { ArrowLeftIcon, Cog6ToothIcon, WrenchScrewdriverIcon, TrashIcon } from '@heroicons/react/24/solid';

const App: React.FC = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'home' | 'settings' | 'tools'>('home');
  const [status, setStatus] = useState<JarvisStatus>('idle');
  
  // Starea inițială vine din memorie (dacă există), altfel gol
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  
  // Setări implicite
  const defaultSettings: AppSettings = {
    ollamaUrl: 'http://localhost:11434',
    model: '',
    voiceName: '',
    useVoiceOutput: true
  };

  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // Referință pentru recunoașterea vocală
  const recognizerRef = useRef<SpeechRecognizer | null>(null);

  // --- INIT (Load Memory & Tools) ---
  useEffect(() => {
    // 1. Încarcă Setările
    const savedSettings = MemoryService.loadSettings(defaultSettings);
    setSettings(savedSettings);

    // 2. Încarcă Istoricul
    const savedHistory = MemoryService.loadConversation();
    setMessages(savedHistory);

    // 3. Încarcă Tool-urile (Simulare scanare folder)
    setAvailableTools(ToolRegistry.getAvailableTools());

    // 4. Auto-detect model dacă nu există în setări salvate
    if (!savedSettings.model) {
      OllamaService.getModels(savedSettings.ollamaUrl).then(models => {
        if (models.length > 0) {
          const newSettings = { ...savedSettings, model: models[0].name };
          setSettings(newSettings);
          MemoryService.saveSettings(newSettings);
        }
      });
    }
  }, []); // Run once on mount

  // Initialize Speech Recognizer
  useEffect(() => {
    recognizerRef.current = new SpeechRecognizer(
      (text) => handleUserMessage(text),
      () => { if (status === 'listening') setStatus('idle'); },
      (err) => {
        console.error("Speech Error", err);
        setStatus('idle');
      }
    );
  }, [status]);

  // --- HANDLERS ---

  // Salvează setările când sunt modificate în UI
  const handleSettingsSave = (newSettings: AppSettings) => {
    setSettings(newSettings);
    MemoryService.saveSettings(newSettings);
  };

  // Șterge memoria
  const handleClearMemory = () => {
    if (confirm("Ești sigur că vrei să ștergi istoricul conversației?")) {
      setMessages([]);
      MemoryService.clearMemory();
    }
  };

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
    
    // Update local state AND memory
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    MemoryService.saveConversation(updatedMessages);
    
    setInputText('');
    setStatus('thinking');

    try {
      if (!settings.model) {
        throw new Error("Nu este selectat niciun model LLM. Mergi la Setări.");
      }

      // 2. Trimite la Ollama
      const responseText = await OllamaService.chat(
        settings.ollamaUrl,
        settings.model,
        updatedMessages
      );

      // 3. Adaugă răspuns Jarvis
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now()
      };
      
      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);
      MemoryService.saveConversation(finalMessages);

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
        return <SettingsPanel settings={settings} onSave={handleSettingsSave} />;
      case 'tools':
        return <ToolList tools={availableTools} />;
      case 'home':
      default:
        return (
          <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
            {/* Zona Avatar */}
            <div className="flex-none mb-4 relative">
              <JarvisAvatar status={status} onClick={handleMicClick} />
              
              {/* Buton discret Clear Memory */}
              {messages.length > 0 && (
                <button 
                  onClick={handleClearMemory}
                  className="absolute top-0 right-0 p-2 text-gray-600 hover:text-red-500 transition-colors"
                  title="Șterge Memoria Conversației"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-jarvis-blue to-blue-700 shadow-[0_0_15px_rgba(0,240,255,0.3)]"></div>
            <h1 className="text-xl font-bold tracking-wider text-white">JARVIS <span className="text-xs text-jarvis-blue font-normal px-1 border border-jarvis-blue rounded">CORE</span></h1>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('home')}
              className={`p-2 rounded-lg transition-colors ${activeTab === 'home' ? 'text-jarvis-blue bg-white/10' : 'text-gray-400 hover:text-white'}`}
              title="Home (Chat)"
            >
              <ArrowLeftIcon className="h-6 w-6" /> 
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`p-2 rounded-lg transition-colors ${activeTab === 'tools' ? 'text-jarvis-blue bg-white/10' : 'text-gray-400 hover:text-white'}`}
              title="Tools Registry"
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