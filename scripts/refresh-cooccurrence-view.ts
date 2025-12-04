// scripts/refresh-cooccurrence-view.ts
// Refresh tag_cooccurrence materialized view
// Run dit 1x per dag via cron job of Supabase Edge Function

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function refreshCooccurrenceView() {
  console.log('🔄 Refreshing tag_cooccurrence materialized view...');

  const startTime = Date.now();

  const { error } = await supabase.rpc('refresh_materialized_view', {
    view_name: 'tag_cooccurrence'
  });

  if (error) {
    console.error('❌ Refresh failed:', error);
    throw error;
  }

  const duration = Date.now() - startTime;
  console.log(`✅ View refreshed successfully in ${duration}ms`);

  // Get stats
  const { count } = await supabase
    .from('tag_cooccurrence')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Total tag pairs: ${count || 0}`);
}

async function main() {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL in .env.local');
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
    }

    await refreshCooccurrenceView();

    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
