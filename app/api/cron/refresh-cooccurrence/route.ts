// app/api/cron/refresh-cooccurrence/route.ts
// Vercel Cron endpoint voor dagelijkse refresh van tag_cooccurrence view
//
// Setup in vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/refresh-cooccurrence",
//     "schedule": "0 3 * * *"
//   }]
// }

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel sets this automatically for cron jobs)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Refresh materialized view
    const startTime = Date.now();
    const { error } = await supabase.rpc('refresh_materialized_view', {
      view_name: 'tag_cooccurrence'
    });

    if (error) {
      console.error('Refresh failed:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;

    // Get stats
    const { count } = await supabase
      .from('tag_cooccurrence')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      duration_ms: duration,
      total_pairs: count || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
