// scripts/generate-embeddings.ts
// ✅ Generate OpenAI embeddings for kennisbank items and store in Supabase pgvector

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';

// Load environment variables BEFORE anything else
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Verify env vars are loaded
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL in .env.local');
  console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPA') || k.includes('OPENAI')));
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error('❌ Missing OPENAI_API_KEY in .env.local');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`   SUPABASE_URL: ${SUPABASE_URL.substring(0, 30)}...`);

// Create clients directly (not importing from lib/)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Import data files
import { kennisbankData } from '../kennisbank_geordend2.data';
import { kennisbankData as bouwdossierKennis } from '../kennisbank_bouwdossier.data';
import { kennisbankVergunningen } from '../kennisbank_vergunningen.data';

const allKennisData = [...kennisbankData, ...bouwdossierKennis, ...kennisbankVergunningen];

// ===================================================================
// CONFIGURATIE
// ===================================================================

const EMBEDDING_MODEL = 'text-embedding-3-small';
const VECTOR_TABLE = 'knowledge_vectors';

// ===================================================================
// MAIN FUNCTIE
// ===================================================================

async function generateEmbeddings() {
  console.log(`\n--- START: Genereren van embeddings voor ${allKennisData.length} kennisblokken ---`);

  if (allKennisData.length === 0) {
    console.log('Geen data gevonden om te verwerken.');
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const item of allKennisData) {
    if (!item.id) {
      console.error('❌ Item mist ID. Overslaan.');
      errorCount++;
      continue;
    }

    // Combineer de velden voor de beste vector representatie
    const textToEmbed = `${item.titel}. ${item.samenvatting}. ${item.inhoud}`;

    try {
      // 1. Genereer embedding via OpenAI
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: textToEmbed,
      });

      const embedding = response.data[0].embedding;

      // 2. Sla op in Supabase
      const { error } = await supabase
        .from(VECTOR_TABLE)
        .upsert(
          {
            item_id: item.id,
            embedding: embedding,
          },
          {
            onConflict: 'item_id',
          }
        );

      if (error) {
        console.error(`❌ Fout bij opslaan ${item.id}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ ${item.id}`);
        successCount++;
      }

      // Rate limiting - wacht 100ms tussen requests
      await new Promise((r) => setTimeout(r, 100));
    } catch (apiError: any) {
      console.error(`❌ API fout bij ${item.id}:`, apiError?.message || apiError);
      errorCount++;

      // Bij rate limit of auth error, stop
      if (apiError?.status === 429 || apiError?.status === 401) {
        console.error('Kritieke API fout. Script gestopt.');
        break;
      }
    }
  }

  console.log(`\n--- KLAAR ---`);
  console.log(`✅ Succesvol: ${successCount}`);
  console.log(`❌ Fouten: ${errorCount}`);
  console.log(`\nSemantic search is nu beschikbaar in Kennisbank.ts`);
}

generateEmbeddings();
