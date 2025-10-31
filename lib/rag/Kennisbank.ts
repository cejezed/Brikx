// /lib/rag/Kennisbank.ts

export class Kennisbank {
  static async query(
    _query: string,
    _options: { chapter?: string; isPremium?: boolean }
  ) {
    return { topicId: "general", docs: [], cacheHit: false };
  }
}
