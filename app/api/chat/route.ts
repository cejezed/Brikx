// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { logEvent } from '@/lib/server/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Msg = { role: 'system' | 'user' | 'assistant'; content: string };

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const messages: Msg[] = Array.isArray(body?.messages) ? body.messages : [];

  await logEvent({ event: 'chat.request', source: 'api/chat', payload: { count: messages.length } });

  const latest = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';

  // --- Heuristics: minimal demo mapping naar patch/focus ---
  let patch: Record<string, any> = {};
  let focus: string | null = null;
  let text = 'Helder. Noem bijvoorbeeld “Budget 250k” of “speelkamer 20 m²”.';

  // Budget: “budget 250k” / “budget €250.000”
  const budgetMatch = latest.match(/budget[^0-9]*([\d\.]+)\s*(k|k€|€|eur|euro)?/i);
  if (budgetMatch) {
    const raw = budgetMatch[1].replace(/\./g, '');
    const suffix = (budgetMatch[2] || '').toLowerCase();
    const value = suffix.startsWith('k') ? Number(raw) * 1000 : Number(raw);
    if (Number.isFinite(value) && value > 0) {
      patch.budget = value;
      focus = 'budget:total';
      text = `Budget op €${value.toLocaleString('nl-NL')} gezet.`;
    }
  }

  // Ruimte: “speelkamer 20 m2”
  if (!patch.budget) {
    const roomMatch = latest.match(/\b(speelkamer|slaapkamer|werkkamer|logeer|hobby)\b.*?(\d+)\s*(m2|m²)?/i)
      || latest.match(/\b(speelkamer|slaapkamer|werkkamer|logeer|hobby)\b/i);
    if (roomMatch) {
      const name = roomMatch[1].toLowerCase();
      const area = roomMatch[2] ? Number(roomMatch[2]) : null;
      patch.rooms = [{ name, area }];
      focus = `rooms:${name}`;
      text = area ? `${name} van ${area} m² toegevoegd.` : `${name} toegevoegd.`;
    }
  }

  const response = {
    assistant: text,
    patch,
    __focus: focus,
    missing_fields: [],
    completion_score: 85,
    handoff_suggested: false,
  };

  await logEvent({ event: 'chat.response', source: 'api/chat', payload: { hasPatch: !!Object.keys(patch).length, focus } });

  return NextResponse.json(response);
}
