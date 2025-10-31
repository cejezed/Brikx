'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Message = { id: string; role: 'user' | 'assistant' | 'system'; text: string };

type ChatStore = {
  messages: Message[];
  pushMessage: (m: Message) => void;
  appendAssistantChunk: (id: string, chunk: string) => void;
  resetAssistantMessage: () => string;
  clearMessages: () => void;
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [],
      pushMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
      appendAssistantChunk: (id, chunk) =>
        set((s) => ({
          messages: s.messages.map((m) => (m.id === id ? { ...m, text: m.text + chunk } : m)),
        })),
      resetAssistantMessage: () => {
        const id = crypto.randomUUID();
        set((s) => ({ messages: [...s.messages, { id, role: 'assistant', text: '' }] }));
        return id;
      },
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'brikx-chat-history',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
