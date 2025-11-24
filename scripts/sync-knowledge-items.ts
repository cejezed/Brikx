// scripts/sync-knowledge-items.ts
// ✅ Sync kennisbank data to Supabase knowledge_items table
// Run with: npm run sync-knowledge

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables BEFORE anything else
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Verify env vars are loaded
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Missing SUPABASE_URL');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('✅ Environment variables loaded');

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Import data files
import { kennisbankData } from '../kennisbank_geordend2.data';
import { kennisbankData as bouwdossierKennis } from '../kennisbank_bouwdossier.data';
import { kennisbankVergunningen } from '../kennisbank_vergunningen.data';

const allKennisData = [...kennisbankData, ...bouwdossierKennis, ...kennisbankVergunningen];

// Chapter mapping
const CHAPTER_MAPPING: Record<string, number> = {
  'basis': 1,
  'ruimtes': 2,
  'wensen': 3,
  'budget': 4,
  'techniek': 5,
  'duurzaamheid': 6,
  'duurzaam': 6,
  'risico': 7,
};

function getChapterNumber(onderwerpen: readonly string[] | undefined): number {
  if (!onderwerpen || !Array.isArray(onderwerpen)) return 1;

  for (const onderwerp of onderwerpen) {
    if (typeof onderwerp !== 'string') continue;
    const lower = onderwerp.toLowerCase();
    for (const [key, num] of Object.entries(CHAPTER_MAPPING)) {
      if (lower.includes(key)) return num;
    }
  }
  return 1; // Default to basis
}

async function syncKnowledgeItems() {
  console.log(`\n--- START: Syncing ${allKennisData.length} kennisblokken to knowledge_items ---\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const item of allKennisData) {
    if (!item.id) {
      console.error('❌ Item mist ID. Overslaan.');
      errorCount++;
      continue;
    }

    // Support both formats: item.onderwerpen (new) or item.tags.onderwerpen (old)
    const onderwerpen = (item as any).onderwerpen || (item as any).tags?.onderwerpen || [];
    const projectsoorten = (item as any).projectsoorten || (item as any).tags?.projectsoorten || [];
    const chapter = (item as any).chapter || getChapterNumber(onderwerpen);

    const record = {
      id: item.id,
      chapter: chapter,
      title: (item as any).titel || '',
      summary: (item as any).samenvatting || '',
      content: (item as any).inhoud || '',
      onderwerpen: Array.isArray(onderwerpen) ? onderwerpen as string[] : [],
      projectsoorten: Array.isArray(projectsoorten) ? projectsoorten as string[] : [],
    };

    try {
      const { error } = await supabase
        .from('knowledge_items')
        .upsert(record, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Fout bij ${item.id}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ ${item.id}`);
        successCount++;
      }
    } catch (err: any) {
      console.error(`❌ Exception bij ${item.id}:`, err?.message || err);
      errorCount++;
    }
  }

  console.log(`\n--- KLAAR ---`);
  console.log(`✅ Succesvol: ${successCount}`);
  console.log(`❌ Fouten: ${errorCount}`);
  console.log(`\nKnowledge items zijn nu beschikbaar voor semantic search.`);
}

syncKnowledgeItems();
