// lib/chat/applyChatResponse.ts
export type ChatResponse = {
  assistant?: string;
  patch?: Record<string, any>;
  __focus?: string | null;
  missing_fields?: string[];
  completion_score?: number;
  handoff_suggested?: boolean;
};

function safeDispatch(name: string, detail?: any) {
  try {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(name, { detail }));
  } catch {}
}

/** /api/chat → UI events (wizard:patch, ui:focus, ui:handoff). */
export function applyChatResponse(resp: ChatResponse) {
  if (!resp || typeof resp !== 'object') return;

  if (resp.patch && Object.keys(resp.patch).length > 0) {
    safeDispatch('wizard:patch', { patch: resp.patch, source: 'chat' });
  }
  if (resp.__focus) {
    safeDispatch('ui:focus', { target: resp.__focus, source: 'chat' });
  }
  if (resp.handoff_suggested) {
    safeDispatch('ui:handoff', { reason: 'chat-suggested', source: 'chat' });
  }
}
