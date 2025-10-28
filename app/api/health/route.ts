// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { logEvent } from '@/lib/server/log';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const test = url.searchParams.get('test');
  const who = url.searchParams.get('who');

  let whoApi: any = null;
  if (who === '1') {
    const { data, error } = await supabaseAdmin.rpc('debug_whoami');
    whoApi = { data, error };
  }

  let writeTest:
    | { attempted: false; ok: false; via: null; error: null }
    | { attempted: true; ok: boolean; via: 'admin' | 'failed'; error: any } = {
    attempted: false,
    ok: false,
    via: null,
    error: null,
  };

  if (test === '1') {
    writeTest = { attempted: true, ok: false, via: 'failed', error: null };
    const res = await logEvent({
      event: 'health.write',
      source: 'api/health',
      payload: { ts: new Date().toISOString() },
    });
    writeTest.ok = res.ok;
    writeTest.via = res.via as any;
    writeTest.error = res.error;
  }

  return NextResponse.json({
    ok: true,
    runtime: 'nodejs',
    env: {
      supabaseUrlSet: !!process.env.SUPABASE_URL,
      supabaseSrvKeySet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      rag: !!process.env.ENABLE_RAG,
      premium: !!process.env.ENABLE_PREMIUM,
    },
    whoApi,
    writeTest,
    ts: Date.now(),
  });
}
