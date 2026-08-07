'use client';

import { create } from 'zustand';
import type { ChatMessage, Mission, Widget, JarvisConfig } from '@/types/jarvis';

interface JarvisStore {
  // Chat
  messages: ChatMessage[];
  isLoading: boolean;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setIsLoading: (loading: boolean) => void;
  clearMessages: () => void;

  // Missions
  missions: Mission[];
  activeMission: Mission | null;
  setActiveMission: (mission: Mission | null) => void;
  addMission: (mission: Mission) => void;
  updateMissionStep: (missionId: string, stepId: string, status: Mission['steps'][0]['status'], detail?: string) => void;

  // Widgets
  widgets: Widget[];
  addWidget: (widget: Widget) => void;
  removeWidget: (id: string) => void;

  // Config
  config: JarvisConfig;
  setConfig: (config: Partial<JarvisConfig>) => void;
  setAIProvider: (provider: Partial<JarvisConfig['aiProvider']>) => void;
}

const defaultConfig: JarvisConfig = {
  aiProvider: {
    name: 'JARVIS Built-in',
    type: 'builtin',
    isConfigured: true,
  },
  voiceEnabled: true,
  autoSpeak: false,
  personality: 'jarvis',
};

const defaultWidgets: Widget[] = [
  { id: 'sys-1', title: 'CPU Utilization', type: 'stat', data: { value: 32, unit: '%', trend: 'up' } },
  { id: 'sys-2', title: 'Memory', type: 'stat', data: { value: 48, unit: '%', trend: 'stable' } },
  { id: 'sys-3', title: 'Network I/O', type: 'chart', data: { points: [12, 18, 15, 22, 19, 25, 21] } },
  { id: 'sys-4', title: 'System Info', type: 'info', data: { text: 'All systems nominal' } },
];

export const useJarvisStore = create<JarvisStore>((set, get) => ({
  // Chat
  messages: [],
  isLoading: false,

  addMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date(),
    };
    set((state) => ({ messages: [...state.messages, newMessage] }));
  },

  setIsLoading: (loading) => set({ isLoading: loading }),

  clearMessages: () => set({ messages: [] }),

  // Missions
  missions: [],
  activeMission: null,

  setActiveMission: (mission) => set({ activeMission: mission }),

  addMission: (mission) => set((state) => ({
    missions: [...state.missions, mission],
    activeMission: mission,
  })),

  updateMissionStep: (missionId, stepId, status, detail) => {
    set((state) => {
      const updateSteps = (steps: Mission['steps']) =>
        steps.map((s) =>
          s.id === stepId ? { ...s, status, detail: detail || s.detail } : s
        );

      const missions = state.missions.map((m) =>
        m.id === missionId ? { ...m, steps: updateSteps(m.steps) } : m
      );

      const activeMission =
        state.activeMission?.id === missionId
          ? { ...state.activeMission, steps: updateSteps(state.activeMission.steps) }
          : state.activeMission;

      return { missions, activeMission };
    });
  },

  // Widgets
  widgets: defaultWidgets,

  addWidget: (widget) => set((state) => ({
    widgets: [...state.widgets, widget],
  })),

  removeWidget: (id) => set((state) => ({
    widgets: state.widgets.length > 0
      ? id ? state.widgets.filter((w) => w.id !== id) : state.widgets.slice(0, -1)
      : state.widgets,
  })),

  // Config
  config: defaultConfig,

  setConfig: (updates) => set((state) => ({
    config: { ...state.config, ...updates },
  })),

  setAIProvider: (provider) => set((state) => ({
    config: {
      ...state.config,
      aiProvider: { ...state.config.aiProvider, ...provider },
    },
  })),
}));
