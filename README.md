# Jarvis Web AI (Local)

Un asistent personal AI modular, care rulează 100% local în browser, folosind Ollama ca backend.

## 🚀 Cum să pornești rapid

### Cerințe prealabile
1. **Ollama**: Descarcă și instalează [Ollama](https://ollama.ai).
2. **Node.js**: Descarcă și instalează [Node.js](https://nodejs.org).

### Pasul 1: Configurează Ollama (FOARTE IMPORTANT)

Dacă tocmai ai instalat Ollama, **dă restart la PC** sau închide toate terminalele.

Deschide **Command Prompt (CMD)** și rulează comanda asta pentru a permite conexiunea:

```cmd
set OLLAMA_ORIGINS=* && ollama serve
```

*(Dacă folosești PowerShell, comanda este: `$env:OLLAMA_ORIGINS="*"; ollama serve`)*

Lasă fereastra cu Ollama deschisă!

### Pasul 2: Pornește Jarvis
**Windows:**
Dublu-click pe fișierul `INSTALL_WINDOWS.bat`.

**Mac / Linux:**
Deschide un terminal în acest folder și rulează:
```bash
chmod +x INSTALL_MAC_LINUX.sh
./INSTALL_MAC_LINUX.sh
```

Aplicația se va deschide automat în browser la adresa `http://localhost:3000`.

## 🛠️ Caracteristici

- **Faza 1:** Chat Text & Voice (Speech-to-Text & Text-to-Speech)
- **Faza 2:** Memorie Locală (Conversațiile se salvează în browser)
- **Faza 3:** Arhitectură Modulară (Detectare automată tool-uri)

## 🏗️ Tehnologii
- React + TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- Web Speech API (Voce nativă)
- LocalStorage (Persistență)