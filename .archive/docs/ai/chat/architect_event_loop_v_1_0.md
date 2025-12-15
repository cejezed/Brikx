# ARCHITECT_EVENT_LOOP_v1_0
**Proactieve Architect – Triggers, Event Router & Chat-integratie**

---

## 0. Scope & Doel

**Doel:** de chat niet alleen laten reageren op user-berichten, maar ook **zelf initiatief laten nemen** op basis van wat de gebruiker in de wizard doet.

Deze spec voegt géén nieuwe intelligentie toe, maar een **event-laag** die bepaalt **wanneer** `orchestrateTurn` wordt aangeroepen met een automatische beurt.

Belangrijk:
- Bestaande AI-pijplijn v3.1 blijft intact.
- Alleen extra triggers + routering.

---

## 1. Architectuur Overzicht

### 1.1 Nieuwe modules

1. `lib/ai/ArchitectTriggers.ts` – Detecteert betekenisvolle wijzigingen in WizardState
2. `lib/ai/ArchitectEventQueue.ts` – Debounce, prioriteit en rate limiting
3. `lib/ai/ArchitectEventRouter.ts` – Zet events om naar auto-calls

### 1.2 Dataflow

```
Wizard UI
 └─▶ WizardState wijziging
      └─▶ ArchitectTriggers.detect(prev, next)
            └─▶ ArchitectEventQueue.enqueue(events)
                  └─▶ ArchitectEventRouter.process()
                        └─▶ orchestrateTurn(mode="auto")
                              └─▶ bestaande v3.1 AI pipeline
```

---

## 2. Types & Contracten

### 2.1 Architect Events

```ts
export type ArchitectEventType =
  | "chapter_entered"
  | "chapter_completed"
  | "room_added"
  | "budget_edited"
  | "risk_increased"
  | "wizard_idle";

export interface ArchitectEvent {
  id: string;
  type: ArchitectEventType;
  source: "user_input" | "wizard_navigation" | "system_analysis";
  projectId: string;
  userId?: string;
  timestamp: string;
  priority: "low" | "medium" | "high";
  chapter?: ChapterKey;
  fieldPath?: string;
  payload?: Record<string, any>;
}
```

### 2.2 OrchestrateTurn uitbreiding

```ts
export interface OrchestrateTurnInput {
  mode: "user" | "auto";
  query: string;
  wizardState: WizardState;
  projectId: string;
  userId?: string;
}
```

---

## 3. ArchitectTriggers

**Bestand:** `lib/ai/ArchitectTriggers.ts`

### Doel

- Pure synchronische detectie
- Geen LLM calls
- Eén ingang: `detect(prev, next)`

### Kerntriggers (v1)

| Trigger | Voorwaarde | Priority | Doel |
|------|-----------|----------|------|
| chapter_entered | currentChapter wijzigt | low | Intro hoofdstuk |
| chapter_completed | basis compleet | medium | Volgende stap |
| budget_edited | >5% of >€5.000 | medium | Realiteitscheck |
| room_added | rooms.length stijgt | low | Verdieping |
| risk_increased | conflicts ↑ | high | Waarschuwing |

---

## 4. ArchitectEventQueue

**Bestand:** `lib/ai/ArchitectEventQueue.ts`

### Regels

- Debounce: 750 ms
- Max 1 event per flush
- Hoogste priority wint
- Rate limit: max 1 auto-turn per 10s per project

```ts
enqueue(events: ArchitectEvent[]): void
flushNow(): void
```

---

## 5. ArchitectEventRouter

**Bestand:** `lib/ai/ArchitectEventRouter.ts`

### Doel

- Event → synthetische query
- Geen TurnGoal bepaling (TurnPlanner blijft leidend)

### Query prefix

Elke auto-query begint met:

```
[AUTO_TRIGGER]
```

### Voorbeeld

```text
[AUTO_TRIGGER]
De gebruiker heeft het budget aangepast.
Nieuw budget: €250.000.
Controleer of dit past bij de huidige wensen en benoem eventuele risico’s.
```

### Orchestratie

```ts
await orchestrateTurn({
  mode: "auto",
  query,
  wizardState,
  projectId,
  userId
});
```

---

## 6. Integratie WizardState

In `useWizardState` of vergelijkbaar:

```ts
const events = ArchitectTriggers.detect(prev, next, ctx);
if (events.length) ArchitectEventQueue.enqueue(events);
```

Guardrail:
- Alleen reageren op **user-originated** wijzigingen
- AI-patches mogen geen nieuwe events triggeren

---

## 7. Chat UI – Architect Insights

### Message type

```ts
export type ChatMessageType = "user" | "assistant" | "system" | "architect_insight";
```

### UX-regels

- Maximaal 1 vraag
- Geen emoji’s
- Formeel Nederlands (u/uw)
- Nooit automatische patches

---

## 8. Guardrails

1. `orchestrateTurn` is enige AI-ingang
2. Geen loops via source-tracking
3. Rate limiting verplicht
4. TurnGoals alleen via TurnPlanner
5. Tests verplicht

---

## 9. Testplan (minimaal)

- ArchitectTriggers detectie
- EventQueue debounce + priority
- Auto-mode orchestrateTurn
- Eén integratietest met chapter_entered

---

## 10. Implementatievolgorde

1. ArchitectTriggers
2. ArchitectEventQueue
3. ArchitectEventRouter
4. WizardState integratie
5. Chat UI support

---

**Resultaat:**
De chat wacht niet meer af, maar **gedraagt zich als een proactieve architect**, zonder dat de bestaande AI-laag wordt opengebroken.

