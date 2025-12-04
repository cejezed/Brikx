// scripts/generate-customer-embeddings.ts
// One-time script om embeddings te genereren voor bestaande customer_examples

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables BEFORE importing ExampleMatcher
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Verify env vars
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENAI_API_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL:', !!SUPABASE_URL);
  console.error('  - SUPABASE_SERVICE_ROLE_KEY:', !!SUPABASE_SERVICE_KEY);
  console.error('  - OPENAI_API_KEY:', !!OPENAI_API_KEY);
  process.exit(1);
}

console.log('✅ Environment variables loaded');

// Now import ExampleMatcher
import { ExampleMatcher } from '../lib/insights/ExampleMatcher';

async function main() {
  const matcher = new ExampleMatcher();

  console.log('🚀 Starting embedding generation for customer_examples...\n');

  // Check hoeveel examples nog geen embedding hebben
  const totalMissing = await matcher.countMissingEmbeddings();
  console.log(`📊 Found ${totalMissing} examples without embeddings\n`);

  if (totalMissing === 0) {
    console.log('✅ All examples already have embeddings!');
    return;
  }

  let totalProcessed = 0;
  let hasMore = true;
  const batchSize = 50; // Process 50 at a time

  while (hasMore && totalProcessed < totalMissing) {
    console.log(`\n📦 Processing batch ${Math.floor(totalProcessed / batchSize) + 1}...`);

    const processed = await matcher.generateMissingEmbeddings(batchSize);

    if (processed === 0) {
      hasMore = false;
      console.log('\n✅ No more examples to process');
    } else {
      totalProcessed += processed;
      console.log(`\n✓ Batch complete. Total progress: ${totalProcessed}/${totalMissing} (${Math.round((totalProcessed / totalMissing) * 100)}%)`);

      // Pause tussen batches (rate limiting safety)
      if (hasMore && totalProcessed < totalMissing) {
        console.log('⏸️  Pausing 5 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  console.log('\n🎉 Embedding generation complete!');
  console.log(`📈 Total processed: ${totalProcessed} examples`);
}

main()
  .then(() => {
    console.log('\n✅ Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
