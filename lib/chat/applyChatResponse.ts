// lib/chat/applyChatResponse.ts
// Vertaal serverresponses (LLM/function-calls) naar WizardState patches en UI-focus.

import { useWizardState } from '@/lib/stores/useWizardState';
import { useUiStore } from '@/lib/stores/useUiStore';

// Verwacht basisvorm van /api/chat response
type ChatApiResponse = {
  assistant?: string;
  // "patch" past wizardstate aan – keys zijn domain-specifiek
  patch?: {
    basis?: Partial<ReturnType<typeof useWizardState.getState>['basis']>;
    budget?: { bedrag?: number | null };
    add_room?: { type: 'woonkamer' | 'keuken' | 'slaapkamer' | 'badkamer' | 'overig'; naam?: string; oppM2?: number };
    techniek?: Partial<ReturnType<typeof useWizardState.getState>['techniek']>;
    triage?: Partial<ReturnType<typeof useWizardState.getState>['triage']>;
  };
  // "focus" zet spotlight op chapter:field
  focus?: string; // bijv. "budget:bedrag", "ruimtes:naam", "techniek:isolatie"
  // "goto" opent een specifiek hoofdstuk
  goto?: 'basis' | 'wensen' | 'budget' | 'ruimtes' | 'techniek' | 'duurzaamheid' | 'risico' | 'preview';
};

export function applyChatResponse(resp: ChatApiResponse | null | undefined) {
  if (!resp) return;

  const ws = useWizardState.getState();
  const ui = useUiStore.getState();

  // Patch wizard data
  if (resp.patch) {
    if (resp.patch.triage) {
      ws.setTriage(resp.patch.triage);
    }
    if (resp.patch.basis) {
      ws.setBasis(resp.patch.basis);
    }
    if (resp.patch.budget) {
      ws.setBudget(resp.patch.budget.bedrag ?? null);
    }
    if (resp.patch.add_room) {
      const id = ws.addRoom(resp.patch.add_room);
      // focus op de zojuist toegevoegde ruimte-naam
      ui.setFocusedField(`ruimtes:naam`);
    }
    if (resp.patch.techniek) {
      ws.setTechniek(resp.patch.techniek);
    }
  }

  // Navigatie
  if (resp.goto) {
    ws.goToChapter(resp.goto);
  }

  // Focus/spotlight
  if (resp.focus) {
    ui.setFocusedField(resp.focus as any);
  }
}
