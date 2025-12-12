// lib/ai/helpers/tokenEstimator.ts
// Week 2, Day 9 - Token Estimation Helper
// Purpose: Estimate token count using simple heuristic

/**
 * Estimate token count for a string.
 *
 * Uses simple heuristic: ~4 characters = 1 token
 * This is a rough approximation suitable for context pruning decisions.
 *
 * More accurate tokenization would require a tokenizer library,
 * but this heuristic is fast and sufficient for our needs.
 *
 * @param text - The text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  if (!text || text.length === 0) {
    return 0;
  }

  // ~4 characters = 1 token (simple heuristic)
  const CHARS_PER_TOKEN = 4;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Estimate tokens for an object by stringifying it.
 *
 * @param obj - The object to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokensForObject(obj: unknown): number {
  try {
    const stringified = JSON.stringify(obj);
    return estimateTokens(stringified);
  } catch (error) {
    console.error('[estimateTokensForObject] Error:', error);
    return 0;
  }
}
