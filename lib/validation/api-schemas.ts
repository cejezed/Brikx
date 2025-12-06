// lib/validation/api-schemas.ts
// Zod validation schemas for API endpoints

import { z } from 'zod';

// Chat API validation
export const ChatRequestSchema = z.object({
  query: z.string().min(1).max(2000, 'Query too long'),
  wizardState: z.object({}).passthrough(), // Allow any shape for now
  mode: z.enum(['PREVIEW', 'PREMIUM']),
  clientFastIntent: z.object({
    type: z.string(),
    confidence: z.number(),
    action: z.string().optional(),
    chapter: z.string().optional(),
    field: z.string().optional(),
  }).optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(5000),
  })).max(50).optional(),
});

// Expert API validation
export const ExpertRequestSchema = z.object({
  query: z.string().max(500).optional(),
  focusKey: z.string().max(200).optional(),
  chapter: z.string().optional(),
  basisData: z.object({}).passthrough().optional(),
});

// Insights API validation
export const InsightsRequestSchema = z.object({
  context: z.object({
    currentChapter: z.enum(['basis', 'wensen', 'ruimtes', 'budget', 'techniek', 'duurzaam', 'risico']),
    focusedField: z.string().nullable().optional(),
    chapterAnswers: z.object({}).passthrough().optional(),
    userQuery: z.string().max(500).optional(),
    roomType: z.string().optional(),
  }),
});
