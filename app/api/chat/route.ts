// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/** ========= Types die aansluiten bij applyChatResponse ========= */
type Chapter =
  | 'basis' | 'wensen' | 'budget' | 'ruimtes'
  | 'techniek' | 'duurzaamheid' | 'risico' | 'preview';

type Action =
  | { type: 'goto'; chapter: Chapter }
  | { type: 'focus'; key: string }
  | { type: 'set'; chapter: Chapter | string; value: any }
  | { type: 'patch'; chapter: Chapter | string; patch: any }
  | { type: 'add_room'; room: { type: 'woonkamer' | 'keuken' | 'slaapkamer' | 'badkamer' | 'overig'; naam?: string; oppM2?: number; wensen?: string[] } }
  | { type: 'add_wens'; label: string }
  | { type: 'remove_wens'; label: string };

type ChatResponse = { reply: string; actions: Action[] };

/** ========= Minimale server-side snapshot van WizardState =========
 *  (niet importeren uit 'use client' store i.v.m. Server/Client bundling)
 */
type ServerWizardSnapshot = {
  mode?: 'preview' | 'premium';
  triage?: {
    projectType?: string | null;
    projectSize?: string | null;
  } | null;
  chapterAnswers?: Record<string, any>;
  currentChapter?: Chapter;
  missingFields?: string[]; // optioneel: lijst uit je validator
};

/** ========= Helpers ========= */
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';

function ok(reply: string, actions: Action[] = []) {
  return NextResponse.json({ reply, actions } satisfies ChatResponse);
}
function ask(question: string) {
  return ok(question, []); // geen acties bij onduidelijkheid
}
function jsonSafeParse<T = any>(s: string): T | null {
  try { return JSON.parse(s) as T; } catch { return null; }
}
function singularRoomKey(k: string): 'slaapkamer'|'badkamer'|'woonkamer'|'keuken'|'overig' {
  const t = k.toLowerCase();
  if (/slaapkamer/.test(t)) return 'slaapkamer';
  if (/badkamer/.test(t)) return 'badkamer';
  if (/woonkamer|living/.test(t)) return 'woonkamer';
  if (/keuken|kitchen/.test(t)) return 'keuken';
  return 'overig';
}

// eenvoudige logger-stub (vervang met Supabase)
async function logEvent(entry: { event: string; payload: any }) {
  try { console.debug('[chat.log]', entry.event, entry.payload); } catch {}
}

// optionele RAG stub
async function queryRag(_q: string): Promise<string> {
  // TODO: vervang door echte vector search; nu lege context
  return '';
}

/** ========= System prompt builder volgens Brikx Prompt Pack ========= */
function buildSystemPrompt(state: ServerWizardSnapshot): string {
  const mode = state.mode ?? 'preview';
  const projectType = state.triage?.projectType ?? 'onbekend';
  const missing = state.missingFields?.length ? `Ontbrekend: [${state.missingFields.join(', ')}].` : '';

  return `
Jij bent Brikx, een NL architect-assistent. Spreek met "u" en "uw".
Doel: help de gebruiker een Programma van Eisen (PvE) opstellen en de wizard invullen via acties.

Projecttype: ${projectType}.
${missing}

MODE=${mode}.
${mode === 'premium'
  ? `• U mag voorzichtige bandbreedtes/kaders en globale vergunningscontext noemen als het relevant is.
• Sluit financieel/juridisch getinte antwoorden af met: "Let op: dit is indicatief. Bespreek dit met uw architect."`
  : `• Geef GEEN bedragen, kostenramingen of juridische details. Verwijs daarvoor naar Premium.`}

Uitvoer ALTIJD strikt JSON:
{
  "reply": string,
  "actions": [
    { "type":"goto", "chapter":"basis|wensen|budget|ruimtes|techniek|duurzaamheid|risico|preview" },
    { "type":"focus", "key":"chapter:field" },
    { "type":"set", "chapter": string, "value": any },
    { "type":"patch", "chapter": string, "patch": any },
    { "type":"add_room", "room": { "type":"woonkamer|keuken|slaapkamer|badkamer|overig", "naam"?:string, "oppM2"?:number, "wensen"?:string[] } },
    { "type":"add_wens", "label": string },
    { "type":"remove_wens", "label": string }
  ]
}

Regels:
- Maak GEEN aannames bij dubbelzinnigheid — stel eerst 1 concrete vervolgvraag (actions=[]).
- Budget: { "type":"patch", "chapter":"budget", "patch": { "bedrag": <number> } }.
- Ruimtes: voeg toe met "add_room" en gebruik logische namen ("Slaapkamer 1", "Badkamer 1").
- Wensen: compacte labels ("Veel daglicht").
- Antwoorden: kort, professioneel, taakgericht.
`.trim();
}

/** ========= Hybride NLU ========= */
export async function POST(req: NextRequest) {
  const { text, state }: { text?: string; state?: ServerWizardSnapshot } = await req.json();
  const t = String(text ?? '').trim();

  await logEvent({ event: 'chat.request', payload: { text: t, hasState: Boolean(state) } });

  if (!t) return ask('Wat wilt u aanpassen? Noem budget, kamers of wensen.');

  const actions: Action[] = [];
  let matched = false;

  // 1) Budget
  const mBudget = t.match(/(\d[\d\.\s]*)\s*(?:euro|€)?/i);
  if (mBudget) {
    const raw = mBudget[1].replace(/\s+/g, '');
    const bedrag = Number(raw.replace(/\./g, '').replace(/,/g, '.'));
    if (Number.isFinite(bedrag) && bedrag > 0) {
      actions.push({ type: 'patch', chapter: 'budget', patch: { bedrag } });
      actions.push({ type: 'goto', chapter: 'budget' });
      actions.push({ type: 'focus', key: 'budget:bedrag' });
      matched = true;
    }
  }

  // 2) Ruimtes "3 slaapkamers"
  const roomCountRegex = /(\d+)\s*(slaapkamers?|badkamers?|woonkamers?|keukens?|living(?:room)?s?)/gi;
  let anyRooms = false;
  let rm: RegExpExecArray | null;
  while ((rm = roomCountRegex.exec(t)) !== null) {
    const count = parseInt(rm[1], 10);
    const type = singularRoomKey(rm[2]);
    if (count > 0) {
      for (let i = 1; i <= count; i++) {
        const naam =
          type === 'slaapkamer' ? `Slaapkamer ${i}` :
          type === 'badkamer'   ? `Badkamer ${i}`   :
          type === 'woonkamer'  ? `Woonkamer`       :
          type === 'keuken'     ? `Keuken`          : `Ruimte ${i}`;
        actions.push({ type: 'add_room', room: { type, naam } });
      }
      anyRooms = true;
      matched = true;
    }
  }
  if (anyRooms) {
    actions.push({ type: 'goto', chapter: 'ruimtes' });
    actions.push({ type: 'focus', key: 'ruimtes:naam' });
  }

  // 3) Hard-wensen (keywords)
  const WENS: Array<[RegExp, string]> = [
    [/(veel|extra|maximaal)\s+daglicht|lichtinval|licht\-?inval|veel licht/i, 'Veel daglicht'],
    [/grote?\s+ramen|raampartij(en)?|glas?gevel|panorama\s*ramen/i, 'Grote ramen / glasgevel'],
    [/lichtkoepel|dakraam|dakkapel/i, 'Dakraam / lichtkoepel'],
    [/open(?:e)?\s+keuken/i, 'Open keuken'],
    [/vloerverwarming/i, 'Vloerverwarming'],
    [/warmtepomp|lucht[-\s]?water|bodem[-\s]?warmte/i, 'Warmtepomp'],
    [/zonnepanelen|pv\s*panelen?/i, 'Zonnepanelen'],
    [/thuiswerk|werkplek|stud[eê]erkamer/i, 'Goede thuiswerkplek'],
  ];
  let anyWens = false;
  for (const [rx, label] of WENS) {
    if (rx.test(t)) {
      actions.push({ type: 'add_wens', label });
      anyWens = true;
      matched = true;
    }
  }
  if (anyWens) {
    actions.push({ type: 'goto', chapter: 'wensen' });
    actions.push({ type: 'focus', key: 'wensen:nieuw' });
  }

  if (matched) {
    const reply =
      (anyRooms && anyWens && mBudget) ? 'Budget, kamers en wensen toegevoegd ✅' :
      (anyRooms && mBudget)            ? 'Budget en kamers toegevoegd ✅' :
      (anyWens && mBudget)             ? 'Budget en wensen toegevoegd ✅' :
      (anyRooms && anyWens)            ? 'Kamers en wensen toegevoegd ✅' :
      anyRooms                         ? 'Kamers toegevoegd ✅' :
      anyWens                          ? 'Wensen toegevoegd ✅' :
      'Budget bijgewerkt ✅';
    await logEvent({ event: 'chat.response', payload: { reply, actions } });
    return ok(reply, actions);
  }

  // 4) LLM met context (doorvragen bij twijfel)
  if (!state) {
    return ask('Ik mis projectcontext. Vernieuw de pagina of probeer opnieuw.');
  }

  // RAG-gate: premium óf keyword hit
  const techKeywords = ['kosten','prijs','rc-waarde','vergunning','wkb','warmtepomp','isolatie','bvo','gbo','epc','nzt'];
  const lower = t.toLowerCase();
  const keywordHit = techKeywords.some(k => lower.includes(k));
  const allowVectorSearch = state.mode === 'premium' || keywordHit;

  const ragContext = allowVectorSearch ? await queryRag(t) : '';

  const system = buildSystemPrompt(state);
  const user = `
${ragContext ? `Context:\n${ragContext}\n` : ''}
Gebruiker zegt: "${t}"

Zet dit om naar {reply, actions[]} volgens het schema. Geen extra tekst.`.trim();

  let json: ChatResponse | null = null;

  try {
    const r = await client.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
    });

    const content = r.choices?.[0]?.message?.content ?? '';
    const parsed = jsonSafeParse<ChatResponse>(content);
    if (parsed && typeof parsed.reply === 'string' && Array.isArray(parsed.actions)) {
      json = parsed;
    }
  } catch (e) {
    await logEvent({ event: 'chat.error', payload: { error: String(e).slice(0, 500) } });
  }

  if (!json) {
    return ask('Bedoelt u een budget, specifieke ruimtes of een wens? Noem het concreet, dan vul ik het in.');
  }

  const safeActions = json.actions.filter((a: any) =>
    a && typeof a === 'object' &&
    ['goto','focus','set','patch','add_room','add_wens','remove_wens'].includes(a.type)
  ) as Action[];

  await logEvent({ event: 'chat.response', payload: { reply: json.reply, actions: safeActions } });
  return ok(json.reply || 'Helder.', safeActions);
}
