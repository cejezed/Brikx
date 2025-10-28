// app/api/log/route.ts
import { NextResponse } from 'next/server';
import { logEvent } from '@/lib/server/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, source, payload } = body ?? {};
    if (!event || !source) {
      return NextResponse.json({ ok: false, error: 'Missing event or source' }, { status: 400 });
    }
    const res = await logEvent({ event, source, payload });
    return NextResponse.json({ ok: res.ok, via: res.via, error: res.error });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
