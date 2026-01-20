# 📑 CHAT SYSTEM - BESTANDSINDEX

**Datum**: 2025-12-16
**Totaal bestanden**: 18

---

## 📂 STRUCTUUR

```
temp/chat-system/
│
├── 📖 README.md                     Volledige documentatie (16KB)
├── 🚀 QUICK_REFERENCE.md            Snelle referentie
├── 📑 INDEX.md                      Dit bestand
│
├── api/                             🔴 Backend API Routes
│   ├── route.ts                     ⭐ HOOFDROUTE - Chat API + Jules persona
│   ├── vector-search/route.ts       🔍 RAG kennisbank (MISSING - copy manually)
│   └── human-handoff/route.ts       📧 Escalatie architect (MISSING - copy manually)
│
├── components/                      🔵 React UI Componenten
│   ├── ChatInterface.tsx            ⭐ HOOFDCOMPONENT - State & logica
│   ├── ChatMessage.tsx              💬 Bericht weergave
│   ├── ChatInput.tsx                ⌨️ Invoerveld
│   ├── TypingIndicator.tsx          ⏳ "Typing..." animatie
│   ├── SuggestionCard.tsx           💡 Quick-reply kaarten
│   ├── HumanHandoffModal.tsx        🆘 Architect hulp modal
│   ├── PrioritizationView.tsx       🎯 MoSCoW prioritering UI
│   ├── PrioritizationSummary.tsx    📊 Stats weergave
│   └── HandoffBannerTrigger.tsx     🔔 "Loop je vast?" banner
│
├── config/                          ⚙️ Configuratie
│   ├── field-ids.ts                 📋 Alle veld metadata + Jules vragen
│   ├── openai-functions.ts          🔧 OpenAI function definitions
│   └── premium-config.ts            💎 Premium features config
│
├── types/                           📚 TypeScript Types
│   └── knowledge.ts                 Types voor kennisbank & RAG
│
└── utils/                           🛠️ Utilities
    ├── vector-search.ts             🔎 Vector search functies
    └── wizardStore.ts               💾 Zustand state store
```

---

## 🎯 BELANGRIJKSTE BESTANDEN (TOP 5)

### 1️⃣ `api/route.ts` - CHAT API ⭐⭐⭐⭐⭐
**Waarom belangrijk**: Bevat SYSTEM_PROMPT met Jules' persoonlijkheid + alle conversatie regels

**Key sections**:
- Regel 9-55: SYSTEM_PROMPT (Jules persona)
- Regel 19-38: Conversatie regels
- Regel 26-29: Projecttype detectie
- Regel 31-37: Conversatie flow
- Regel 90-95: RAG technische keywords
- Regel 136-144: OpenAI configuratie

**Wijzig dit bestand voor**:
- Jules' karakter aanpassen
- Conversatie regels veranderen
- Model settings (temperature, tokens)
- RAG keywords toevoegen

---

### 2️⃣ `components/ChatInterface.tsx` - HOOFDCOMPONENT ⭐⭐⭐⭐⭐
**Waarom belangrijk**: Centrale logica voor chat UI, state management en auto-hints

**Key sections**:
- Regel 20-27: Zustand store selectors
- Regel 31-42: Message state
- Regel 84-130: Focus field tracking (auto-hints)
- Regel 150-220: sendMessage functie
- Regel 66-82: MoSCoW prioritering logica

**Wijzig dit bestand voor**:
- Auto-hint gedrag aanpassen
- Debounce delay veranderen (regel 94)
- Message handling logica
- Prioritering flow

---

### 3️⃣ `config/field-ids.ts` - VELD METADATA ⭐⭐⭐⭐
**Waarom belangrijk**: Bevat alle vragen die Jules stelt per veld

**Structuur**:
```typescript
export const FIELD_METADATA = {
  budget: {
    id: 'budget',
    label: 'Budget',
    julesQuestion: 'Wat is je budget? Inclusief BTW?',
    chapter: 'budget',
    required: true
  },
  // ... 50+ velden
}
```

**Wijzig dit bestand voor**:
- Jules' vragen per veld aanpassen
- Nieuwe velden toevoegen
- Premium gating instellen

---

### 4️⃣ `utils/wizardStore.ts` - STATE MANAGEMENT ⭐⭐⭐⭐
**Waarom belangrijk**: Centrale state store voor alle wizard data

**Key state**:
```typescript
extractedData: {
  currentStep: number
  focusedField: string | null
  projectType: string
  location: string
  wishes: Wish[]
  rooms: Rooms
  budget: Budget
  // ...
}
```

**Wijzig dit bestand voor**:
- State structuur aanpassen
- Nieuwe data velden toevoegen
- Persistence logica

---

### 5️⃣ `components/HumanHandoffModal.tsx` - ESCALATIE ⭐⭐⭐
**Waarom belangrijk**: Handoff naar echte architect met project context

**Flow**:
1. User vult formulier in
2. Snapshot van wizard state
3. POST naar `/api/human-handoff`
4. Email naar user + admin
5. Succes melding

**Wijzig dit bestand voor**:
- Formulier velden aanpassen
- Email content wijzigen
- Context data meesturen

---

## 🔍 BESTANDEN PER FUNCTIE

### Jules' Persoonlijkheid & Gedrag
- ✅ `api/route.ts` - SYSTEM_PROMPT (regel 9-55)
- ✅ `api/route.ts` - Conversatie regels (regel 19-38)
- ✅ `config/field-ids.ts` - Per-veld vragen

### RAG Kennisbank
- ✅ `api/route.ts` - Keywords & integratie (regel 81-133)
- ⚠️ `api/vector-search/route.ts` - MISSING (copy from app/api/)
- ✅ `utils/vector-search.ts` - Helper functies
- ✅ `types/knowledge.ts` - Types

### Chat UI
- ✅ `components/ChatInterface.tsx` - Main logica
- ✅ `components/ChatMessage.tsx` - Message display
- ✅ `components/ChatInput.tsx` - Input field
- ✅ `components/TypingIndicator.tsx` - Loading state
- ✅ `components/SuggestionCard.tsx` - Quick replies

### Prioritering (MoSCoW)
- ✅ `components/PrioritizationView.tsx` - UI grid
- ✅ `components/PrioritizationSummary.tsx` - Statistics
- ✅ `components/ChatInterface.tsx` - Logica (regel 66-82)

### Human Handoff
- ✅ `components/HumanHandoffModal.tsx` - Modal UI
- ✅ `components/HandoffBannerTrigger.tsx` - Trigger banner
- ⚠️ `api/human-handoff/route.ts` - MISSING (copy from app/api/)

### State Management
- ✅ `utils/wizardStore.ts` - Zustand store
- ✅ `components/ChatInterface.tsx` - Store usage

### Premium Features
- ✅ `config/premium-config.ts` - Premium config
- ✅ `config/field-ids.ts` - Premium gating per veld

---

## ⚠️ MISSENDE BESTANDEN

Deze bestanden waren niet gekopieerd (copy manually indien nodig):

```bash
# Van originele locatie naar temp/chat-system/api/
cp app/api/vector-search/route.ts temp/chat-system/api/vector-search-route.ts
cp app/api/human-handoff/route.ts temp/chat-system/api/human-handoff-route.ts
```

---

## 🎓 ONBOARDING CHECKLIST

Nieuwe developer? Volg deze stappen:

- [ ] 1. Lees `README.md` volledig door (15 min)
- [ ] 2. Bekijk `QUICK_REFERENCE.md` voor snelle tips (5 min)
- [ ] 3. Open `api/route.ts` en lees SYSTEM_PROMPT (10 min)
- [ ] 4. Open `components/ChatInterface.tsx` en begrijp flow (15 min)
- [ ] 5. Open `config/field-ids.ts` en zie veld vragen (5 min)
- [ ] 6. Test lokaal met `npm run dev` (10 min)
- [ ] 7. Doe test chat sessie en observeer gedrag (10 min)
- [ ] 8. Maak kleine wijziging in SYSTEM_PROMPT en test (15 min)

**Totaal**: ~1.5 uur

---

## 📊 STATISTIEKEN

```
Totaal bestanden:     18
Totaal lines of code: ~3,500
Talen:               TypeScript, React
Framework:           Next.js 15.5

Backend:
- API routes:        3 (1 copied, 2 missing)
- OpenAI calls:      1
- Vector searches:   1

Frontend:
- React components:  9
- State stores:      1
- Config files:      3

Documentation:
- Main docs:         1 (16KB)
- Quick ref:         1 (3KB)
- Index:             1 (dit bestand)
```

---

## 🔗 GERELATEERDE BESTANDEN (NIET GEKOPIEERD)

Deze bestanden zijn ook relevant maar niet gekopieerd:

**Layout**:
- `app/wizard/page.tsx` - Wizard hoofdpagina
- `app/wizard/components/WizardLayout.tsx` - 3-kolom layout

**Canvas (rechter paneel)**:
- `app/wizard/components/CanvasWorksheet.tsx` - Formulieren
- `app/wizard/components/canvas/*.tsx` - Per-chapter forms

**Expert Tips (rechts)**:
- `app/wizard/components/ExpertCorner.tsx` - Tips sidebar

**Email Templates**:
- `emails/AdminNotificationEmail.tsx` - Admin email bij handoff

**Database**:
- `lib/supabase-client.ts` - Supabase browser client
- `lib/supabase-server.ts` - Supabase server client

---

## 🚀 QUICK START

```bash
# Navigeer naar chat system folder
cd temp/chat-system/

# Bekijk alle bestanden
ls -R

# Open belangrijkste bestanden
code api/route.ts                    # Jules persona
code components/ChatInterface.tsx    # Main logica
code config/field-ids.ts             # Veld vragen

# Zoek specifieke tekst
grep -r "SYSTEM_PROMPT" .
grep -r "julesQuestion" .
grep -r "technicalKeywords" .
```

---

## 📞 SUPPORT

**Questions?** Check:
1. `README.md` - Volledige docs
2. `QUICK_REFERENCE.md` - Snelle antwoorden
3. Originele code in `app/` folder

**Need help?** Contact Brikx Dev Team

---

**Laatste update**: 2025-12-16
**Versie**: 1.0
**Maintainer**: Brikx Development Team
