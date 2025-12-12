# **MPLEMENTATION_CHECKLIST_v3_1.md**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

# **BRIKX IMPLEMENTATION CHECKLIST --- VERSION 3.1**

**Status:** Definitieve werklijst voor developers\
**Doel:** Dit document vertaalt het Build Manifest + Build Protocol naar concrete, uitvoerbare taken, testcases, kwaliteitscriteria en volgorde van implementatie.

Deze checklist is **verplicht** bij elke implementatie, PR-review en release.

# ============================================================

# **0. OVERVIEW**

# ============================================================

v3.1 introduceert:

-   Architect Intelligence Layer (AIL)

-   Chapter Opening Protocol

-   FieldWatcher + FeedbackQueue

-   Supabase ConversationMemory

-   TurnPlanner priority matrix

-   ContextPruner

-   Behavior-Driven Tone

-   SystemIntelligence

-   AnticipationEngine

-   AnswerGuard 2.0

-   ArchitectFallback

-   MoSCoW & Lifestyle integratie in AI

-   Infinite loop safeguards

-   Latency-optimalisatie (Promise.allSettled)

Alle implementatie moet plaatsvinden volgens deze checklist.

# ============================================================

# **1. SETUP PHASE**

# ============================================================

## **1.1 Repo voorbereiden**

-   ![](media/image1.wmf)Nieuwe folder aanmaken: lib/ai/

-   ![](media/image1.wmf)Nieuwe folder aanmaken: lib/ai/helpers/

-   ![](media/image1.wmf)Nieuwe folder aanmaken: lib/ai/guards/

-   ![](media/image1.wmf)Nieuwe folder aanmaken: lib/ai/chapters/

## **1.2 Config bestanden**

-   ![](media/image1.wmf)Update environment variabelen voor Supabase

-   ![](media/image1.wmf)Controleer RLS policies

-   ![](media/image1.wmf)Zet OPENAI_API_KEY server-side (nooit client)

# ============================================================

# **2. DATABASE IMPLEMENTATIE**

# ============================================================

## **2.1 conversation_history (Mandatory)**

SQL:

CREATE TABLE conversation_history (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

project_id UUID NOT NULL,

role TEXT NOT NULL CHECK (role IN (\'user\', \'assistant\', \'system\')),

message TEXT NOT NULL,

wizard_state_snapshot JSONB,

triggers_handled TEXT\[\],

patches_applied JSONB\[\],

created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

### RLS:

ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY \"Users view own history\"

ON conversation_history

FOR SELECT

USING (auth.uid() = user_id);

CREATE POLICY \"Users insert own history\"

ON conversation_history

FOR INSERT

WITH CHECK (auth.uid() = user_id);

### Checklist:

-   ![](media/image1.wmf)Tabel bestaat

-   ![](media/image1.wmf)Policies actief

-   ![](media/image1.wmf)DB triggers getest

-   ![](media/image1.wmf)Max 20 turns in memory enforced (app-level)

# ============================================================

# **3. CLIENT IMPLEMENTATIE**

# ============================================================

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

## **3.1 FieldWatcher (Critical)**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

### Taken:

-   ![](media/image1.wmf)Detecteer wijzigingen per chapter

-   ![](media/image1.wmf)Detecteer alleen changes met source=\"user\"

-   ![](media/image1.wmf)Detecteer m², aantal kamers, afmetingen, budget, wensen, techniek

### Infinite-loop preventie:

-   ![](media/image1.wmf)Alleen triggers wanneer source=\"user\"

-   ![](media/image1.wmf)Patches van AI zetten source=\"ai\"

### Output:

-   ![](media/image1.wmf)Array ArchitectTrigger\[\]

### Testcases:

-   ![](media/image1.wmf)5 kamers toevoegen → slechts 1 batch trigger

-   ![](media/image1.wmf)AI patch mag nooit trigger veroorzaken

-   ![](media/image1.wmf)Trigger bij inconsistentie (budget \< must-haves)

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

## **3.2 FeedbackQueue**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

Taken:

-   ![](media/image1.wmf)Debounce 1 seconde

-   ![](media/image1.wmf)Dedupliceer triggers

-   ![](media/image1.wmf)Sorteer op severity

-   ![](media/image1.wmf)Max 2 triggers outputten naar chat

Testcases:

-   ![](media/image1.wmf)10 triggers binnen 1s → slechts 2 weergegeven

-   ![](media/image1.wmf)Volgorde op severity correct

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

## **3.3 useWizardState integratie**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

Taken:

-   ![](media/image1.wmf)voeg source toe aan applyPatch

-   ![](media/image1.wmf)detecteer chapter transitions

-   ![](media/image1.wmf)roep triggerChapterOpening() bij chapter switch

Testcases:

-   ![](media/image1.wmf)Chapter wissel → AI moet altijd spreken

-   ![](media/image1.wmf)AI patches houden state consistent

-   ![](media/image1.wmf)Geen dubbele triggers bij rapid changes

# ============================================================

# **4. SERVER IMPLEMENTATIE**

# ============================================================

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

## **4.1 ConversationMemory**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

Taken:

-   ![](media/image1.wmf)Implementatie load()

-   ![](media/image1.wmf)Implementatie addTurn()

-   ![](media/image1.wmf)Implementatie getRelevantContext()

-   ![](media/image1.wmf)Keyword similarity als fallback (geen embeddings v3.1)

Testcases:

-   ![](media/image1.wmf)20 turns → oudste valt weg

-   ![](media/image1.wmf)Relevante turns correct gesampled

-   ![](media/image1.wmf)Memory werkt na refresh (serverless)

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

## **4.2 BehaviorAnalyzer**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

Taken:

-   ![](media/image1.wmf)onzekerheid detectie

-   ![](media/image1.wmf)overweldiging detectie

-   ![](media/image1.wmf)snelheid gedrag

-   ![](media/image1.wmf)ervaring (op basis van data consistentie)

Testcases:

-   ![](media/image1.wmf)user zegt "ik weet het niet" → uncertain

-   ![](media/image1.wmf)user typt snel meerdere korte antwoorden → fast

-   ![](media/image1.wmf)user maakt veel fouten → overwhelmed

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

## **4.3 AnticipationEngine**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

Taken:

-   ![](media/image1.wmf)maak per hoofdstuk anticipatie-regels

-   ![](media/image1.wmf)max 1 kritieke vraag tegelijk

-   ![](media/image1.wmf)anticipatie vóór reguliere vragen

Testcases:

-   ![](media/image1.wmf)renovatie → eerst vraag bestaande tekeningen

-   ![](media/image1.wmf)gezin + 1 badkamer → vraag over ochtendspits

-   ![](media/image1.wmf)grote uitbouw → vraag vergunningen

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

## **4.4 SystemIntelligence**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

Taken:

-   ![](media/image1.wmf)implementatie conflicts:

    -   budget mismatch

    -   isolatie vs glas

    -   gezin vs aantal badkamers

    -   MoSCoW must-haves vs budget

    -   lifestyle mismatch

-   ![](media/image1.wmf)severity levels

-   ![](media/image1.wmf)conflict options toevoegen

Testcases:

-   ![](media/image1.wmf)budget €100k + 80m2 + luxe wensen → conflict

-   ![](media/image1.wmf)veel glas + slechte isolatie → conflict

-   ![](media/image1.wmf)gezin 5 personen + 1 badkamer → conflict

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

## **4.5 TurnPlanner**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

### Taken:

-   ![](media/image1.wmf)priority matrix implementatie

-   ![](media/image1.wmf)goal selectie

-   ![](media/image1.wmf)tone selectie

-   ![](media/image1.wmf)required actions bepalen

-   ![](media/image1.wmf)allowPatches bepalen

### Testcases:

-   ![](media/image1.wmf)blocking conflict → surface_risks

-   ![](media/image1.wmf)critical anticipation → anticipate_and_guide

-   ![](media/image1.wmf)warning conflict → offer_alternatives

-   ![](media/image1.wmf)geen issues → fill_data

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

## **4.6 ContextPruner**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

Taken:

-   ![](media/image1.wmf)alle context reduceren tot \< 4000 tokens

-   ![](media/image1.wmf)chapterspecifieke filtering

-   ![](media/image1.wmf)conversation context max 3 turns

-   ![](media/image1.wmf)RAG nuggets max 3

-   ![](media/image1.wmf)examples max 2

Testcases:

-   ![](media/image1.wmf)extreem grote state → blijft \< 4000 tokens

-   ![](media/image1.wmf)juiste context behouden voor elk TurnGoal

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

## **4.7 ResponseOrchestrator**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

Taken:

-   ![](media/image1.wmf)bouw prompt

-   ![](media/image1.wmf)genereer antwoord

-   ![](media/image1.wmf)output in structureel JSON

-   ![](media/image1.wmf)nooit meer dan 150 woorden

-   ![](media/image1.wmf)formele toon ("u")

-   ![](media/image1.wmf)1 vraag per beurt

Testcases:

-   ![](media/image1.wmf)ask fill_data → 1 vraag

-   ![](media/image1.wmf)ask anticipate → motiveer waarom + 1 vraag

-   ![](media/image1.wmf)ask surface_risks → benoem conflict

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

## **4.8 AnswerGuard 2.0**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

Taken:

-   ![](media/image1.wmf)rule-based pre-check

-   ![](media/image1.wmf)mini-LLM tone check (optioneel)

-   ![](media/image1.wmf)compliance scoring

-   ![](media/image1.wmf)retry mechanism

Testcases:

-   ![](media/image1.wmf)detect informal speech ("je")

-   ![](media/image1.wmf)detect dubbelzinnigheid

-   ![](media/image1.wmf)detect off-topic zones

-   ![](media/image1.wmf)detect te lange antwoorden

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

## **4.9 ArchitectFallback**

# \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--

Taken:

-   ![](media/image1.wmf)genereer korte fallback vraag

-   ![](media/image1.wmf)toon chapterprogress

-   ![](media/image1.wmf)geen patches

Testcases:

-   ![](media/image1.wmf)LLM 500 error → fallback werkt

-   ![](media/image1.wmf)LLM timeout → fallback werkt

# ============================================================

# **5. CHAPTER OPENING PROTOCOL IMPLEMENTATIE**

# ============================================================

Taken:

-   ![](media/image1.wmf)detecteer chapter switch

-   ![](media/image1.wmf)run 6-stappen protocol

-   ![](media/image1.wmf)nooit patches toestaan

-   ![](media/image1.wmf)1 openingsvraag per hoofdstuk

-   ![](media/image1.wmf)motiveer waarom hoofdstuk belangrijk is

Testcases:

-   ![](media/image1.wmf)user gaat naar "ruimtes" → altijd openingsbericht

-   ![](media/image1.wmf)conflict scenario → conflict eerst benoemen

-   ![](media/image1.wmf)anticipatie scenario → anticipatievraag eerst

# ============================================================

# **6. UNIT TEST SUITE**

# ============================================================

### Minimaal 50 unit tests --- verplicht

Categorieën:

### **FieldWatcher (6 tests)**

-   inconsistentie detectie

-   no loops

### **AnticipationEngine (10 tests)**

-   renovatie rules

-   gezin rules

-   vergunning rules

### **SystemIntelligence (12 tests)**

-   conflicts

-   severity

-   hybrid cases

### **BehaviorAnalyzer (6 tests)**

### **TurnPlanner (8 tests)**

### **ContextPruner (4 tests)**

### **AnswerGuard (4 tests)**

# ============================================================

# **7. INTEGRATION TEST SUITE**

# ============================================================

### Minimaal 10 end-to-end scenario's:

-   nieuwbouw volledig

-   verbouwing volledig

-   bijgebouw volledig

-   budget tekort scenario

-   MoSCoW must-have failure

-   lifestyle conflict scenario

-   fallback bij LLM failure

-   chapter switching zonder dead-ends

-   patches bevestigen

-   RAG + examples integratie

# ============================================================

# **8. ACCEPTANCE CRITERIA**

# ============================================================

### WEEK 1 -- Fundamentals

-   ![](media/image1.wmf)memory werkt

-   ![](media/image1.wmf)fieldwatcher werkt

-   ![](media/image1.wmf)anticipation werkt

-   ![](media/image1.wmf)systemintelligence werkt

-   ![](media/image1.wmf)triggers correct

### WEEK 2 -- Behavior + Planning

-   ![](media/image1.wmf)behavior profiles consistent

-   ![](media/image1.wmf)turn goals correct

-   ![](media/image1.wmf)tone is correct

-   ![](media/image1.wmf)context pruning werkt

### WEEK 3 -- Quality & Guardrails

-   ![](media/image1.wmf)answerguard = 95% compliance

-   ![](media/image1.wmf)fallback werkt elegant

-   ![](media/image1.wmf)no dead ends

-   ![](media/image1.wmf)final regressions groen

### LATENCY

-   ![](media/image1.wmf)p95 \< 2000ms

# ============================================================

# **9. RELEASE CHECKLIST**

# ============================================================

### Voor livegang, alle vinkjes verplicht:

-   ![](media/image1.wmf)Alle tests groen

-   ![](media/image1.wmf)Geen linter errors

-   ![](media/image1.wmf)Wizard doorloopt alle hoofdstukken zonder stilte

-   ![](media/image1.wmf)AI toont correcte chapter openings

-   ![](media/image1.wmf)Patches alleen na bevestiging

-   ![](media/image1.wmf)Anticipation werkt in 100% van relevante scenario's

-   ![](media/image1.wmf)Conflicts worden correct benoemd

-   ![](media/image1.wmf)Toon is formeel

-   ![](media/image1.wmf)Prompt pack up-to-date

-   ![](media/image1.wmf)Export consistent

-   ![](media/image1.wmf)Logging op niveau INFO en ERROR

# ============================================================

# **10. POST-RELEASE MONITORING**

# ============================================================

Binnen 14 dagen tracken:

-   ![](media/image1.wmf)% van antwoorden dat AnswerGuard blokkeert

-   ![](media/image1.wmf)latency

-   ![](media/image1.wmf)chapter transitions zonder openingsbericht

-   ![](media/image1.wmf)aantal fallback responses

-   ![](media/image1.wmf)patch acceptance rate

-   ![](media/image1.wmf)completion rate wizard

-   ![](media/image1.wmf)frustratie signalen (behavior analyzer)

# ============================================================

# **11. UPGRADE PATH NAAR v3.2**

# ============================================================

-   embeddings-based memory

-   design constraints engine

-   long-term user memory

-   graph-based consistency checker

-   style-per-user preference system

-   training van eigen architect-LLM
