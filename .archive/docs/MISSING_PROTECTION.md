# Wat Ontbreekt Nog aan Feature Protection System v3.3

**Datum**: 2025-11-28
**Status**: Fundament gelegd, systematische completion nodig

---

## Huidige Status

### ✅ Wat is AF
1. **Fundament gelegd**: Call-site protection systeem ontworpen en geïmplementeerd
2. **Kritieke bestanden beschermd**:
   - `components/wizard/WizardLayout.tsx` - 6 @protected tags
   - `app/api/chat/route.ts` - 3 @protected tags
3. **Verificatie uitgebreid**: check-features.sh controleert nu call-sites
4. **Systeem gezond**: ✅ All 33 features present, ⚠️ GOOD HEALTH

### ❌ Wat ONTBREEKT

Op dit moment hebben **slechts 2 van de 27 bestanden** @protected tags op de juiste plekken.

---

## Per Domein: Wat Mist Er?

### 1. CHAT Domain (10 features) - **70% ONAF**

#### ✅ Beschermd (3 features):
- **CHAT_F02_META_TOOLING**: app/api/chat/route.ts (✅), lib/ai/metaDetection.ts (❌), lib/ai/toolHelp.ts (❌)
- **CHAT_F03_ONBOARDING**: app/api/chat/route.ts (✅), WizardLayout.tsx (✅), ChatPanel.tsx (❌), ChatOnboarding.tsx (❌)
- **CHAT_F10_QUICK_REPLIES**: app/api/chat/route.ts (✅), lib/ai/toolHelp.ts (❌)

#### ❌ Nog NIET beschermd (7 features):
- **CHAT_F01_SMART_FOLLOWUP**:
  - Implementation: `lib/ai/ProModel.ts` - geen @protected tags
  - Call-site: `app/api/chat/route.ts` - geen @protected tags bij ProModel calls

- **CHAT_F04_RAG_GUARD**:
  - Implementation: `lib/rag/Kennisbank.ts` - geen @protected tags bij RAG_MIN_CONFIDENCE/RAG_KEYWORD_BLACKLIST

- **CHAT_F05_INTENT_CLASSIFICATION**:
  - Implementation: `lib/ai/ProModel.ts` - geen @protected tags
  - Call-site: `app/api/chat/route.ts` - geen @protected tags

- **CHAT_F06_SSE_STREAMING**:
  - Implementation: `app/api/chat/route.ts` - geen @protected tags bij SSE logic

- **CHAT_F07_PROMPT_SYSTEM**:
  - Implementation: `lib/ai/ProModel.ts` - geen @protected tags bij buildPrompt

- **CHAT_F08_CONTEXT_MANAGER**:
  - Implementation: `lib/ai/ProModel.ts` - geen @protected tags bij ContextManager

- **CHAT_F09_STRUCTURED_OUTPUT**:
  - Implementation: `lib/ai/ProModel.ts` - geen @protected tags bij Zod schemas

**Missende bestanden**:
- `lib/ai/ProModel.ts` - KRITIEK bestand, 0 @protected tags
- `lib/ai/metaDetection.ts` - 0 @protected tags
- `lib/ai/toolHelp.ts` - 0 @protected tags
- `lib/rag/Kennisbank.ts` - 0 @protected tags
- `components/chat/ChatPanel.tsx` - 0 @protected tags
- `app/wizard/components/ChatOnboarding.tsx` - 0 @protected tags

---

### 2. WIZARD Domain (5 features) - **80% ONAF**

#### ✅ Deels beschermd (1 feature):
- **WIZARD_F01_CHAPTER_FLOW**: WizardLayout.tsx (✅), types/project.ts (❌)

#### ❌ Nog NIET beschermd (4 features):
- **WIZARD_F02_PATCH_SYSTEM**:
  - Implementation: `types/project.ts` - geen @protected tags bij PatchEvent/PatchDelta
  - Implementation: `lib/utils/patch.ts` - geen @protected tags

- **WIZARD_F03_MOSCOW_PRIORITIES**:
  - Implementation: `lib/ai/ProModel.ts` - geen @protected tags
  - Implementation: `types/project.ts` - geen @protected tags

- **WIZARD_F04_BUDGET_TRACKING**:
  - Implementation: `types/project.ts` - geen @protected tags bij BudgetData

- **WIZARD_F05_WIZARD_STATE**:
  - Implementation: `types/project.ts` - geen @protected tags
  - Implementation: `lib/stores/useWizardState.ts` - geen @protected tags

**Missende bestanden**:
- `types/project.ts` - KRITIEK bestand, 0 @protected tags
- `lib/utils/patch.ts` - 0 @protected tags
- `lib/stores/useWizardState.ts` - 0 @protected tags

---

### 3. EXPERT Domain (6 features) - **83% ONAF**

#### ✅ Beschermd (1 feature):
- **EXPERT_F01_CORE_COMPONENT**: WizardLayout.tsx (✅), ExpertCorner.tsx (❌)

#### ❌ Nog NIET beschermd (5 features):
- **EXPERT_F02_PDF_EXPORT**:
  - Implementation: `components/expert/ExpertCorner.tsx` - geen @protected tags bij PDF export button

- **EXPERT_F03_PREVIEW_MODE**:
  - Implementation: `components/expert/ExpertCorner.tsx` - geen @protected tags bij preview mode logic

- **EXPERT_F04_PREMIUM_MODE**:
  - Implementation: `components/expert/ExpertCorner.tsx` - geen @protected tags bij premium mode logic

- **EXPERT_F05_ROOM_CARDS**:
  - Implementation: `components/expert/RoomCard.tsx` - 0 @protected tags

- **EXPERT_F06_WISH_CARDS**:
  - Implementation: `components/expert/WishCard.tsx` - 0 @protected tags

**Missende bestanden**:
- `components/expert/ExpertCorner.tsx` - 0 @protected tags (ondanks call-site protection in WizardLayout)
- `components/expert/RoomCard.tsx` - 0 @protected tags
- `components/expert/WishCard.tsx` - 0 @protected tags

---

### 4. PVE Domain (3 features) - **100% ONAF**

#### ❌ Nog NIET beschermd (3 features):
- **PVE_F01_CORE_VIEW**:
  - Implementation: `lib/report/pveView.ts` - 0 @protected tags

- **PVE_F02_PDF_EXPORT**:
  - Implementation: `components/wizard/ExportModal.tsx` - 0 @protected tags

- **PVE_F03_EXPORT_BUTTON**:
  - Implementation: `components/wizard/ExportModal.tsx` - 0 @protected tags
  - Call-site: waarschijnlijk in WizardLayout of chapter components - NIET geïdentificeerd

**Missende bestanden**:
- `lib/report/pveView.ts` - KRITIEK bestand, 0 @protected tags
- `components/wizard/ExportModal.tsx` - 0 @protected tags

---

### 5. PREMIUM Domain (3 features) - **67% ONAF**

#### ✅ Deels beschermd (1 feature):
- **PREMIUM_F01_MODE_GATING**: WizardLayout.tsx (✅), PremiumGate.tsx (❌)

#### ❌ Nog NIET beschermd (2 features):
- **PREMIUM_F02_ACCOUNT_STORE**:
  - Implementation: `lib/stores/useAccountStore.ts` - 0 @protected tags

- **PREMIUM_F03_FEATURE_GATES**:
  - Implementation: `components/premium/PremiumGate.tsx` - 0 @protected tags
  - Call-sites: chapter components waar PremiumGate gebruikt wordt - NIET geïdentificeerd

**Missende bestanden**:
- `lib/stores/useAccountStore.ts` - 0 @protected tags
- `components/premium/PremiumGate.tsx` - 0 @protected tags

---

### 6. RISK Domain (3 features) - **100% ONAF**

#### ❌ Nog NIET beschermd (3 features):
- **RISK_F01_BUDGET_RISK**:
  - Implementation: `lib/analysis/budgetRiskAnalysis.ts` - 0 @protected tags
  - Implementation: `lib/ai/ProModel.ts` - 0 @protected tags

- **RISK_F02_LIFESTYLE_RISK**:
  - Implementation: `lib/domain/lifestyle.ts` - 0 @protected tags
  - Implementation: `lib/ai/ProModel.ts` - 0 @protected tags

- **RISK_F03_AUTO_ANALYSIS**:
  - Implementation: `lib/analysis/budgetRiskAnalysis.ts` - 0 @protected tags
  - Call-sites: waar risk analysis wordt aangeroepen - NIET geïdentificeerd

**Missende bestanden**:
- `lib/analysis/budgetRiskAnalysis.ts` - KRITIEK bestand, 0 @protected tags
- `lib/domain/lifestyle.ts` - 0 @protected tags

---

### 7. DATA Domain (3 features) - **100% ONAF**

#### ❌ Nog NIET beschermd (3 features):
- **DATA_F01_ZENSCHEMAS**:
  - Implementation: `lib/wizard/CHAPTER_SCHEMAS.ts` - 0 @protected tags

- **DATA_F02_VALIDATION**:
  - Implementation: `lib/wizard/CHAPTER_SCHEMAS.ts` - 0 @protected tags
  - Call-sites: waar validatie wordt aangeroepen - NIET geïdentificeerd

- **DATA_F03_TYPE_SAFETY**:
  - Implementation: `types/project.ts` - 0 @protected tags

**Missende bestanden**:
- `lib/wizard/CHAPTER_SCHEMAS.ts` - KRITIEK bestand, 0 @protected tags

---

## Samenvatting per Bestand

### Kritieke Bestanden ZONDER @protected tags:

| Bestand | Features | Priority | Status |
|---------|----------|----------|--------|
| `lib/ai/ProModel.ts` | 7 features | 🔴 KRITIEK | 0% |
| `types/project.ts` | 6 features | 🔴 KRITIEK | 0% |
| `lib/wizard/CHAPTER_SCHEMAS.ts` | 2 features | 🔴 KRITIEK | 0% |
| `lib/analysis/budgetRiskAnalysis.ts` | 2 features | 🔴 KRITIEK | 0% |
| `lib/report/pveView.ts` | 1 feature | 🔴 KRITIEK | 0% |
| `lib/ai/metaDetection.ts` | 1 feature | 🟡 HOOG | 0% |
| `lib/ai/toolHelp.ts` | 2 features | 🟡 HOOG | 0% |
| `lib/rag/Kennisbank.ts` | 1 feature | 🟡 HOOG | 0% |
| `components/expert/ExpertCorner.tsx` | 4 features | 🟡 HOOG | 0% |
| `components/expert/RoomCard.tsx` | 1 feature | 🟢 MEDIUM | 0% |
| `components/expert/WishCard.tsx` | 1 feature | 🟢 MEDIUM | 0% |
| `components/wizard/ExportModal.tsx` | 2 features | 🟢 MEDIUM | 0% |
| `lib/stores/useWizardState.ts` | 1 feature | 🟢 MEDIUM | 0% |
| `lib/stores/useAccountStore.ts` | 1 feature | 🟢 MEDIUM | 0% |
| `lib/utils/patch.ts` | 1 feature | 🟢 MEDIUM | 0% |
| `lib/domain/lifestyle.ts` | 1 feature | 🟢 MEDIUM | 0% |
| `components/premium/PremiumGate.tsx` | 2 features | 🟢 MEDIUM | 0% |
| `components/chat/ChatPanel.tsx` | 1 feature | 🟢 MEDIUM | 0% |
| `app/wizard/components/ChatOnboarding.tsx` | 1 feature | 🟢 MEDIUM | 0% |

**Totaal: 19 kritieke bestanden zonder enige @protected tags**

---

## Statistieken

### Beschermingsgraad per Domein

| Domein | Features | Volledig Beschermd | Deels Beschermd | Niet Beschermd | % Compleet |
|--------|----------|-------------------|-----------------|----------------|------------|
| CHAT | 10 | 0 | 3 | 7 | 30% |
| WIZARD | 5 | 0 | 1 | 4 | 20% |
| EXPERT | 6 | 0 | 1 | 5 | 17% |
| PVE | 3 | 0 | 0 | 3 | 0% |
| PREMIUM | 3 | 0 | 1 | 2 | 33% |
| RISK | 3 | 0 | 0 | 3 | 0% |
| DATA | 3 | 0 | 0 | 3 | 0% |
| **TOTAAL** | **33** | **0** | **6** | **27** | **18%** |

### Bestandsanalyse

| Metric | Aantal |
|--------|--------|
| Bestanden in registry | 27 |
| Bestanden met @protected tags | 2 |
| Bestanden zonder @protected tags | 25 |
| **Percentage compleet** | **7%** |

---

## Wat Is Het Belangrijkste om NU te Doen?

### Top Priority: KRITIEKE Implementatie Bestanden

Deze 5 bestanden bevatten samen **18 van de 33 features** (55%):

1. **lib/ai/ProModel.ts** (7 features)
   - CHAT_F01_SMART_FOLLOWUP
   - CHAT_F05_INTENT_CLASSIFICATION
   - CHAT_F07_PROMPT_SYSTEM
   - CHAT_F08_CONTEXT_MANAGER
   - CHAT_F09_STRUCTURED_OUTPUT
   - RISK_F01_BUDGET_RISK
   - RISK_F02_LIFESTYLE_RISK

2. **types/project.ts** (6 features)
   - WIZARD_F01_CHAPTER_FLOW
   - WIZARD_F02_PATCH_SYSTEM
   - WIZARD_F03_MOSCOW_PRIORITIES
   - WIZARD_F04_BUDGET_TRACKING
   - WIZARD_F05_WIZARD_STATE
   - DATA_F03_TYPE_SAFETY

3. **lib/wizard/CHAPTER_SCHEMAS.ts** (2 features)
   - DATA_F01_ZENSCHEMAS
   - DATA_F02_VALIDATION

4. **lib/analysis/budgetRiskAnalysis.ts** (2 features)
   - RISK_F01_BUDGET_RISK
   - RISK_F03_AUTO_ANALYSIS

5. **lib/report/pveView.ts** (1 feature)
   - PVE_F01_CORE_VIEW

**Impact**: Als je deze 5 bestanden beschermt, heb je 18/33 features (55%) covered.

---

## Aanbevolen Aanpak

### Fase 1: Kritieke Implementaties (Hoogste Impact)
1. `lib/ai/ProModel.ts` - 7 features
2. `types/project.ts` - 6 features
3. `lib/wizard/CHAPTER_SCHEMAS.ts` - 2 features
4. `lib/analysis/budgetRiskAnalysis.ts` - 2 features
5. `lib/report/pveView.ts` - 1 feature

### Fase 2: Hoge Prioriteit Implementaties
6. `lib/ai/metaDetection.ts` - META_TOOLING detection
7. `lib/ai/toolHelp.ts` - META_TOOLING + Quick Replies
8. `lib/rag/Kennisbank.ts` - RAG Guard
9. `components/expert/ExpertCorner.tsx` - 4 Expert features

### Fase 3: Component Call-Sites
10. `components/chat/ChatPanel.tsx` - Onboarding usage
11. `app/wizard/components/ChatOnboarding.tsx` - Onboarding implementation
12. `components/expert/RoomCard.tsx` - Room cards
13. `components/expert/WishCard.tsx` - Wish cards
14. `components/wizard/ExportModal.tsx` - PvE export
15. `components/premium/PremiumGate.tsx` - Premium gates

### Fase 4: Stores & Utils
16. `lib/stores/useWizardState.ts` - Wizard state
17. `lib/stores/useAccountStore.ts` - Premium account
18. `lib/utils/patch.ts` - Patch system
19. `lib/domain/lifestyle.ts` - Lifestyle risk

### Fase 5: Verificatie Uitbreiden
20. Extend `check-features.sh` met alle nieuwe @protected tags
21. Update `FEATURES.md` met call-site voorbeelden
22. Run `npm run brikx:doctor` en los warnings op

---

## Conclusie

**Huidige status**: Fundament is gelegd en bewezen werkend, maar **slechts 18% compleet** in termen van volledige coverage.

**Wat je NU mist**:
- 19 kritieke bestanden zonder enige @protected tags
- 27 van de 33 features zijn niet volledig beschermd
- Call-sites voor PVE, PREMIUM, RISK, DATA zijn niet geïdentificeerd

**Impact van huidige bescherming**:
- ✅ ExpertCorner en ChatPanel kunnen niet meer per ongeluk verwijderd worden uit WizardLayout
- ✅ META_TOOLING en ONBOARDING routing kunnen niet meer per ongeluk verwijderd worden
- ❌ ProModel, types, schemas, risk analysis kunnen nog steeds per ongeluk worden gewijzigd

**Volgende stap**: Focus op de 5 kritieke implementatie bestanden voor maximale impact.
