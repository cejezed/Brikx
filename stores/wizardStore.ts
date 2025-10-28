'use client';

import { create } from 'zustand';

export type Archetype = 'nieuwbouw' | 'verbouwing' | 'renovatie' | 'duurzaam';

type WizardState = {
  archetype: Archetype | null;
  setArchetype: (a: Archetype) => void;
};

export const useWizardStore = create<WizardState>((set) => ({
  archetype: null,
  setArchetype: (a) => set({ archetype: a }),
}));
