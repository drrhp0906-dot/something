# Architecture — JARVIS / F.R.I.D.A.Y AI Assistant

## System Overview

```
┌──────────────────────────────────────────────────────────┐
│                      BROWSER (Client)                     │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  ChatPanel   │  │  StatusBar   │  │  ArcReactor    │  │
│  │  (messages)  │  │  (settings)  │  │  (animation)   │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────────┘  │
│         │                  │                              │
│  ┌──────┴──────────────────┴──────┐                      │
│  │    Zustand Store (useJarvis)   │                      │
│  │  messages | missions | widgets │                      │
│  │  config | isLoading            │                      │
│  └──────────────┬─────────────────┘                      │
│                  │                                        │
│  ┌───────────────┼─────────────────┐                     │
│  │  Voice Hooks  │  TTS Hook       │                     │
│  │  (SpeechRec)  │  (SpeechSynth)  │                     │
│  └─────────────────────────────────┘                     │
│                  │ fetch(/api/...)                        │
└──────────────────┼───────────────────────────────────────┘
                   │
┌──────────────────┼───────────────────────────────────────┐
│                  │         SERVER (Next.js API Routes)     │
│         ┌────────┴────────┐                               │
│         │   /api/chat      │                               │
│         └────────┬────────┘                               │
│                  │                                         │
│  ┌───────────────┼────────────────────┐                   │
│  │  Command Router (NLP → Tools)      │                   │
│  │  "search X"  → web_search          │                   │
│  │  "read URL"  → web_reader          │                   │
│  │  "calc X"    → math_eval           │                   │
│  │  otherwise   → llm_chat            │                   │
│  └───────────────┼────────────────────┘                   │
│                  │                                         │
│  ┌───────────────┼────────────────────┐                   │
│  │  Free LLM System                  │                   │
│  │  ┌──────────┐ ┌────────────┐ ┌────┴──┐              │
│  │  │ Built-in │ │ HuggingFace│ │ Ollama│              │
│  │  │ (rules)  │ │ (free API) │ │(local)│              │
│  │  └──────────┘ └────────────┘ └───────┘              │
│  └────────────────────────────────────┘                   │
│                                                           │
│  ┌────────────────────────────────────┐                   │
│  │  Tools                             │                   │
│  │  ┌──────────────┐ ┌─────────────┐ │                   │
│  │  │ DuckDuckGo   │ │ URL Reader  │ │                   │
│  │  │ Search (FREE)│ │ (FREE)      │ │                   │
│  │  └──────────────┘ └─────────────┘ │                   │
│  └────────────────────────────────────┘                   │
└────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Client-Side Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `page.tsx` | Main layout: Arc Reactor + Chat + Mission + Dashboard | — |
| `StatusBar` | Top bar with status, time, settings | — |
| `ChatPanel` | Chat messages + input + voice controls | — |
| `ChatMessage` | Individual message bubble with markdown | `message: ChatMessage` |
| `ArcReactor` | Animated SVG arc reactor | `size: sm/md/lg` |
| `HolographicPanel` | Glowing translucent panel wrapper | `title, glowColor` |
| `MissionPanel` | Task steps with progress bar | `mission: Mission` |
| `SystemMetrics` | Live simulated system metrics | — |
| `WidgetDashboard` | Responsive widget grid | — |
| `Widget` | Stat/Chart/Info/Mission card | `widget: Widget` |
| `VoiceWaveform` | Audio visualization canvas | `isActive, isSpeaking` |

### State Management (Zustand)

```
useJarvisStore
├── messages: ChatMessage[]        # Chat history
├── isLoading: boolean             # API call in progress
├── missions: Mission[]            # Task history
├── activeMission: Mission | null  # Current mission
├── widgets: Widget[]              # Dashboard widgets
├── config: JarvisConfig           # AI provider + settings
├── addMessage()                   # Add chat message
├── addWidget() / removeWidget()   # Manage dashboard
├── setConfig() / setAIProvider()  # Update settings
└── addMission() / updateMissionStep()  # Track tasks
```

### AI Provider System

The AI provider system is designed to be modular and free:

1. **Built-in Provider** (default)
   - Rule-based system with pattern matching
   - Handles: greetings, time, math, status, identity, jokes, help, widget commands
   - Personality-aware (JARVIS vs F.R.I.D.A.Y)
   - Zero latency, no API calls

2. **HuggingFace Provider** (optional)
   - Calls HuggingFace Inference API (free tier)
   - Rate limited but genuinely intelligent
   - Requires free HF token from huggingface.co

3. **Ollama Provider** (optional)
   - Calls local Ollama instance
   - Unlimited, private, no internet needed
   - Requires Ollama installation + model download

### Command Flow

```
User Input → Command Router → Tool Detection → Tool Execution → LLM Response
                                                        │
                    ┌───────────────────────────────────┤
                    │                                   │
              "search X"                            "read URL"
                    │                                   │
                    ▼                                   ▼
          DuckDuckGo Search                    Fetch + Strip HTML
                    │                                   │
                    ▼                                   ▼
          SearchResult[]                       ReadResult
                    │                                   │
                    └───────────┬───────────────────────┘
                                │
                                ▼
                     LLM Response (with tool results)
                                │
                                ▼
                        Chat Message Display
                                │
                                ▼
                     Optional TTS Auto-Speak
```

### Voice Pipeline

```
User clicks Mic → SpeechRecognition API → Transcript → handleSendMessage()
                                                        │
                                                        ▼
                                              /api/chat → Response
                                                        │
                                                        ▼
                                    If autoSpeak: SpeechSynthesis API → Audio
```

## API Routes

| Route | Method | Input | Output | Cost |
|-------|--------|-------|--------|------|
| `/api/chat` | POST | `{ messages, config }` | `{ response, searchResults?, widgetAction? }` | FREE |
| `/api/search` | POST | `{ query }` | `{ results: SearchResult[] }` | FREE |
| `/api/read-url` | POST | `{ url }` | `{ result: ReadResult }` | FREE |

## Design Decisions

### Why Built-in AI as Default?
Most AI assistant demos require API keys to even start. We chose to make the built-in rule-based system the default so the app works immediately on first load. The rule system is smart enough to handle common queries (time, math, status, search) and has personality — it genuinely feels like talking to JARVIS.

### Why DuckDuckGo for Search?
DuckDuckGo's HTML endpoint is free, requires no API key, and has no rate limits for reasonable use. It's not as clean as a proper API, but it works reliably for free.

### Why Browser Speech APIs?
Web Speech Recognition and Synthesis are built into modern browsers. They're free, require no server, and work offline. The trade-off is they're not available in all browsers (mainly Chrome/Edge), but we gracefully handle unsupported browsers.

### Why No MediaPipe in v1?
The original project used MediaPipe for hand tracking. While impressive, it adds a heavy dependency (~10MB WASM) and requires camera permissions. We prioritized making the AI brain work first. The StatusBar shows "CAM: Standby" and the README documents how to add it back.

## Extending the System

### Adding a New AI Provider
1. Add provider type to `JarvisConfig` in `types/jarvis.ts`
2. Implement the provider function in `lib/free-llm.ts`
3. Add it to the `getLLMResponse` router
4. Add UI option in `StatusBar.tsx` settings dropdown

### Adding a New Tool
1. Implement the tool in `lib/tools/`
2. Add detection patterns to `command-router.ts`
3. Handle the tool results in `free-llm.ts` (builtin responses)
4. Update `processCommand` in `command-router.ts`

### Adding Hand Tracking Back
1. Install `@mediapipe/tasks-vision`
2. Port `useHandTracking.ts` hook from original project
3. Add `VirtualCursor` and `HandOverlay` components
4. Connect to StatusBar CAM indicator
