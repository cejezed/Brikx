// lib/chat/patchTypes.ts
// Centrale, tolerante definitie voor server/Chat patches (losgekoppeld van de store).

export type PatchEvent =
  | {
      target?: 'triage' | 'chapterAnswers' | 'ui' | string;
      payload?: any;
      stateVersion?: number;
    }
  | {
      triage?: Record<string, any>;
      chapterAnswers?: Record<string, any>;
    }
  | Record<string, any>;
