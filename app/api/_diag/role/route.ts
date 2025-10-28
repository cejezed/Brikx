// app/api/_diag/role/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.SUPABASE_URL!;
  const srv = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const rest = `${url.replace(/\/+$/, '')}/rest/v1/rpc/debug_whoami`;

  // 1) via supabase-js
  const js = await supabaseAdmin.rpc('debug_whoami');

  // 2) via raw fetch (forceer headers)
  const raw = await fetch(rest, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: srv,
      Authorization: `Bearer ${srv}`,
    },
    body: JSON.stringify({}),
  }).then(async r => ({ status: r.status, data: await r.json().catch(() => null) }))
    .catch(err => ({ status: 0, data: { error: String(err) } }));

  return NextResponse.json({
    ok: true,
    env: { hasSrvKey: !!srv, url },
    via_supabase_js: { data: js.data ?? null, error: js.error ?? null },
    via_raw_fetch: raw,
    ts: Date.now(),
  });
}
