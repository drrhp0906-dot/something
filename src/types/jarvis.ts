export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'search' | 'read' | 'error' | 'task';
  metadata?: Record<string, unknown>;
}

export interface MissionStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  detail?: string;
}

export interface Mission {
  id: string;
  title: string;
  steps: MissionStep[];
  startedAt: Date;
  completedAt?: Date;
}

export interface Widget {
  id: string;
  title: string;
  type: 'stat' | 'chart' | 'info' | 'mission';
  data?: Record<string, unknown>;
}

export interface LLMProvider {
  name: string;
  type: 'builtin' | 'huggingface' | 'ollama';
  isConfigured: boolean;
  endpoint?: string;
  model?: string;
  token?: string;
}

export interface JarvisConfig {
  aiProvider: LLMProvider;
  voiceEnabled: boolean;
  autoSpeak: boolean;
  personality: 'jarvis' | 'friday';
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface ReadResult {
  title: string;
  content: string;
  url: string;
}
