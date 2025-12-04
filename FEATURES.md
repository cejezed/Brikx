# Brikx Wizard - Feature Registry v3.3

**Last Updated:** 2025-11-26
**Registry:** [config/features.registry.json](./config/features.registry.json)

Dit document documenteert alle kritieke features van de Brikx Wizard applicatie. Elke feature heeft een uniek ID en is gekoppeld aan specifieke files en check-patterns.

---

## ⚠️ CRITICAL WORKFLOW - MUST READ

**Voor ELKE code edit:**

1. ✅ **LEES** dit bestand EERST
2. ✅ **LEES** de VOLLEDIGE file die je gaat editen (niet alleen snippet)
3. ✅ **CONTROLEER** dat je edit geen features uit dit register verwijdert
4. ✅ **RUN** `npm run check:features` NA de edit
5. ✅ **VERIFY** dat alle checks nog groen zijn

**Voor AI Agents (Claude Code):**
- NEVER edit a file without reading it fully first
- ALWAYS check feature registry before editing
- ALWAYS verify with `npm run check:features` after editing
- If a feature must be removed: update registry + checks + docs together

---

## 📋 Feature Index

### Wizard Core (5 features)
- [WIZARD_F01_CHAPTER_FLOW](#wizard_f01_chapter_flow) - 7-Chapter Wizard Flow
- [WIZARD_F02_PATCH_SYSTEM](#wizard_f02_patch_system) - Patch Event System
- [WIZARD_F03_MOSCOW_PRIORITIES](#wizard_f03_moscow_priorities) - MoSCoW Prioriteiten
- [WIZARD_F04_BUDGET_TRACKING](#wizard_f04_budget_tracking) - Budget Data Structure
- [WIZARD_F05_WIZARD_STATE](#wizard_f05_wizard_state) - Central WizardState

### Chat (10 features)
- [CHAT_F01_SMART_FOLLOWUP](#chat_f01_smart_followup) - Smart Follow-up Questions
- [CHAT_F02_META_TOOLING](#chat_f02_meta_tooling) - META_TOOLING Pre-layer
- [CHAT_F03_ONBOARDING](#chat_f03_onboarding) - Chat Onboarding
- [CHAT_F04_RAG_GUARD](#chat_f04_rag_guard) - RAG Guard Layer
- [CHAT_F05_INTENT_CLASSIFICATION](#chat_f05_intent_classification) - Intent Classification
- [CHAT_F06_SSE_STREAMING](#chat_f06_sse_streaming) - SSE Streaming Protocol
- [CHAT_F07_PROMODEL_PATCHES](#chat_f07_promodel_patches) - ProModel Patch Generation
- [CHAT_F08_CONFIRMATION_REQUIREMENT](#chat_f08_confirmation_requirement) - Confirmation Requirement
- [CHAT_F09_U_UW_FORMAL_TONE](#chat_f09_u_uw_formal_tone) - Formal U/Uw Tone
- [CHAT_F10_QUICK_REPLIES](#chat_f10_quick_replies) - Chapter Quick Replies

### PvE & Export (3 features)
- [PVE_F01_PRIORITIES_VISIBLE](#pve_f01_priorities_visible) - MoSCoW in PvE
- [PVE_F02_CHAPTER_STRUCTURE](#pve_f02_chapter_structure) - PvE Chapter Structure
- [PVE_F03_EXPORT_MODAL](#pve_f03_export_modal) - Export Modal

### Premium (3 features)
- [PREMIUM_F01_MODE_GATING](#premium_f01_mode_gating) - Premium Mode Gating
- [PREMIUM_F02_PREMIUM_INSIGHTS](#premium_f02_premium_insights) - Premium Detail Components
- [PREMIUM_F03_PREMIUM_BADGES](#premium_f03_premium_badges) - Premium UI Indicators

### Risk Analysis (3 features)
- [RISK_F01_BUDGET_VS_WENSEN](#risk_f01_budget_vs_wensen) - Budget vs Wensen Analysis
- [RISK_F02_LIFESTYLE_PROFILING](#risk_f02_lifestyle_profiling) - Lifestyle Profile
- [RISK_F03_SCOPE_PROFILING](#risk_f03_scope_profiling) - Scope Profile

### Data Integrity (3 features)
- [DATA_F01_CHAPTER_VALIDATION](#data_f01_chapter_validation) - Chapter Schema Validation
- [DATA_F02_UUID_INJECTION](#data_f02_uuid_injection) - UUID Injection
- [DATA_F03_STATE_VERSIONING](#data_f03_state_versioning) - State Versioning

### Expert Corner (6 features)
- [EXPERT_F01_CORE_COMPONENT](#expert_f01_core_component) - ExpertCorner Component
- [EXPERT_F02_TECHNIEK_TIPS](#expert_f02_techniek_tips) - TECHNIEK_TIPS Data
- [EXPERT_F03_GET_EXPERT_TIPS](#expert_f03_get_expert_tips) - getExpertTips Utility
- [EXPERT_F04_EXPERT_API](#expert_f04_expert_api) - Expert API Endpoint
- [EXPERT_F05_LIFESTYLE_HINTS](#expert_f05_lifestyle_hints) - Lifestyle Hints Integration
- [EXPERT_F06_TIP_COMPONENTS](#expert_f06_tip_components) - Tip UI Components

**Total: 33 Protected Features**

---

## 🏗️ WIZARD CORE FEATURES

### WIZARD_F01_CHAPTER_FLOW

**7-Chapter Wizard Flow**

**Waarom kritiek:**
- Kern van de wizard - bepaalt hele app structuur
- Breaking changes hier breken UI, routing, state management
- ChapterKey type is basis voor type safety door hele app

**Files:**
- `types/project.ts` (lines 374-384)

**Implementation:**
```typescript
export type ChapterDataMap = {
  basis: BasisData;
  ruimtes: RuimtesData;
  wensen: WensenData;
  budget: BudgetData;
  techniek: TechniekData;
  duurzaam: DuurzaamData;
  risico: RisicoData;
};

export type ChapterKey = keyof ChapterDataMap;
```

**Check:**
```bash
grep -n "ChapterDataMap" types/project.ts
grep -n "basis.*ruimtes.*wensen.*budget.*techniek.*duurzaam.*risico" types/project.ts
```

**Recovery:**
Als deze feature verdwijnt:
1. Check `git show HEAD~1:types/project.ts`
2. Restore ChapterDataMap definitie
3. Verify all 7 chapters present
4. Run `npm run type-check`

---

### WIZARD_F02_PATCH_SYSTEM

**Patch Event System**

**Waarom kritiek:**
- Enige manier om wizard state te wijzigen
- Type-safe contract tussen AI en state management
- Breaking changes breken chat-to-wizard integratie

**Files:**
- `types/project.ts` (lines 391-410)
- `lib/utils/patch.ts`

**Implementation:**
```typescript
export type PatchDelta = {
  path: string;
  operation: "set" | "append" | "remove";
  value?: any;
};

export type PatchEvent = {
  chapter: ChapterKey;
  delta: PatchDelta;
};

export type GeneratePatchResult = {
  action?: "none" | "reset" | "undo";
  patches: PatchEvent[];
  followUpQuestion?: string;
};
```

**Check:**
```bash
grep -n "PatchEvent\|PatchDelta" types/project.ts
grep -n "set.*append.*remove" types/project.ts
```

**Recovery:**
See types/project.ts lines 391-410 for canonical definition.

---

### WIZARD_F03_MOSCOW_PRIORITIES

**MoSCoW Prioriteiten**

**Waarom kritiek:**
- Gebruikers kunnen wensen prioriteren (must/nice/optional/wont)
- AI beschermt must-haves bij budget conflicts
- Zichtbaar in UI, PvE, export

**Files:**
- `lib/ai/ProModel.ts` (lines 384-422)
- `types/project.ts` (WensenData definition)

**Implementation:**
System prompt bevat:
```
MOSCOW PRIORITEITEN (BELANGRIJK):
- MUST-HAVE (priority="must"): Niet-onderhandelbaar
- NICE-TO-HAVE (priority="nice"): Belangrijk maar flexibel
- OPTIONEEL (priority="optional"): Fase 2
- WON'T-HAVE (priority="wont"): ABSOLUUT NIET (VETO)

REGELS:
1. MUST-HAVE WENSEN ZIJN BESCHERMD
2. WON'T-HAVE VETO
3. BIJ BUDGET-ADVIES: optional eerst, dan nice-to-have
```

**Check:**
```bash
grep -n "MoSCoW" lib/ai/ProModel.ts
grep -n "priority.*must.*nice.*optional.*wont" lib/ai/ProModel.ts
```

**Recovery:**
See ProModel.ts lines 384-422 for full MoSCoW rules.

---

### WIZARD_F04_BUDGET_TRACKING

**Budget Data Structure**

**Waarom kritiek:**
- Budget is kern constraint voor project
- Gebruikt voor risk analysis (budget vs wensen)
- Basis voor premium insights

**Files:**
- `types/project.ts` (BudgetData definition)

**Implementation:**
```typescript
export interface BudgetData {
  budgetTotaal?: number;
  budgetMin?: number;
  budgetMax?: number;
  eigenInbreng?: string;
  contingency?: number;
  // ... etc
}
```

**Check:**
```bash
grep -n "BudgetData" types/project.ts
grep -n "budgetTotaal" types/project.ts
```

---

### WIZARD_F05_WIZARD_STATE

**Central WizardState**

**Waarom kritiek:**
- Single source of truth voor wizard data
- Zustand store - breaking changes breken hele app
- Bevat chapterAnswers, currentChapter, mode, etc.

**Files:**
- `types/project.ts` (WizardState definition)
- `lib/stores/useWizardState.ts`

**Implementation:**
```typescript
export interface WizardState {
  stateVersion: number;
  chapterAnswers: Partial<ChapterDataMap>;
  currentChapter: ChapterKey | null;
  chapterFlow: ChapterKey[];
  mode: "PREVIEW" | "PREMIUM";
  // ... etc
}
```

**Check:**
```bash
grep -n "WizardState" types/project.ts
grep -n "chapterAnswers\|currentChapter\|chapterFlow" types/project.ts
```

---

## 💬 CHAT FEATURES

### CHAT_F01_SMART_FOLLOWUP

**Smart Follow-up Questions**

**Waarom kritiek:**
- Voorkomt "doodlopende" gesprekken
- Gebruiker weet altijd wat volgende stap is
- Kern van conversational UX

**Files:**
- `app/api/chat/route.ts` (line 320: `responseText = llmResult.followUpQuestion`)
- `lib/ai/ProModel.ts` (lines 595-600: fallback logic)

**Implementation:**
Route.ts:
```typescript
const llmResult = await ProModel.generatePatch(query, wizardState, history);
responseText = llmResult.followUpQuestion || "";
```

ProModel.ts fallback:
```typescript
if (!parsed.followUpQuestion) {
  parsed.followUpQuestion =
    parsed.patches?.length === 0
      ? "Waarmee kan ik u helpen? U kunt me vertellen over uw project, budget, ruimtes of wensen."
      : "";
}
```

**Check:**
```bash
grep -n "followUpQuestion" app/api/chat/route.ts
grep -n "followUpQuestion" lib/ai/ProModel.ts
```

**Recovery:**
1. Check both files for followUpQuestion logic
2. Ensure route.ts sets `responseText = llmResult.followUpQuestion`
3. Ensure ProModel.ts has fallback logic
4. Test chat returns follow-up questions

---

### CHAT_F02_META_TOOLING

**META_TOOLING Pre-layer**

**Waarom kritiek:**
- Voorkomt dat "hoe gebruik ik deze chat" naar RAG gaat
- Fixed responses zonder AI hallucination
- Pre-layer draait VOOR intent classification

**Files:**
- `app/api/chat/route.ts` (lines 137-175)
- `lib/ai/metaDetection.ts`
- `lib/ai/toolHelp.ts`

**Implementation:**
```typescript
// Pre-layer in runAITriage
if (detectMetaTooling(query)) {
  const helpResponse = getToolHelp(query, { currentChapter });
  writer.writeEvent("stream", { text: helpResponse.answer });
  return; // STOP - no RAG, no AI
}
```

**Check:**
```bash
grep -n "detectMetaTooling" app/api/chat/route.ts
grep -n "META_TOOLING" app/api/chat/route.ts
grep -n "getToolHelp" app/api/chat/route.ts
```

**Recovery:**
See app/api/chat/route.ts lines 137-175 for pre-layer implementation.

---

### CHAT_F03_ONBOARDING

**Chat Onboarding**

**Waarom kritiek:**
- Lost "lege chat" probleem op
- Gebruiker ziet direct wat ze kunnen doen
- Toont progress, chapter, quick replies

**Files:**
- `app/api/chat/route.ts` (lines 177-214: ONBOARDING check)
- `components/chat/ChatPanel.tsx` (lines 29-31, 103-108: showOnboarding logic)
- `app/wizard/components/ChatOnboarding.tsx` (component zelf)

**Implementation:**
Route.ts:
```typescript
const userMessages = history?.filter((m) => m.role === "user") ?? [];
if (userMessages.length === 0) {
  const onboardingResponse = getOnboardingMessage(activeChapter);
  writer.writeEvent("stream", { text: onboardingResponse.answer });
  return; // STOP
}
```

ChatPanel.tsx:
```typescript
const showOnboarding = userMessages.length === 0;
// ...
{showOnboarding ? <ChatOnboarding .../> : messages.map(...)}
```

**Check:**
```bash
grep -n "showOnboarding" components/chat/ChatPanel.tsx
grep -n "ChatOnboarding" components/chat/ChatPanel.tsx
grep -n "getOnboardingMessage" app/api/chat/route.ts
```

---

### CHAT_F04_RAG_GUARD

**RAG Guard Layer**

**Waarom kritiek:**
- Voorkomt slechte RAG matches
- Minconfidence threshold filtert lage-kwaliteit results
- Keyword blacklist blokkeert meta-woorden

**Files:**
- `lib/ai/kennisbank.ts`

**Implementation:**
```typescript
// Guard layer in Kennisbank.query()
const minConfidence = 0.7;
const keywordBlacklist = ["wizard", "chat", "tool", "gebruik", "werkt"];

// Filter results
const filtered = results.filter(r =>
  r.confidence >= minConfidence &&
  !keywordBlacklist.some(kw => query.includes(kw))
);
```

**Check:**
```bash
grep -n "minConfidence\|keywordBlacklist" lib/ai/kennisbank.ts
```

**Recovery:**
See kennisbank.ts for guard implementation.

---

### CHAT_F05_INTENT_CLASSIFICATION

**Intent Classification**

**Waarom kritiek:**
- Routes query naar juiste handler (patches vs RAG vs navigatie)
- Core routing logic
- Breaking changes breken hele chat flow

**Files:**
- `lib/ai/ProModel.ts` (classify() method)
- `app/api/chat/route.ts` (intent routing)

**Implementation:**
```typescript
export type ProIntent =
  | "VULLEN_DATA"      // → generatePatch
  | "ADVIES_VRAAG"     // → RAG
  | "NAVIGATIE"        // → navigate
  | "SMALLTALK"        // → simple response
  | "OUT_OF_SCOPE";    // → decline

const { intent } = await ProModel.classify(query, wizardState);

if (intent === "VULLEN_DATA") {
  // generatePatch flow
} else if (intent === "ADVIES_VRAAG") {
  // RAG flow
} // etc
```

**Check:**
```bash
grep -n "VULLEN_DATA\|ADVIES_VRAAG\|NAVIGATIE\|SMALLTALK" lib/ai/ProModel.ts
grep -n "intent.*===.*VULLEN_DATA" app/api/chat/route.ts
```

---

### CHAT_F06_SSE_STREAMING

**SSE Streaming Protocol**

**Waarom kritiek:**
- Contract tussen server en client
- Breaking changes breken UI updates
- Events: metadata, stream, suggestions, patch, done

**Files:**
- `app/api/chat/route.ts`
- `lib/sse/stream.ts`

**Implementation:**
```typescript
writer.writeEvent("metadata", { intent, confidence, policy });
writer.writeEvent("stream", { text: chunk });
writer.writeEvent("suggestions", { suggestions: [...] });
writer.writeEvent("patch", patchEvent);
writer.writeEvent("done", { logId, tokensUsed, latencyMs });
```

**Check:**
```bash
grep -n "writeEvent.*metadata\|writeEvent.*stream\|writeEvent.*done" app/api/chat/route.ts
```

---

### CHAT_F07_PROMODEL_PATCHES

**ProModel Patch Generation**

**Waarom kritiek:**
- Core AI functie - genereert patches uit natural language
- Return type moet GeneratePatchResult zijn
- Gebruikt OpenAI API met system prompt

**Files:**
- `lib/ai/ProModel.ts` (generatePatch method, lines 517-617)

**Implementation:**
```typescript
static async generatePatch(
  query: string,
  wizardState: WizardState,
  history?: HistoryItem[]
): Promise<GeneratePatchResult> {
  // Build system prompt with wizard context
  // Call OpenAI API
  // Parse response to patches array + followUpQuestion
  return { action, patches, followUpQuestion };
}
```

**Check:**
```bash
grep -n "generatePatch.*GeneratePatchResult" lib/ai/ProModel.ts
```

---

### CHAT_F08_CONFIRMATION_REQUIREMENT

**Confirmation Requirement**

**Waarom kritiek:**
- Gebruiker moet altijd weten wat AI gedaan heeft
- Voorkomt verwarring
- Deel van system prompt

**Files:**
- `lib/ai/ProModel.ts` (system prompt lines 293-298)

**Implementation:**
```
4. BEVESTIGING IS VERPLICHT: Als u 1 of meer patches genereert, MOET uw "followUpQuestion" ALTIJD beginnen met een korte, duidelijke bevestiging van wat u heeft gedaan.
   Voorbeelden van goede bevestigingen:
   - "Ik heb 3 slaapkamers en 3 badkamers toegevoegd."
   - "Prima, het budget is ingesteld op €400.000."
```

**Check:**
```bash
grep -n "BEVESTIGING IS VERPLICHT" lib/ai/ProModel.ts
```

---

### CHAT_F09_U_UW_FORMAL_TONE

**Formal U/Uw Tone**

**Waarom kritiek:**
- Professionele tone voor B2C product
- Consistent door hele app
- Breaking: plots "je/jij" is unprofessional

**Files:**
- `lib/ai/toolHelp.ts` (all texts)
- `lib/ai/ProModel.ts` (system prompt)

**Implementation:**
All AI responses use:
- "u" not "je"
- "uw" not "jouw"
- "U kunt..." not "Je kunt..."

**Check:**
```bash
grep -n "spreek.*aan met.*u\|u kunt\|uw project" lib/ai/ProModel.ts
grep -n "Waarmee kan ik u helpen" lib/ai/toolHelp.ts
```

---

### CHAT_F10_QUICK_REPLIES

**Chapter Quick Replies**

**Waarom kritiek:**
- Gebruiker krijgt concrete next steps
- Per chapter 4 suggesties
- Deel van onboarding + tool help

**Files:**
- `lib/ai/toolHelp.ts` (QUICK_REPLIES constant)

**Implementation:**
```typescript
const QUICK_REPLIES: Record<ChapterKey, string[]> = {
  basis: [
    "Wat moet ik hier invullen?",
    "Ik wil een aanbouw van 30m²",
    "We zijn een gezin met 2 kinderen",
    "Budget is ongeveer €100.000",
  ],
  // ... 6 more chapters
};
```

**Check:**
```bash
grep -n "QUICK_REPLIES.*ChapterKey" lib/ai/toolHelp.ts
```

---

## 📄 PVE & EXPORT FEATURES

### PVE_F01_PRIORITIES_VISIBLE

**MoSCoW in PvE**

**Waarom kritiek:**
- Gebruiker ziet prioriteiten in eindrapport
- Must-haves zijn gemarkeerd
- Basis voor budget-advies in rapport

**Files:**
- `lib/report/pveView.ts`

**Check:**
```bash
grep -n "priority\|must-have\|nice-to-have" lib/report/pveView.ts
```

---

### PVE_F02_CHAPTER_STRUCTURE

**PvE Chapter Structure**

**Waarom kritiek:**
- PvE volgt 7-chapter structuur
- Breaking: rapport mist chapters

**Files:**
- `lib/report/pveView.ts`

**Check:**
```bash
grep -n "Basis\|Ruimtes\|Wensen\|Budget\|Techniek\|Duurzaam\|Risico" lib/report/pveView.ts
```

---

### PVE_F03_EXPORT_MODAL

**Export Modal**

**Waarom kritiek:**
- Gebruiker kan PvE downloaden/printen
- Premium gate hier
- Deel van core user journey

**Files:**
- `components/wizard/ExportModal.tsx`

**Check:**
```bash
grep -n "ExportModal" components/wizard/ExportModal.tsx
```

---

## 💎 PREMIUM FEATURES

### PREMIUM_F01_MODE_GATING

**Premium Mode Gating**

**Waarom kritiek:**
- Business model - freemium vs premium
- mode check overal in app
- Breaking: alle features gratis

**Files:**
- `components/premium/PremiumGate.tsx`
- `lib/stores/useWizardState.ts`

**Implementation:**
```typescript
const mode = useWizardState((s) => s.mode); // "PREVIEW" | "PREMIUM"

{mode === "PREMIUM" ? <PremiumFeature /> : <PremiumGate />}
```

**Check:**
```bash
grep -n "mode.*PREMIUM\|PremiumGate" components/premium/PremiumGate.tsx
```

---

### PREMIUM_F02_PREMIUM_INSIGHTS

**Premium Detail Components**

**Waarom kritiek:**
- Premium value proposition
- Extra analyses per chapter
- Differentiator vs free tier

**Files:**
- `components/premium/PremiumBudgetDetails.tsx`
- `components/premium/PremiumMoSCoWDetails.tsx`
- `components/premium/PremiumRiskDetails.tsx`
- etc.

**Check:**
```bash
find components/premium -name "Premium*.tsx" | xargs grep -l "mode.*PREMIUM"
```

---

### PREMIUM_F03_PREMIUM_BADGES

**Premium UI Indicators**

**Waarom kritiek:**
- Gebruiker ziet wat premium is
- Marketing voor upgrade
- Consistent door UI

**Files:**
- `components/premium/PremiumHint.tsx`

**Implementation:**
```tsx
<PremiumHint>Dit is een premium feature</PremiumHint>
```

**Check:**
```bash
grep -n "PremiumHint\|⭐\|Premium-mode" components/premium/PremiumHint.tsx
```

---

## ⚠️ RISK ANALYSIS FEATURES

### RISK_F01_BUDGET_VS_WENSEN

**Budget vs Wensen Analysis**

**Waarom kritiek:**
- AI waarschuwt als wensen niet passen bij budget
- Proactieve risk mitigation
- Gebruikt in system prompt

**Files:**
- `lib/ai/ProModel.ts` (lines 169-175)
- `lib/analysis/budgetRiskAnalysis.ts`

**Implementation:**
```typescript
const budgetAnalysis = analyzeBudgetRisk(budget, wensen, basis);
const budgetWarning = generateBudgetWarningPrompt(budgetAnalysis);
// Inject in system prompt
```

**Check:**
```bash
grep -n "analyzeBudgetRisk\|generateBudgetWarningPrompt" lib/ai/ProModel.ts
```

---

### RISK_F02_LIFESTYLE_PROFILING

**Lifestyle Profile**

**Waarom kritiek:**
- AI past tips aan op leefstijl
- Context voor architectural tips
- Gedifferentieerde service

**Files:**
- `lib/ai/ProModel.ts` (lines 199-217)
- `lib/domain/lifestyle.ts`

**Implementation:**
```typescript
const lifestyle = deriveLifestyleProfile(basis);
// → { family, work, cooking, hosting, pets, noise, mobility, tidiness }

// In system prompt:
LEEFPROFIEL (afgeleid uit de wizard):
- Gezin: ${lifestyle.family}
- Werk: ${lifestyle.work}
// etc
```

**Check:**
```bash
grep -n "deriveLifestyleProfile\|LifestyleProfile" lib/ai/ProModel.ts
```

---

### RISK_F03_SCOPE_PROFILING

**Scope Profile**

**Waarom kritiek:**
- AI weet of het hoofdwoning of bijgebouw is
- Voorkomt irrelevante tips (geen kinderen-tips voor schuur)
- Relevantie checks

**Files:**
- `lib/ai/ProModel.ts` (lines 209-217)
- `lib/domain/lifestyle.ts`

**Implementation:**
```typescript
const scopeProfile = deriveScopeProfile(basis?.projectScope);
// → { isMainResidence, isAuxiliaryBuilding, relevanceChildren, etc }

// In system prompt:
PROJECTSCOPE:
- Hoofdwoning: ${scopeProfile.isMainResidence ? "ja" : "nee"}
- Bijgebouw: ${scopeProfile.isAuxiliaryBuilding ? "ja" : "nee"}
```

**Check:**
```bash
grep -n "deriveScopeProfile\|isMainResidence\|isAuxiliaryBuilding" lib/ai/ProModel.ts
```

---

## 🔒 DATA INTEGRITY FEATURES

### DATA_F01_CHAPTER_VALIDATION

**Chapter Schema Validation**

**Waarom kritiek:**
- Patches worden gevalideerd voor apply
- Voorkomt invalid data in state
- Type safety at runtime

**Files:**
- `lib/wizard/CHAPTER_SCHEMAS.ts`
- `app/api/chat/route.ts` (lines 379-396)

**Implementation:**
```typescript
const nextData = transformWithDelta(prevData, patch.delta);
if (!validateChapter(targetChapter, nextData)) {
  responseText = "Ik kan dit nog niet verwerken...";
  break; // Reject patch
}
```

**Check:**
```bash
grep -n "validateChapter\|CHAPTER_SCHEMAS" app/api/chat/route.ts
```

---

### DATA_F02_UUID_INJECTION

**UUID Injection**

**Waarom kritiek:**
- Server genereert UUIDs, niet AI
- Voorkomt duplicate IDs
- AI mag geen IDs verzinnen

**Files:**
- `app/api/chat/route.ts` (lines 346-358)

**Implementation:**
```typescript
if (patch.delta.operation === "append" &&
    (targetChapter === "ruimtes" || targetChapter === "wensen")) {
  const val = patch.delta.value as { id?: string };
  if (!val.id) {
    val.id = randomUUID();
    console.log(`[runAITriage] Injected new UUID for ${targetChapter}`);
  }
}
```

**Check:**
```bash
grep -n "randomUUID\|Injected new UUID" app/api/chat/route.ts
```

---

### DATA_F03_STATE_VERSIONING

**State Versioning**

**Waarom kritiek:**
- State heeft versienummer
- Incrementeert bij elke patch
- Gebruikt voor concurrency/sync

**Files:**
- `types/project.ts` (WizardState.stateVersion)
- `app/api/chat/route.ts` (line 400: increment)

**Implementation:**
```typescript
wizardState.stateVersion = (wizardState.stateVersion ?? 0) + 1;
```

**Check:**
```bash
grep -n "stateVersion" types/project.ts
grep -n "stateVersion.*+.*1" app/api/chat/route.ts
```

---

## 🎯 EXPERT CORNER FEATURES

### EXPERT_F01_CORE_COMPONENT

**ExpertCorner Component with Mode Gating**

**Waarom kritiek:**
- Kern van de ExpertCorner functionaliteit
- Zorgt voor correcte PREVIEW/PREMIUM mode gating
- Basis voor alle andere Expert features (tips, RAG, lifestyle)
- Breaking changes hier breken de hele tip/advice engine

**Files:**
- `components/expert/ExpertCorner.tsx` (lines 65-308)
- `components/wizard/WizardLayout.tsx` (lines 58-61, 113)

**Implementation:**
```typescript
// WizardLayout.tsx
const isPremium = useIsPremium();
const expertMode = isPremium ? "PREMIUM" : "PREVIEW";

<ExpertCorner mode={expertMode} />

// ExpertCorner.tsx
export default function ExpertCorner({ mode: modeProp = "PREVIEW" }: ExpertCornerProps) {
  const mode: ExpertCornerMode = modeProp;

  // Premium-only features
  if (mode !== "PREMIUM" || !focusedField) {
    setRagSnippets([]);
    setLifestyleHints([]);
    return;
  }
}
```

**Check:**
```bash
grep -n "mode.*PREMIUM\|mode.*PREVIEW" components/expert/ExpertCorner.tsx
grep -n "expertMode.*isPremium" components/wizard/WizardLayout.tsx
```

**Recovery:**
Als dit feature verdwijnt:
1. ExpertCorner moet een `mode` prop accepteren van type `'PREVIEW' | 'PREMIUM'`
2. WizardLayout moet `useIsPremium()` gebruiken om mode te bepalen
3. Premium-only features (RAG, lifestyle) moeten mode-gated zijn

---

### EXPERT_F02_TECHNIEK_TIPS

**TECHNIEK_TIPS Dataset**

**Waarom kritiek:**
- Domain-specifieke technische kennis voor Techniek chapter
- Bevat tips over verwarming, ventilatie, PV, koeling, etc.
- Complementeert statische regels met veld-specifieke diepgang
- Is cruciaal voor gebruikerservaring bij complexe technische keuzes

**Files:**
- `lib/expert/techniektips.ts` (lines 1-150+)
- `lib/expert/getExpertTips.ts` (gebruikt TECHNIEK_TIPS)

**Implementation:**
```typescript
export const TECHNIEK_TIPS: Record<string, string[]> = {
  ventilationAmbition: [
    "Basis-ventilatie voldoet aan wettelijke eisen (Bouwbesluit).",
    "Balansventilatie (type D met WTW) is energiezuiniger maar duurder.",
  ],
  heatingAmbition: [
    "Basis = voldoen aan energielabel-eisen.",
    "Warmtepomp werkt efficiënter met hogere isolatie.",
  ],
  coolingAmbition: [...],
  pvAmbition: [...],
  // ... 10+ velden
};
```

**Check:**
```bash
grep -n "export const TECHNIEK_TIPS" lib/expert/techniektips.ts
grep -n "ventilationAmbition\|heatingAmbition\|coolingAmbition" lib/expert/techniektips.ts
```

**Recovery:**
Herstel TECHNIEK_TIPS object met tips voor alle Techniek-velden (ventilatie, verwarming, koeling, PV, etc.)

---

### EXPERT_F03_GET_EXPERT_TIPS

**getExpertTips Utility with Field Mapping**

**Waarom kritiek:**
- Centraal aggregatiepunt voor static + TECHNIEK_TIPS
- Field mapping zorgt voor bidirectionele veldnaam-aliases (ventilatie ↔ ventilationAmbition)
- Returntype CategorizedTip[] is API contract met UI
- Breaking changes breken ExpertCorner rendering

**Files:**
- `lib/expert/getExpertTips.ts` (lines 59-193)

**Implementation:**
```typescript
const fieldMapping: Record<string, string[]> = {
  ventilationAmbition: ["ventilationAmbition", "ventilatie"],
  ventilatie: ["ventilatie", "ventilationAmbition"],
  heatingAmbition: ["heatingAmbition", "verwarming"],
  // ... 13 mappings total
};

export function getExpertTips(focusKey: string | null): ExpertTipResult {
  const { staticTips } = getStaticTips(focusKey);
  const techniekTips = getTechniekTipsForField(focusKey);

  return {
    staticTips,
    techniekTips,
    allTips: [...staticTips, ...techniekTips],
  };
}
```

**Check:**
```bash
grep -n "fieldMapping.*Record" lib/expert/getExpertTips.ts
grep -n "export function getExpertTips" lib/expert/getExpertTips.ts
grep -n "getTechniekTipsForField" lib/expert/getExpertTips.ts
```

**Recovery:**
Herstel fieldMapping object + getExpertTips() functie die static en TECHNIEK_TIPS combineert

---

### EXPERT_F04_EXPERT_API

**Expert API Endpoint**

**Waarom kritiek:**
- Central API voor multi-source tip aggregatie
- Combineert 4 bronnen: static, techniek, RAG, lifestyle
- ExpertResponse interface is contract tussen frontend en backend
- Breaking changes breken Premium RAG + lifestyle functionaliteit

**Files:**
- `app/api/expert/route.ts` (lines 118-223)

**Implementation:**
```typescript
interface ExpertResponse {
  tips: ExpertTip[];
  ragDocs: { text: string; source?: string }[];
  lifestyleHints: string[];
  meta: {
    focusKey: string | null;
    chapter: string | null;
    query: string | null;
    totalTips: number;
  };
}

export async function POST(req: Request) {
  const { query, focusKey, chapter, basisData } = await req.json();

  // 1. Static + TECHNIEK_TIPS
  const { allTips } = getExpertTips(focusKey);

  // 2. RAG (premium)
  const ragResult = await Kennisbank.query(query, { chapter, limit: 3 });

  // 3. Lifestyle hints
  const lifestyleHints = generateLifestyleHints(basisData);

  return NextResponse.json({ tips, ragDocs, lifestyleHints, meta });
}
```

**Check:**
```bash
grep -n "export async function POST" app/api/expert/route.ts
grep -n "ExpertResponse" app/api/expert/route.ts
grep -n "generateLifestyleHints\|Kennisbank.query" app/api/expert/route.ts
```

**Recovery:**
Herstel POST endpoint met ExpertResponse interface + multi-source aggregatie

---

### EXPERT_F05_LIFESTYLE_HINTS

**Lifestyle Hints Integration**

**Waarom kritiek:**
- Persoonlijke tips gebaseerd op gebruikersprofiel (gezin, werk, koken, huisdieren)
- Verhoogt UX met contextuele "magische" adviezen
- Complete flow: basisData → API → lifestyleHints → UI rendering
- Breaking changes breken Premium personalisatie

**Files:**
- `app/api/expert/route.ts` (lines 48-112, 186-188)
- `components/expert/ExpertCorner.tsx` (lines 70, 73, 140, 150-152, 212-227)
- `lib/domain/lifestyle.ts` (deriveLifestyleProfile)

**Implementation:**
```typescript
// ExpertCorner.tsx
const basisData = useWizardState((s) => s.chapterAnswers?.basis);
const [lifestyleHints, setLifestyleHints] = useState<string[]>([]);

fetch("/api/expert", {
  body: JSON.stringify({ query, chapter, focusKey, basisData }),
})
  .then(data => {
    setLifestyleHints(data?.lifestyleHints ?? []);
  });

// UI rendering
{lifestyleHints.map((hint) => (
  <TipCard category="leefstijl" text={hint} />
))}

// API: generateLifestyleHints()
function generateLifestyleHints(basisData?: Partial<BasisData>): string[] {
  const lifestyle = deriveLifestyleProfile(basisData);

  if (lifestyle.family === "jonge_kinderen") {
    hints.push("Met jonge kinderen: zichtlijnen vanuit keuken naar speelhoek.");
  }

  if (lifestyle.work !== "niet") {
    hints.push("Bij thuiswerken: aparte werkruimte met akoestiek.");
  }

  return hints.slice(0, 3);
}
```

**Check:**
```bash
grep -n "basisData.*useWizardState" components/expert/ExpertCorner.tsx
grep -n "lifestyleHints" components/expert/ExpertCorner.tsx
grep -n "generateLifestyleHints" app/api/expert/route.ts
```

**Recovery:**
1. ExpertCorner moet basisData uit wizard state halen
2. basisData meesturen in /api/expert POST
3. API moet generateLifestyleHints() aanroepen
4. UI moet lifestyleHints renderen met "leefstijl" category

---

### EXPERT_F06_TIP_COMPONENTS

**Tip UI Components**

**Waarom kritiek:**
- Visual layer voor tip rendering
- TipCategoryBadge toont badges per categorie (basis/techniek/rag/leefstijl)
- Severity styling (info/warning/danger) voor visuele prioriteit
- Herbruikbare componenten door hele ExpertCorner

**Files:**
- `components/expert/TipCard.tsx` (lines 1-36)
- `components/expert/TipCategoryBadge.tsx`
- `components/expert/TipSkeleton.tsx`
- `components/expert/ExpertCornerHeader.tsx`

**Implementation:**
```typescript
// TipCard.tsx
export interface TipCardProps {
  id: string;
  text: string;
  category: TipCategory; // "basis" | "techniek" | "leefstijl" | "rag"
  severity?: "info" | "warning" | "danger";
}

const severityStyles: Record<string, string> = {
  info: "bg-white border-slate-200",
  warning: "bg-amber-50 border-amber-200",
  danger: "bg-red-50 border-red-200",
};

export default function TipCard({ text, category, severity = "info" }: TipCardProps) {
  return (
    <div className={`rounded-lg border p-3 ${severityStyles[severity]}`}>
      <TipCategoryBadge category={category} />
      <p>{text}</p>
    </div>
  );
}
```

**Check:**
```bash
grep -n "TipCard.*category.*severity" components/expert/TipCard.tsx
grep -n "TipCategoryBadge" components/expert/TipCategoryBadge.tsx
grep -n "severityStyles" components/expert/TipCard.tsx
```

**Recovery:**
Herstel TipCard + TipCategoryBadge componenten met category/severity props

---

## 🔧 Recovery Procedures

Als een feature verdwijnt:

### Option 1: Git Revert
```bash
git diff HEAD~1 <file>  # See what changed
git checkout HEAD~1 -- <file>  # Restore from previous commit
```

### Option 2: Partial Restore
```bash
git show HEAD~1:<file> > /tmp/old_version
# Manually copy missing feature from /tmp/old_version
```

### Option 3: Rebuild from Documentation
Gebruik dit FEATURES.md bestand om de feature te reconstrueren op basis van:
- Implementation code snippets
- Check commands
- File locations en line numbers

---

## 📊 Statistics

- **Total Features:** 33
- **Wizard Core:** 5
- **Chat:** 10
- **PvE & Export:** 3
- **Premium:** 3
- **Risk Analysis:** 3
- **Data Integrity:** 3
- **Expert Corner:** 6

**Protected Files:** 20+
**Protected Lines of Code:** ~2500+

**Last Full Audit:** 2025-11-26

---

## 🔗 Related Files

- [config/features.registry.json](./config/features.registry.json) - Machine-readable feature registry
- [PROTECTION.md](./PROTECTION.md) - Protection system guide
- [BUILD_STATUS_v3.2.md](./BUILD_STATUS_v3.2.md) - Current build status
- [scripts/check-features.sh](./scripts/check-features.sh) - Feature check script
- [.husky/pre-commit](./.husky/pre-commit) - Git pre-commit hook

---

**Made with ❤️ to protect Brikx Wizard's integrity and prevent accidental feature loss.**
