import React, { useState, useEffect } from 'react';
import { AppSettings, OllamaModel } from '../types';
import { OllamaService } from '../services/ollamaService';
import { getAvailableVoices } from '../services/audioService';

interface SettingsPanelProps {
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSave }) => {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [loading, setLoading] = useState(false);

  // Încărcăm modelele și vocile la montare
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const fetchedModels = await OllamaService.getModels(localSettings.ollamaUrl);
      setModels(fetchedModels);
      
      // Vocile se încarcă asincron în unele browsere
      let availableVoices = getAvailableVoices();
      if (availableVoices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          setVoices(getAvailableVoices());
        };
      } else {
        setVoices(availableVoices);
      }
      setLoading(false);
    };
    fetchData();
  }, [localSettings.ollamaUrl]);

  const handleChange = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSave(newSettings); // Auto-save pentru simplitate
  };

  return (
    <div className="bg-jarvis-panel border border-white/10 p-6 rounded-xl max-w-2xl mx-auto w-full">
      <h2 className="text-xl font-bold text-jarvis-blue mb-6 border-b border-white/10 pb-2">
        Configurare Sistem
      </h2>

      <div className="space-y-6">
        {/* Ollama URL */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Ollama URL
          </label>
          <input
            type="text"
            value={localSettings.ollamaUrl}
            onChange={(e) => handleChange('ollamaUrl', e.target.value)}
            className="w-full bg-black/50 border border-gray-700 rounded px-3 py-2 text-white focus:border-jarvis-blue focus:outline-none"
          />
          <p className="text-xs text-gray-600 mt-1">Asigură-te că rulezi `OLLAMA_ORIGINS="*" ollama serve`</p>
        </div>

        {/* Model Select */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Model LLM
          </label>
          {loading ? (
            <div className="text-sm text-yellow-500">Detecting models...</div>
          ) : (
            <select
              value={localSettings.model}
              onChange={(e) => handleChange('model', e.target.value)}
              className="w-full bg-black/50 border border-gray-700 rounded px-3 py-2 text-white focus:border-jarvis-blue focus:outline-none"
            >
              <option value="">Selectează un model...</option>
              {models.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name} ({(m.size / 1024 / 1024 / 1024).toFixed(1)} GB)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Voice Select */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Voce Sistem (TTS)
          </label>
          <select
            value={localSettings.voiceName}
            onChange={(e) => handleChange('voiceName', e.target.value)}
            className="w-full bg-black/50 border border-gray-700 rounded px-3 py-2 text-white focus:border-jarvis-blue focus:outline-none"
          >
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>

        {/* Voice Output Toggle */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="useVoice"
            checked={localSettings.useVoiceOutput}
            onChange={(e) => handleChange('useVoiceOutput', e.target.checked)}
            className="w-4 h-4 rounded border-gray-700 text-jarvis-blue bg-black focus:ring-jarvis-blue"
          />
          <label htmlFor="useVoice" className="text-sm font-medium text-gray-300">
            Activează răspunsul vocal (Jarvis vorbește)
          </label>
        </div>
      </div>
    </div>
  );
};