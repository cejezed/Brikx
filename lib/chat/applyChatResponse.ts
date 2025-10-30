import type { ChatResponse, WizardState, Delta } from "@/types/chat";

export type ApplyResult = { applied: boolean; reason?: string };

function getAtPath(obj: any, path: string) {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function setAtPath(obj: any, path: string, value: any) {
  const parts = path.split(".");
  const last = parts.pop()!;
  const parent = parts.reduce((acc, key) => (acc[key] ??= {}), obj);
  parent[last] = value;
}

function applyDelta(target: any, delta: Delta) {
  const current = getAtPath(target, delta.path);
  if (delta.kind === "number:add") {
    const base = typeof current === "number" ? current : 0;
    setAtPath(target, delta.path, base + (delta.value as number));
  } else if (delta.kind === "array:append") {
    const base = Array.isArray(current) ? current.slice() : [];
    base.push(delta.value);
    setAtPath(target, delta.path, base);
  } else if (delta.kind === "object:merge") {
    const base = typeof current === "object" && current ? { ...current } : {};
    setAtPath(target, delta.path, { ...base, ...(delta.value as object) });
  }
}

export default function applyChatResponse(
  r: ChatResponse,
  state: WizardState
): ApplyResult {
  const { policy, patch } = r;
  if (!patch) return { applied: false, reason: "no-patch" };

  if (policy === "APPLY_OPTIMISTIC" || policy === "APPLY_WITH_INLINE_VERIFY") {
    try {
      state.chapterAnswers = state.chapterAnswers || {};
      state.chapterAnswers[patch.chapter] =
        state.chapterAnswers[patch.chapter] || {};
      applyDelta(state.chapterAnswers, patch.delta);
      state.stateVersion = (state.stateVersion ?? 0) + 1;
      return { applied: true };
    } catch (e) {
      return { applied: false, reason: (e as Error).message };
    }
  }
  return { applied: false, reason: `policy=${policy}` };
}
