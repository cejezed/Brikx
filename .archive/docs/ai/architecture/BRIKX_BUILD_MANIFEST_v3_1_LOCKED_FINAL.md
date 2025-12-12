# **BRIKX_BUILD_MANIFEST_v3_1_LOCKED_FINAL.md**

🔒 *Canonical, locked specification --- Architect Intelligence Edition*

Zoals je vroeg: volledig, uitgebreid, productierijp.

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **BRIKX_BUILD_MANIFEST_v3_1_LOCKED_FINAL.md**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# 🔒 **BRIKX BUILD MANIFEST --- VERSION 3.1 (LOCKED FINAL)**

**Status:** Canonical Specification -- Mag alleen worden aangepast via formele versie-upgrade\*\*\
**Doel:** Definiëren van alle harde eisen, pijlers, kwaliteitscriteria en verplichte architectuurpatronen voor de Brikx Wizard, Architect Intelligence Layer (AIL) en Chat Orchestrator.

**Dit manifest is het formele contract van de Brikx build.\
Alle code, prompts, UX, API's en AI-logica MOETEN conformeren aan dit document.**

# ============================================================

# **0. PURPOSE & SCOPE**

# ============================================================

Deze versie **v3.1** breidt het eerdere v3.0-manifest uit met:

-   Architect Intelligence Layer (AIL)

-   Behavior-adaptive architect-gedrag

-   AnticipationEngine

-   SystemIntelligence

-   Chapter Opening Protocol

-   FieldWatcher

-   DB-backed ConversationMemory

-   TurnPlanner priority matrix

-   Complete guards & fallback patterns

-   MoSCoW + LifestyleProfile integratie

-   v4.1 Prompt Pack alignment

-   Infinite-loop preventie & latency-reductie

Dit manifest is **leidend** bij review, implementatie, QA en verdere versie-ontwikkeling.

# ============================================================

# **1. BRIXK FUNDAMENT / CORE PRINCIPLES**

# ============================================================

De Brikx Wizard draait op vier hard-gefixeerde pijlers:

## **PIJLER 1 --- AI-FIRST TRIAGE (VERPLICHT)**

Elke user-turn start met:

1.  Triage bepaalt intent:

    -   data input

    -   adviesvraag

    -   navigatie

    -   onbekend

2.  Triage bepaalt of AI:

    -   moet reageren

    -   moet wachten

    -   moet verduidelijken

3.  Triage **mag nooit** velden invullen of advies geven.

4.  Triage is altijd LLM-gedreven --- deterministic pattern enforced.

## **PIJLER 2 --- SHARED BRAIN MODEL**

Alle AI-modules delen één centrale bron:

-   wizardState

-   conversationMemory

-   behaviorProfile

-   RAG nuggets

-   customer examples

-   system conflict set

Elke model output volgt dezelfde logische constraints.

## **PIJLER 3 --- RAG / KNOWLEDGE NUGGETS**

Alle expertise komt uit:

-   Brikx Kennisbank

-   Customer Examples

-   SystemIntelligence regels

LLM mag **niet vrij improviseren** zonder nugget-onderbouwing.

## **PIJLER 4 --- EXPORT CONSISTENCY**

Alle output van:

-   Wizard UI

-   Chat AI

-   PvE Export

-   Suggestie patches

...moeten dezelfde datastructuren, dezelfde logica en dezelfde constraints gebruiken.

# ============================================================

# **2. HARD REQUIREMENTS (MUST-HAVE RULESETS)**

# ============================================================

## **2.1 Formele Taal & Stijl (STRICT)**

Architect communiceert altijd formeel:

-   "u", "uw", "uzelf"

-   nooit "je", "jij"

**Geen emoji's.\
Nooit meerdere vragen.\
Maximaal één concrete vraag per beurt.**

Dit wordt enforced door AnswerGuard.

## **2.2 Geen Stilte / Geen Dead Air**

Het systeem **mag nooit** een hoofdstuk openen zonder begeleidend bericht.

## **2.3 AI mag nooit ongefundeerde aannames doen**

Alle interpretaties moeten komen uit:

-   triage intent

-   customer examples

-   RAG nuggets

-   heuristieken

-   system conflicts

-   user input

LLM-hallucinatie is onacceptabel.

## **2.4 Patches zijn NOOIT automatisch**

Elke patch heeft:

-   confidence

-   requiresConfirmation

-   userFacingLabel

-   reasoning

Patch wordt pas verwerkt als gebruiker bevestigt.

## **2.5 AI mag nooit een keuze afdwingen**

AI biedt:

-   opties

-   trade-offs

-   implicaties

...maar beslist nooit.

## **2.6 AI moet inconsistenties altijd benoemen**

Dit gebeurt automatisch via:

-   FieldWatcher

-   HeuristicsEngine

-   SystemIntelligence

-   Budget--Ambitie mismatch detector

-   MoSCoW fallout logic

# ============================================================

# **3. ARCHITECT INTELLIGENCE LAYER (AIL)**

# ============================================================

v3.1 introduceert een volledig modulair architectuurmodel.

AIL bestaat uit 10 verplichte modules:

1.  **FieldWatcher**

2.  **FeedbackQueue**

3.  **ConversationMemory (DB-backed)**

4.  **BehaviorAnalyzer**

5.  **AnticipationEngine**

6.  **SystemIntelligence**

7.  **HeuristicsEngine**

8.  **TurnPlanner**

9.  **ResponseOrchestrator**

10. **AnswerGuard + ArchitectFallback**

Alle modules zijn **verplicht**, mogen niet worden verwijderd of omzeild.

# ============================================================

# **4. MODULE REQUIREMENTS**

# ============================================================

Hieronder elk onderdeel zoals het verplicht moet werken.

## **4.1 FieldWatcher (Client)**

### Functie

Detecteert user-gedreven wijzigingen in wizardState.

### Hard rules

-   Detecteert alleen wijzigingen met source=\"user\"

-   AI-patches **triggeren FieldWatcher nooit** (infinite loop preventie)

-   Output wordt via FeedbackQueue gedebounced (1s)

### Output

-   Set van ArchitectTriggers

-   max 2 tegelijk

-   severity sorted

## **4.2 FeedbackQueue**

### Functie

Combineert triggers binnen 1 seconde zodat AI niet spammy wordt.

### Hard rules

-   Combineert alle triggers in 1 message block

-   Dedupliceert triggers

-   Stuurt max 2 triggers door naar chat

## **4.3 ConversationMemory (Server, Supabase)**

### Functie

Persistent geheugen over turns, triggers, patches.

### Hard rules

-   Max 20 turns opgeslagen

-   RLS bescherming per user/project

-   Elke turn bevat:

    -   role

    -   message

    -   patches

    -   triggers handled

    -   wizard snapshot

## **4.4 BehaviorAnalyzer**

### Functie

Detecteert:

-   ervaring

-   tempo

-   onzekerheid

-   overweldiging

-   actiegerichtheid

### Hard rules

-   Invloed op tone

-   Invloed op goal

-   Invloed op requiredActions

Tone wordt bepaald door:

  -----------------------------------------------------------------------
  **Profile**                             **Tone**
  --------------------------------------- -------------------------------
  Uncertain                               warm of coach

  Overwhelmed                             warm

  Fast + Experienced                      direct

  Default                                 expert
  -----------------------------------------------------------------------

## **4.5 AnticipationEngine**

### Functie

Kijkt vooruit: welke cruciale vragen MOETEN eerst?

### Hard rules

-   Max 1 kritieke anticipatie tegelijk

-   Wordt toegepast bij chapter-opening

-   Wordt toegepast bij user messages wanneer relevant

## **4.6 SystemIntelligence**

### Functie

Detecteert cross-chapter conflicts:

-   budget vs ambitie

-   isolatie vs glas

-   aantal badkamers vs gezinssamenstelling

-   vergunning vs m²

-   MoSCoW must-haves \> budget

-   Lifestyle mismatches

### Hard rules

-   Blocking conflicts krijgen hoogste prioriteit in TurnPlanner

-   Warning conflicts worden benoemd maar geven geen harde blokkade

## **4.7 HeuristicsEngine**

### Functie

Detecteert inconsistenties die niet LLM-gebaseerd zijn.

Voorbeelden:

-   isolatie verbeterd → ventilatie ontbreekt

-   meerdere kamers toegevoegd → check routing

-   grote uitbouw → check vergunningen

-   wensen zonder MoSCoW → vraag prioriteit

## **4.8 TurnPlanner**

### Functie

Bepaalt **wat de AI moet doen**, hoe, met welke toon.

### Mogelijke doelen:

-   fill_data

-   anticipate_and_guide

-   surface_risks

-   offer_alternatives

-   summarize_and_next_step

-   answer_advice_question

### Prioriteit matrix

1.  Blocking system conflicts

2.  Critical anticipation

3.  Warning conflicts

4.  Behavioral needs

5.  Normal data completion

### Hard rules

-   TurnPlan bepaalt:

    -   goal

    -   tone

    -   requiredActions

    -   allowPatches

## **4.9 ResponseOrchestrator**

### Functie

Bouwt de definitieve prompt op basis van:

-   TurnPlan

-   Memory

-   Behavior

-   Anticipation

-   Conflicts

-   RAG nuggets

-   Customer examples

-   Chapter Opening Templates

### Hard rules

-   1 vraag per beurt

-   Formele taal

-   Geen emojis

-   Max 150 woorden

-   Alle conclusies traceerbaar naar data

## **4.10 AnswerGuard**

### Functie

Valideert dat output:

-   voldoet aan stijl

-   voldoet aan turnPlan

-   geen hallucinaties bevat

-   geen verboden acties bevat

### Hard rules

-   Eerst rule-based check

-   Alleen bij twijfel mini-LLM check (kosten laag)

-   Output is of:

    -   OK

    -   NOT OK + reden

LLM-output wordt nooit ongefilterd doorgezet.

## **4.11 ArchitectFallback**

### Functie

Bij LLM-fout → simpele robuuste fallbackboodschap:

Er lijkt technisch iets mis te gaan.

Laten we toch een kleine stap vooruit zetten.

\${fallbackQuestion}

# ============================================================

# **5. CHAPTER OPENING PROTOCOL (VERPLICHT)**

# ============================================================

Dit is een van de belangrijkste onderdelen van v3.1.

### De wizard **mag nooit een hoofdstuk openen zonder AI-reactie**.

Bij elke chapter-switch wordt **altijd** een Chapter Opening Message gegenereerd.

## **5.1 6-STAPPEN PROTOCOL**

### **Stap 1 --- Context Laden**

-   requiredFields

-   existingData

-   schema

### **Stap 2 --- AnticipationEngine**

-   toont max 1 kritieke vraag

-   toont geen middelmatige vragen

### **Stap 3 --- SystemIntelligence**

-   blocking conflict → wordt direct benoemd

### **Stap 4 --- BehaviorAnalyzer**

Tone afhankelijk van gedrag.

### **Stap 5 --- TurnPlanner**

Bepaalt:

-   goal

-   tone

-   requiredActions

-   allowPatches: **NOOIT** bij chapter-start

### **Stap 6 --- First Message Generation**

Altijd:

-   uitleg waarom hoofdstuk belangrijk is

-   1 concrete vervolgvraag

-   formele stijl

-   geen emoji's

## **5.2 Geen patches bij hoofdstukopening**

Dit is een harde regel.

# ============================================================

# **6. UX RULES (HARD & SOFT CONSTRAINTS)**

# ============================================================

## **6.1 No Dead Ends**

Wizard moet altijd één van deze doen:

-   vervolgvragen

-   alternatieven

-   samenvatting + voorstel volgende stap

## **6.2 User Always in Control**

AI mag niets automatisch invullen.

## **6.3 Explain Your Why**

Alle adviezen bevatten:

-   de observatie

-   de implicatie

-   de reden dat dit nu relevant is

# ============================================================

# **7. DATA STRUCTURE CONSISTENCY**

# ============================================================

### Wizard, Chat en PvE moeten dezelfde datastructuren delen.

## **7.1 PatchEvent Structure**

{

\"chapter\": \"budget\",

\"delta\": { \"path\": \"budgetTotaal\", \"operation\": \"set\", \"value\": 250000 },

\"confidence\": 0.85,

\"requiresConfirmation\": true,

\"userFacingLabel\": \"Budget instellen op €250.000?\",

\"reasoning\": \"Op basis van uw wensen en oppervlakte.\"

}

## **7.2 Customer Example Structure**

Moet bevatten:

-   userQuery

-   interpretation

-   tags

-   followupStrategy

-   suggestedPatches

## **7.3 Conversation History Records**

Moet bevatten:

-   role

-   message

-   snapshot

-   triggersHandled

-   patchesApplied

# ============================================================

# **8. PERFORMANCE REQUIREMENTS**

# ============================================================

### **AI-turn latency p95 \< 2000 ms**

(dankzij parallel execution)

### **No infinite loops**

(source tracking enforced)

### **Token footprint \< 4000 tokens**

(ContextPruner verplicht)

# ============================================================

# **9. SECURITY REQUIREMENTS**

# ============================================================

-   RLS verplicht voor conversation_history

-   Geen persoonlijke data in LLM prompts

-   Geen API keys in frontend

-   FeedbackQueue voorkomt overbelasting

# ============================================================

# **10. QUALITY GATES BEFORE RELEASE**

# ============================================================

## **10.1 Unit Tests**

Minimaal 50:

-   TurnPlanner priority

-   System conflicts

-   Anticipation triggers

-   BehaviorAnalyzer inferentie

-   FieldWatcher loops

## **10.2 Integration Tests**

Minimaal 10:

-   complete wizard runs

-   chapter switching

-   fallback behavior

-   MoSCoW mismatch detection

-   lifestyle mismatch detection

## **10.3 Regression Tests**

Alle v3.0 functionaliteit moet blijven werken.

# ============================================================

# **11. RELEASE SIGN-OFF CRITERIA**

# ============================================================

Release v3.1 mag alleen live wanneer:

-   alle modules functioneren

-   latency p95 \< 2s

-   geen hallucinaties gedetecteerd

-   prompt pack consistent is

-   alle tests groen zijn

-   geen infinite loops gedetecteerd

-   UX geen dead-ends bevat

# ============================================================

# **12. ROADMAP TO v3.2**

# ============================================================

-   Dynamic long-term memory

-   User preference modeling

-   Monte Carlo budget simulation

-   Constraint-based design engine

-   Predictive permitting advisor
