// lib/ai/metaDetection.ts
// v3.x: META_TOOLING - Pattern-based detection voor tool-gerelateerde vragen

/**
 * Detecteert META_TOOLING vragen zonder AI-classificatie.
 *
 * Deze patterns matchen vragen over:
 * - Hoe werkt de wizard/tool/chat?
 * - Wat moet ik invullen?
 * - Waar ben ik?
 * - Help/uitleg vragen
 *
 * @returns true als de query een meta-vraag is over de tool zelf
 */
export function detectMetaTooling(query: string): boolean {
  const q = query.toLowerCase().trim();

  const patterns = [
    // Hoe werkt...
    /hoe\s+(werkt|gebruik\s+(ik|je)|start|begin)/i,

    // Wat moet ik...
    /wat\s+moet\s+ik(\s+(invullen|doen|vertellen))?/i,

    // Waar ben...
    /waar\s+ben\s+(ik|je)/i,

    // Help/uitleg
    /\b(help|uitleg|wizard)\b/i,

    // Wat doet/is deze...
    /wat\s+(doet|is)\s+(deze\s+)?(tool|chat|assistent)/i,

    // Kun je me helpen met...
    /kun\s+je\s+(me\s+)?helpen/i,
  ];

  return patterns.some((pattern) => pattern.test(q));
}

/**
 * Detecteert of dit het eerste bericht is (onboarding).
 *
 * @param messageHistory - Array van eerdere berichten
 * @returns true als dit het eerste user bericht is
 */
export function isOnboardingMessage(
  messageHistory: Array<{ role: string; content: string }>
): boolean {
  if (!messageHistory || messageHistory.length === 0) {
    return true;
  }

  // Tel alleen user messages (system messages tellen niet)
  const userMessages = messageHistory.filter((m) => m.role === "user");
  return userMessages.length === 0;
}
