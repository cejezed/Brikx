import type { ClientFastIntent } from "@/types/chat";

const chapterMap: Record<string, string> = {
  budget: "budget",
  wensen: "wensen",
  ruimtes: "ruimtes",
  techniek: "techniek",
  basis: "basis",
  duurzaamheid: "duurzaamheid",
  risico: "risico",
  preview: "preview",
};

const patterns = {
  navigate: /^(ga\s+naar|open|switch\s+to)\s+(?<chapter>[a-zA-ZÀ-ÿ\-\s]+)$/i,
  budgetDelta:
    /^(?<sign>\+|\-)?\s*(?<amount>\d{2,6})(k|\s?\.?\s?euro|\s?€)?\b.*(budget|begroting)?$/i,
  rooms: /^(?<rooms>[2-9]|1\d)\s*(slaapk?amers?|kamers?)\b/i,
  projectName: /^(project\s*naam|projectnaam|naam)\s*[:=]?\s*(?<name>.+)$/i,
  focusField: /^(focus|cursor)\s+(?<field>[a-zA-Z_][\w\-]*)$/i,
};

export function detectFastIntent(query: string): ClientFastIntent | null {
  const q = query.trim();

  const mNav = q.match(patterns.navigate);
  if (mNav?.groups?.chapter) {
    const chapterRaw = mNav.groups.chapter.toLowerCase().trim();
    const key = chapterMap[chapterRaw] ?? chapterRaw;
    return { type: "NAVIGATE", payload: { chapter: key }, confidence: 0.95 };
  }

  const mBud = q.match(patterns.budgetDelta);
  if (mBud?.groups?.amount) {
    const sign = mBud.groups.sign === "-" ? -1 : 1;
    const amt = Number(mBud.groups.amount);
    const value =
      (isNaN(amt) ? 0 : amt) *
      (mBud[0].toLowerCase().includes("k") ? 1000 : 1) *
      sign;
    return { type: "SET_BUDGET_DELTA", payload: { value }, confidence: 0.9 };
  }

  const mRooms = q.match(patterns.rooms);
  if (mRooms?.groups?.rooms) {
    const rooms = Number(mRooms.groups.rooms);
    return { type: "SET_ROOMS", payload: { rooms }, confidence: 0.85 };
  }

  const mName = q.match(patterns.projectName);
  if (mName?.groups?.name) {
    return {
      type: "SET_PROJECT_NAME",
      payload: { name: mName.groups.name.trim() },
      confidence: 0.9,
    };
  }

  const mFocus = q.match(patterns.focusField);
  if (mFocus?.groups?.field) {
    return {
      type: "FOCUS_FIELD",
      payload: { field: mFocus.groups.field },
      confidence: 0.9,
    };
  }

  return null;
}
