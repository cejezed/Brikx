# **BRIKX_BUILD_PROTOCOL_v3_1_TECHNICAL_SPEC.md**

*(Volledige technische specificatie --- Architect Intelligence Layer --- v3.1)*

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **BRIKX_BUILD_PROTOCOL_v3_1_TECHNICAL_SPEC.md**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# 📘 **BRIKX BUILD PROTOCOL --- VERSION 3.1 (TECHNICAL SPECIFICATION)**

**Status:** Locked Draft Candidate\
**Scope:** Wizard, Chat, Architect Intelligence, LLM Pipeline, RAG, Patch Logic\
**Audience:** Senior Engineers, LLM Engineers, Product AI Designers\
**Last Updated:** Today

# ============================================================

# **0. Executive Summary**

# ============================================================

Brikx Build Protocol v3.1 definieert het volledige technische raamwerk voor:

1.  **Architect Intelligence Layer** (AIL)

2.  **AI-First Triage Pipeline**

3.  **Chapter Opening Protocol (NIEUW in v3.1)**

4.  **Turn-Based Orchestrator**

5.  **System Intelligence & Anticipation Logic**

6.  **Behavior-Adapted Architect Interaction**

7.  **Patch Suggestion Architecture (v4.0 style)**

8.  **RAG Integration Across KnowledgeBank + Customer Examples**

9.  **Serverless ConversationMemory (Supabase-backed)**

10. **FieldWatcher + FeedbackQueue (Loop Prevention)**

11. **LLM Guardrails (AnswerGuard)**

12. **Prompt Pruning (ContextPruner)**

13. **Fallback Layer (LLM Failure Resilience)**

Deze specificatie vervangt en combineert eerdere versies:

-   Build Protocol v3.0

-   AI-First Triage v2.0

-   AI Behavior Additions

-   Intelligence Augmentation Layer 1.x

# ============================================================

# **1. System Context Overview**

# ============================================================

Brikx Wizard bestaat uit:

-   **Client** (Next.js App Router)

-   **Serverless Backend** (Next.js API routes)

-   **Supabase Database**

-   **AI Engines (LLM + RAG)**

-   **Chat Orchestrator**

-   **Architect Intelligence Layer**

-   **Patch Engine**

-   **Export Engine (HTML, PDF, Email)**

De Wizard volgt vier Pijlers:

## 🧱 **Pijler 1 --- AI-First Triage**

Alle gebruikersinput wordt eerst geanalyseerd door de AI via triage.

Doelen:

-   Bepaal intentie

-   Bepaal of vraag data vult of advies vraagt

-   Bepaal of het chapter switcht

-   Bepaal of vraag onduidelijk is of aanvullende info mist

## 🧠 **Pijler 2 --- Shared Brain**

Alle AI-onderdelen gebruiken exact dezelfde logica:

-   zelfde schema's

-   zelfde heuristieken

-   zelfde RAG embeddings

-   zelfde patchrules

## 📚 **Pijler 3 --- Structured RAG**

Brikx gebruikt:

1.  knowledgebank_items → bouwkunde, regelgeving, architectuur

2.  customer_examples → interpretatie van klantentaal

3.  project_context → bestaande wizard-inhoud

4.  ContextPruner → gerichte selectie

## 📄 **Pijler 4 --- Export Consistency**

De data die tijdens het gesprek wordt opgebouwd moet:

-   compleet zijn

-   consistent zijn

-   risico's en budgetconflicten bevatten

-   MoSCoW prioriteiten bevatten

# ============================================================

# **2. Core Data Models**

# ============================================================

Alle data in deze specificatie gebruikt dezelfde types als:

-   types/project.ts

-   types/ai.ts (NIEUW in v3.1)

-   types/patch.ts

# ============================================================

# **3. Chat Lifecycle Overview**

# ============================================================

Elke chat-turn doorloopt:

Client → Chat Route → ChapterInitializer? → ConversationMemory.load()

→ AI-First Triage → Parallel AI Modules

→ TurnPlanner → ContextPruner → ResponseOrchestrator → AnswerGuard

→ Save → Return → Stream to UI

# ============================================================

# **4. Architect Intelligence Layer (AIL)**

# ============================================================

AIL bestaat uit 8 modules:

1.  FieldWatcher

2.  AnticipationEngine

3.  SystemIntelligence

4.  BehaviorAnalyzer

5.  TurnPlanner

6.  ConversationMemory

7.  ResponseOrchestrator

8.  AnswerGuard

We documenteren ze volledig.

# ============================================================

# **4.1 FieldWatcher**

# ============================================================

Detecteert relevante wijzigingen in wizardState.

### 🔧 Probleem dat dit oplost

-   AI moet actief reageren op canvas-updates

-   Maar mag **niet** in loops vallen

### 🔐 Regel

**FieldWatcher mag alleen triggers genereren wanneer source === \"user\"**

### Code

export interface StateChange {

prev: WizardState;

next: WizardState;

source: \"user\" \| \"ai\" \| \"system\";

}

export const FieldWatcher = {

detect(prev, next, source): ArchitectTrigger\[\] {

if (source !== \"user\") return \[\];

const triggers: ArchitectTrigger\[\] = \[\];

// budget ingevuld

if (!prev.budget?.budgetTotaal && next.budget?.budgetTotaal) {

triggers.push({

id: \"BUDGET_ENTERED\",

severity: \"info\",

message: \"Budget genoteerd. Ik houd hier rekening mee.\",

});

}

// isolatie → ventilatie

if (

prev.techniek?.isolatie !== next.techniek?.isolatie &&

next.techniek?.isolatie &&

!next.techniek?.ventilatie

) {

triggers.push({

id: \"ISOLATION_WITHOUT_VENTILATION\",

severity: \"warning\",

message: \"Bij verbeterde isolatie hoort vaak ook ventilatie.\",

});

}

return triggers;

}

};

# ============================================================

# **4.2 FeedbackQueue (Debounced Trigger Delivery)**

# ============================================================

Voorkomt trigger-spam.

export class FeedbackQueue {

private buffer: ArchitectTrigger\[\] = \[\];

private timer: NodeJS.Timeout \| null = null;

add(triggers: ArchitectTrigger\[\]) {

this.buffer.push(\...triggers);

if (this.timer) clearTimeout(this.timer);

this.timer = setTimeout(() =\> {

this.flush();

}, 800);

}

flush() {

if (this.buffer.length === 0) return;

const unique = dedupe(this.buffer);

const top = unique.slice(0, 2);

deliverTriggersToChat(top);

this.buffer = \[\];

}

}

# ============================================================

# **4.3 AnticipationEngine**

# ============================================================

Kijkt vooruit en stelt **cruciale vragen vóórdat het misgaat**.

### Regels:

-   Max 1 kritieke vraag tegelijk

-   Nooit overslaan

-   Altijd vóór normale vragen

### Voorbeeldregel:

{

id: \"RENOVATION_NEEDS_EXISTING_DOCS\",

priority: \"critical\",

trigger: (state) =\> state.basis?.projectType === \"verbouwing\",

anticipatoryQuestions: \[

\"Heeft u bestaande bouwtekeningen?\",

\],

reasoning: \"Voor renovatieprojecten is bestaande documentatie cruciaal.\",

}

# ============================================================

# **4.4 SystemIntelligence**

# ============================================================

Detecteert cross-chapter inconsistenties.

Voorbeeld:

if (hasLargeGlazedArea(state.ruimtes) && state.techniek?.isolatie === \"bestaand\") {

return \[{

id: \"GLASS_WITHOUT_INSULATION\",

severity: \"warning\",

description: \"Veel glas en slechte isolatie leidt tot comfortproblemen.\",

options: \[

{ label: \"Eerst isoleren\", impact: \"Comfort + energiebesparing\" },

{ label: \"Minder glas\", impact: \"Lagere kosten\" },

\]

}\];

}

Helper:

export function hasLargeGlazedArea(ruimtes): boolean {

return ruimtes.rooms?.some(r =\> r.m2 \> 30 && r.wensen?.includes(\"veel glas\"));

}

# ============================================================

# **4.5 BehaviorAnalyzer**

# ============================================================

Detecteert:

-   ervaring

-   tempo

-   onzekerheid

-   overwhelm

-   willingness to act

Voorbeeld:

export const BehaviorAnalyzer = {

analyze(turns, state): UserBehaviorProfile {

const uncertainty = count(turns, \[\"weet niet\", \"geen idee\", \"misschien\"\]);

const overwhelm = count(turns, \[\"te veel\", \"ingewikkeld\", \"snap het niet\"\]);

return {

experience: inferExperience(turns, state),

pace: inferPace(turns),

confidence: uncertainty \> 3 ? \"uncertain\" : \"decisive\",

overwhelm: overwhelm \> 2 ? \"significant\" : \"none\",

actionLevel: inferActionLevel(turns),

};

}

}

# ============================================================

# **4.6 TurnPlanner**

# ============================================================

De centrale module.

TurnPlanner beslist:

-   goal

-   tone

-   requiredActions

-   patchPolicy

-   when to offer alternatives

-   when to warn

-   when to clarify

### Priority Matrix:

1\. Blocking system conflicts → surface_risks

2\. Critical anticipation → anticipate_and_guide

3\. Warning conflicts → offer_alternatives

4\. Normal triage → fill_data

# ============================================================

# **4.7 ConversationMemory (Supabase-Backed)**

# ============================================================

### Tabel:

CREATE TABLE conversation_history (

id uuid primary key default gen_random_uuid(),

user_id uuid not null,

project_id uuid not null,

role text not null,

message text not null,

wizard_state_snapshot jsonb,

triggers_handled text\[\],

patches_applied jsonb\[\],

created_at timestamptz default now()

);

### Loader:

const rows = await supabase

.from(\"conversation_history\")

.select(\"\*\")

.eq(\"user_id\", userId)

.eq(\"project_id\", projectId)

.order(\"created_at\", { ascending: false })

.limit(20);

# ============================================================

# **4.8 ContextPruner**

# ============================================================

Beperk prompt tot **\< 4000 tokens**.

### Regel:

-   max 3 nuggets

-   max 2 examples

-   max 3 recent turns

-   only relevant chapter state

# ============================================================

# **4.9 ResponseOrchestrator**

# ============================================================

Genereert final LLM prompt & antwoord.

# ============================================================

# **4.10 AnswerGuard**

# ============================================================

Rule-based + mini-LLM fallback.

Checks:

-   tone correct

-   no patches if forbidden

-   required triggers addressed

-   output schema valid

# ============================================================

# **4.11 ArchitectFallback**

# ============================================================

Wanneer OpenAI down is.

Via templates zoals:

Voordat we verder gaan moet ik iets belangrijks benoemen:

\${conflict.description}

# ============================================================

# **4.12 ProgressTracker**

# ============================================================

Toont:

-   open anticipaties

-   open conflicts

-   ontbrekende velden

Percentage:

resolved / totalIssues \* 100

# ============================================================

# **4.13 CHAPTER OPENING PROTOCOL (NIEUW --- V3.1)**

# ============================================================

**Dit is één van de belangrijkste onderdelen van v3.1.**

### Trigger:

wizardState.currentChapter !== previousState.currentChapter

### De zes verplichte stappen:

## **1. Load chapter context**

-   schema (CHAPTER_SCHEMAS)

-   required fields

-   existing data

## **2. Run AnticipationEngine**

-   Detect 1 critical anticipatory question

-   If found → **always ask this first**

-   Never skip

## **3. Run SystemIntelligence (blocking only)**

Als er blocking issues zijn:

-   interrupt

-   explain

-   ask how they want to resolve

## **4. Run BehaviorAnalyzer**

Bepaalt:

-   tone

-   tempo

-   formality

-   detail-level

-   number of questions per turn

## **5. TurnPlanner决定**

Goals kunnen zijn:

-   surface_risks

-   anticipate_and_guide

-   fill_data

-   clarify

### NOOIT patches bij hoofdstukstart.

## **6. Generate opening message**

Template:

U bent nu bij het hoofdstuk \"\<label\>\".

\<Waarom dit hoofdstuk belangrijk is\>

\<Als anticipatie actief is\>

Voordat we invullen heb ik een belangrijke vraag:

\<kritieke vraag\>

Dit is relevant omdat \<reasoning\>.

\<Als blocking conflict actief is\>

Voordat we verder gaan moet ik iets belangrijks benoemen:

\<conflict\>

Hoe wilt u hiermee omgaan?

\<Als normaal\>

Om te beginnen: \<eerste vraag over required field\>

# ============================================================

# **5. Chat Pipeline (Full Flow Diagram)**

# ============================================================

Client → ChatRoute → ChapterInitializer?

→ ConversationMemory.load()

→ AI-First Triage

→ Parallel AI Modules (Promise.allSettled)

→ BehaviorAnalyzer

→ AnticipationEngine

→ SystemIntelligence

→ RAG Engine

→ TurnPlanner

→ ContextPruner

→ ResponseOrchestrator

→ AnswerGuard

→ Persist Conversation

→ Return

# ============================================================

# **6. Server--Client Responsibilities**

# ============================================================

### Client (UI):

-   show chat

-   send chapter_open events

-   handle patches (confirm/reject)

### Server:

-   Architect Intelligence

-   Turn planning

-   The entire conversation logic

-   All risk and anticipation logic

# ============================================================

# **7. Hard Rules (MUST NOT BREAK)**

# ============================================================

### 1. Geen emoji's

### 2. Altijd formeel ("u")

### 3. Geen hoofdstuk stil openen

### 4. Nooit meerdere vragen per turn

### 5. Nooit patches bij hoofdstukstart

### 6. Max 1 kritieke anticipatie per turn

### 7. Behavior profile bepaalt tone

### 8. Blocking conflicts altijd eerst

### 9. Prompt altijd \< 4000 tokens

# ============================================================

# **8. Appendices**

# ============================================================

Appendix bevat:

-   uitgebreide referentiefuncties

-   helper libraries

-   patroonvoorbeelden

-   alle AnticipationRules

-   alle SystemConflicts

-   tabel definities

*(In deze output weggelaten vanwege lengte.)*

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# EINDE VAN DIT DOCUMENT

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
