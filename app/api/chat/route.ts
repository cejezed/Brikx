// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/** ========= Types ========= */
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

type ServerWizardSnapshot = {
  mode?: 'preview' | 'premium';
  triage?: {
    projectType?: string | null;
    projectSize?: string | null;
  } | null;
  chapterAnswers?: Record<string, any>;
  currentChapter?: Chapter;
  missingFields?: string[];
};

/** ========= Helpers ========= */
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';

function ok(reply: string, actions: Action[] = []) {
  return NextResponse.json({ reply, actions } satisfies ChatResponse);
}
function ask(question: string) {
  return ok(question, []);
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

async function logEvent(entry: { event: string; payload: any }) {
  try { console.debug('[chat.log]', entry.event, entry.payload); } catch {}
}

async function queryRag(_q: string): Promise<string> {
  return '';
}

/** ========= ESSENTIËLE VELDEN VALIDATOR ========= */

/**
 * Bepaal welke velden in een chapter nog leeg zijn
 */
function getEmptyFieldsInChapter(chapter: Chapter, chapterAnswers: Record<string, any>): string[] {
  const answers = chapterAnswers?.[chapter] ?? {};
  const empty: string[] = [];

  const fieldMap: Record<Chapter, string[]> = {
    basis: ['projectNaam', 'locatie', 'oppervlakteM2', 'bewonersAantal', 'startMaand'],
    wensen: ['wensen'],
    budget: ['bedrag', 'startMaand'],
    ruimtes: ['ruimtes'],
    techniek: ['bouwkundige', 'cv', 'elektriciteit', 'sanitair'],
    duurzaamheid: ['isolatie', 'verwarming', 'energie'],
    risico: ['mogelijkeRisicos'],
    preview: [],
  };

  const fieldsForChapter = fieldMap[chapter] || [];

  for (const field of fieldsForChapter) {
    const value = answers[field];
    
    if (value === undefined || value === null || value === '') {
      empty.push(field);
    }
    if (Array.isArray(value) && value.length === 0) {
      empty.push(field);
    }
  }

  return empty;
}

/**
 * Bepaal de "essentiële" velden (moet altijd eerst ingevuld)
 * Dit zijn de velden uit Basis die nodig zijn voordat je "diepe" vragen stelt
 */
function getEssentialeLegeVelden(state: ServerWizardSnapshot): string[] {
  const basisLeeg = getEmptyFieldsInChapter('basis', state.chapterAnswers || {});
  
  // Essentieel: projectNaam en locatie zijn minimaal nodig
  return basisLeeg.filter(f => ['projectNaam', 'locatie'].includes(f));
}

/**
 * Is de vraag relevant voor het huidige chapter / essentiële velden?
 * Return true als het waarschijnlijk gaat over basis-velden of huidige chapter
 */
function isRelevanteVraag(text: string, currentChapter: Chapter, essentialeLeeg: string[]): boolean {
  const lower = text.toLowerCase();

  // Als er essentiële velden leeg zijn, check of de vraag daarover gaat
  if (essentialeLeeg.length > 0) {
    const basisKeywords = /naam|locatie|adres|plaats|straat|project|woonplaats/i;
    return basisKeywords.test(lower);
  }

  // Anders: is het relevant voor huidige chapter?
  const chapterKeywords: Record<Chapter, RegExp> = {
    basis: /naam|locatie|adres|plaats|oppervlakte|bewoners|start/i,
    wensen: /wens|idee|graag|voorkeur|liever/i,
    budget: /budget|euro|€|bedrag|kosten|prijs/i,
    ruimtes: /kamer|slaap|woon|keuken|badkamer|ruimte|oppervlakte/i,
    techniek: /techniek|cv|verwarming|elektriciteit|sanitair|dak|gevel|isolatie/i,
    duurzaamheid: /duurzaam|energie|zonnepaneel|warmtepomp|isolatie|verduurzaming/i,
    risico: /risico|probleem|gevaar|aandacht|waarschuwing/i,
    preview: /export|pdf|download|overzicht/i,
  };

  const keyword = chapterKeywords[currentChapter];
  return keyword ? keyword.test(lower) : false;
}

/**
 * Bepaal het volgende essentiële veld om aan te werken
 */
function getVolgendeEssentieleVeld(essentialeLeeg: string[]): string {
  // Voorkeur: projectNaam eerst, dan locatie
  if (essentialeLeeg.includes('projectNaam')) return 'projectNaam';
  if (essentialeLeeg.includes('locatie')) return 'locatie';
  return essentialeLeeg[0] || 'projectNaam';
}

/**
 * Beschrijving van veld voor menselijk-leesbare feedback
 */
function getVeldBeschrijving(veld: string): string {
  const map: Record<string, string> = {
    projectNaam: 'projectnaam',
    locatie: 'locatie / adres',
    oppervlakteM2: 'oppervlakte',
    bewonersAantal: 'aantal bewoners',
    startMaand: 'gewenste startmaand',
    bedrag: 'budget',
  };
  return map[veld] || veld;
}

function getContextDescription(state: ServerWizardSnapshot): string {
  const currentChapter = state.currentChapter || 'basis';
  const emptyFields = getEmptyFieldsInChapter(currentChapter as Chapter, state.chapterAnswers || {});
  
  const fieldDescriptions: Record<string, string> = {
    projectNaam: 'project naam / titel',
    locatie: 'locatie / adres / plaats',
    oppervlakteM2: 'oppervlakte in vierkante meters',
    bewonersAantal: 'aantal bewoners',
    startMaand: 'gewenste start maand',
    bedrag: 'budget bedrag in euro',
    bouwkundige: 'bouwkundige aspecten',
    cv: 'cv / verwarming systeem',
    elektriciteit: 'elektriciteit',
    sanitair: 'sanitair / water',
    isolatie: 'isolatie / energiebesparend',
    verwarming: 'verwarmingssysteem',
    energie: 'energie opwekking / zonnepanelen',
    wensen: 'wensen / ideeën',
    ruimtes: 'ruimtes / kamers',
    mogelijkeRisicos: 'risico\'s / aandachtspunten',
  };

  const descriptions = emptyFields
    .map(f => fieldDescriptions[f] || f)
    .join(', ');

  return `
Huidige chapter: **${currentChapter}**
Lege velden in dit chapter: ${descriptions || 'geen (alles ingevuld)'}

Probeer het volgende in volgorde:
1. Als de gebruiker duidelijk één van de lege velden adresseert → vul die in
2. Als niet duidelijk → stel een vervolgvraag (actions=[])
3. Gebruik altijd logische veldnamen uit de beschrijving hierboven
`;
}

function buildSystemPrompt(state: ServerWizardSnapshot): string {
  const mode = state.mode ?? 'preview';
  const projectType = state.triage?.projectType ?? 'onbekend';

  return `
Jij bent Brikx, een NL architect-assistent. Spreek met "u" en "uw".
Doel: help de gebruiker een Programma van Eisen (PvE) opstellen en de wizard invullen via acties.

Projecttype: ${projectType}.

MODE=${mode}.
${mode === 'premium'
  ? `• U mag voorzichtige bandbreedtes/kaders en globale vergunningscontext noemen als het relevant is.
• Sluit financieel/juridisch getinte antwoorden af met: "Let op: dit is indicatief. Bespreek dit met uw architect."`
  : `• Geef GEEN bedragen, kostenramingen of juridische details. Verwijs daarvoor naar Premium.`}

Uitvoer ALTIJD strikt JSON (geen extra tekst):
{
  "reply": string,
  "actions": [
    { "type":"goto", "chapter":"basis|wensen|budget|ruimtes|techniek|duurzaamheid|risico|preview" },
    { "type":"focus", "key":"chapter:field" },
    { "type":"patch", "chapter": string, "patch": { field: value } },
    { "type":"add_room", "room": { "type":"woonkamer|keuken|slaapkamer|badkamer|overig", "naam"?:string } },
    { "type":"add_wens", "label": string }
  ]
}

Regels:
- Bij dubbelzinnigheid: stel 1 heldere vervolgvraag (actions=[]).
- Budget getallen: { "type":"patch", "chapter":"budget", "patch": { "bedrag": <number> } }.
- Ruimtes: { "type":"add_room", "room": { "type":"...", "naam":"Slaapkamer 1" } }.
- Antwoorden: kort, professioneel, in het Nederlands.
`.trim();
}

/** ========= MAIN HANDLER ========= */
export async function POST(req: NextRequest) {
  const { text, state }: { text?: string; state?: ServerWizardSnapshot } = await req.json();
  const t = String(text ?? '').trim();

  await logEvent({ event: 'chat.request', payload: { text: t, hasState: Boolean(state) } });

  if (!t) return ask('Wat wilt u aanpassen? Noem budget, kamers of wensen.');

  const actions: Action[] = [];
  let matched = false;

  // ========= SIMPLE PATTERN MATCHING (FAST PATH) =========

  // 1) Budget: "250000" of "250k"
  const mBudget = t.match(/(\d[\d\.\s]*)\s*(?:euro|€)?/i);
  if (mBudget && (t.includes('budget') || t.match(/\d{4,}/))) {
    const raw = mBudget[1].replace(/\s+/g, '');
    const bedrag = Number(raw.replace(/\./g, '').replace(/,/g, '.'));
    if (Number.isFinite(bedrag) && bedrag > 0) {
      actions.push({ type: 'patch', chapter: 'budget', patch: { bedrag } });
      actions.push({ type: 'goto', chapter: 'budget' });
      actions.push({ type: 'focus', key: 'budget:bedrag' });
      matched = true;
    }
  }

  // 2) Ruimtes: "3 slaapkamers"
  const roomCountRegex = /(\d+)\s*(slaapkamers?|badkamers?|woonkamers?|keukens?)/gi;
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
  }

  // 3) Wensen keywords
  const WENS: Array<[RegExp, string]> = [
    [/(veel|extra|maximaal)\s+daglicht|lichtinval/i, 'Veel daglicht'],
    [/grote?\s+ramen|raampartij|glasgevel/i, 'Grote ramen'],
    [/open(?:e)?\s+keuken/i, 'Open keuken'],
    [/vloerverwarming/i, 'Vloerverwarming'],
    [/warmtepomp/i, 'Warmtepomp'],
    [/zonnepanelen/i, 'Zonnepanelen'],
    [/thuiswerk|werkplek|studeer/i, 'Goede werkplek'],
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

  // ========= LLM PATH (CONTEXT-AWARE) =========
  if (!state) {
    return ask('Ik mis projectcontext. Vernieuw de pagina of probeer opnieuw.');
  }

  // ============================================================
  // 🚪 NUDGE GATE: Poortwachter voor essentiële velden
  // ============================================================
  const essentialeLeeg = getEssentialeLegeVelden(state);
  const currentChapter = state.currentChapter || 'basis';
  const isRelevant = isRelevanteVraag(t, currentChapter as Chapter, essentialeLeeg);

  if (essentialeLeeg.length > 0 && !isRelevant) {
    // Gebruiker stelt irrelevante vraag terwijl essentiële velden leeg zijn
    // → Stuur naar essentieel veld (Nudge)
    const volgendVeld = getVolgendeEssentieleVeld(essentialeLeeg);
    const beschrijving = getVeldBeschrijving(volgendVeld);

    await logEvent({
      event: 'chat.nudge_gate',
      payload: {
        irrelevantVraag: t,
        essentialeLeeg,
        nudgedTo: volgendVeld,
      },
    });

    return ok(
      `Dat kan ik zeker voor u uitzoeken! 📚 Maar mag ik eerst de **${beschrijving}** van uw project noteren? Dat helpt mij om alles beter in te schatten.`,
      [
        { type: 'goto', chapter: 'basis' },
        { type: 'focus', key: `basis:${volgendVeld}` },
      ]
    );
  }

  // ============================================================
  // Poortwachter gepasseerd → ga verder met RAG & LLM
  // ============================================================

  const techKeywords = ['kosten','prijs','rc-waarde','vergunning','warmtepomp','isolatie'];
  const lower = t.toLowerCase();
  const keywordHit = techKeywords.some(k => lower.includes(k));
  const allowVectorSearch = state.mode === 'premium' || keywordHit;
  const ragContext = allowVectorSearch ? await queryRag(t) : '';

  const system = buildSystemPrompt(state);
  const contextDesc = getContextDescription(state);

  const user = `
${ragContext ? `[RAG Context]\n${ragContext}\n` : ''}
${contextDesc}

Gebruiker zegt: "${t}"

→ Zet dit om naar JSON {reply, actions[]} ZONDER extra tekst.`.trim();

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
    return ask('Bedoelt u budget, ruimtes, wensen of iets anders? Zeg het wat concreter.');
  }

  const safeActions = json.actions.filter((a: any) =>
    a && typeof a === 'object' &&
    ['goto','focus','set','patch','add_room','add_wens','remove_wens'].includes(a.type)
  ) as Action[];

  await logEvent({ event: 'chat.response', payload: { reply: json.reply, actions: safeActions } });
  return ok(json.reply || 'Helder.', safeActions);
}