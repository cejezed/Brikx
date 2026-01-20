# 🤖 BRIKX CHAT SYSTEM - COMPLETE DOCUMENTATIE

**Datum**: 2025-12-16
**Doel**: Alle bestanden en regels voor de AI-gestuurde chat met Jules Zwijsen

---

## 📁 BESTANDSSTRUCTUUR

```
temp/chat-system/
├── api/                          # Backend API routes
│   ├── chat/route.ts            ⭐ HOOFDROUTE - AI conversatie + Jules persona
│   ├── vector-search/route.ts   🔍 RAG kennisbank zoeken
│   └── human-handoff/route.ts   📧 Escalatie naar architect
│
├── components/                   # React UI componenten
│   ├── ChatInterface.tsx        ⭐ HOOFDCOMPONENT - State & logica
│   ├── ChatMessage.tsx          💬 Individueel bericht weergeven
│   ├── ChatInput.tsx            ⌨️ Invoerveld voor gebruiker
│   ├── TypingIndicator.tsx      ⏳ "Jules is aan het typen..."
│   ├── SuggestionCard.tsx       💡 Quick-reply suggesties
│   ├── HumanHandoffModal.tsx    🆘 Modal voor architect vraag
│   ├── PrioritizationView.tsx   🎯 MoSCoW prioritering UI
│   ├── PrioritizationSummary.tsx 📊 Statistieken prioritering
│   └── HandoffBannerTrigger.tsx 🔔 "Loop je vast?" banner
│
├── config/                       # Configuratie & metadata
│   ├── field-ids.ts             📋 Alle veldmetadata + Jules vragen
│   ├── openai-functions.ts      🔧 OpenAI function definitions
│   └── premium-config.ts        💎 Premium features configuratie
│
├── types/                        # TypeScript types
│   └── knowledge.ts             📚 Types voor kennisbank
│
├── utils/                        # Utilities
│   ├── vector-search.ts         🔎 Vector search functies
│   └── wizardStore.ts           💾 Zustand state store
│
└── README.md                     📖 Deze documentatie
```

---

## 🎯 1. HOOFDROUTE: `/api/chat`

**Bestand**: `api/chat/route.ts`

### Verantwoordelijk voor:
1. **Jules Zwijsen Persona** (SYSTEM_PROMPT)
2. **Conversatie regels** (luisteren, herkennen, doorvragen)
3. **Projecttype detectie** (nieuwbouw vs verbouwing)
4. **RAG integratie** (kennisbank bij technische vragen)
5. **OpenAI API calls** (GPT-4o-mini)
6. **Error handling** (fallback berichten)

### Key Configuratie:
```typescript
model: 'gpt-4o-mini'        // Snel & goedkoop
temperature: 0.7            // Beetje creativiteit
max_tokens: 500             // Beknopte antwoorden
```

### SYSTEM_PROMPT - Jules' Persoonlijkheid:

```
JOUW KARAKTER:
- Praktisch, eerlijk, en persoonlijk
- Vraagt altijd door naar het "waarom" achter het "wat"
- Deelt architect-inzichten uit ervaring
- Waarschuwt voor veelgemaakte fouten
- Begrijpelijk Nederlands, geen jargon
- LUISTER GOED: Elk antwoord is waardevol - verwerk het en vraag door
```

### Conversatie Regels:

**❌ FOUT**:
```
User: "We krijgen een tweede kind"
Bot: "Wat is je doel met dit project?"  // Herhaalt vraag!
```

**✅ GOED**:
```
User: "We krijgen een tweede kind"
Bot: "Ah! Gefeliciteerd! Hoeveel kinderen worden het in totaal?
     En hoe oud zijn ze nu?"  // Reageert + vraagt door
```

### Projecttype Detectie:
```javascript
if (user praat over "BESTAAND HUIS") → VERBOUWING
if (user praat over "KAVEL/GROND") → NIEUWBOUW
if (twijfel) → Vraag vriendelijk
```

### Conversatie Flow:
1. Begrijp de droom/het doel
2. Huidige situatie (verbouwing) OF kavel info (nieuwbouw)
3. Ruimtebehoeftes + het waarom
4. Budget + realisme check
5. Duurzaamheid (wat bedoelt user ermee?)
6. Timeline + urgentie

---

## 🔍 2. RAG SYSTEEM (Kennisbank)

**Bestand**: `api/vector-search/route.ts`

### Technische Keywords:
```javascript
const technicalKeywords = [
  'fundering', 'funderingsherstel', 'asbest', 'isolatie', 'dak',
  'ventilatie', 'wtw', 'warmtepomp', 'zonnepanelen', 'subsidie',
  'bouwbesluit', 'regelgeving', 'vergunning', 'kosten', 'budget',
  'pfas', 'bodem', 'rc-waarde', 'u-waarde', 'energielabel'
]
```

### RAG Flow:
```
1. User stelt vraag met technisch keyword
   ↓
2. Detecteer keyword in laatste bericht
   ↓
3. Roep /api/vector-search aan
   ↓
4. Haal top 3 relevante chunks (similarity > 0.7)
   ↓
5. Voeg kennis toe aan system prompt
   ↓
6. GPT gebruikt deze kennis in antwoord
```

### Voorbeeld Output:
```
📚 RELEVANTE KENNIS UIT MIJN ERVARING:

[Bron 1: Kennisbank ABJZ, Hoofdstuk Fundering]
Bij pre-oorlogse woningen (1930-1940) is de fundering vaak
op houten palen. Deze kunnen na 80+ jaar verzakt zijn...

[Bron 2: Gids voor bouwen, Hoofdstuk Kosten]
Funderingsherstel kost gemiddeld €15.000-€30.000...
```

---

## 💬 3. CHATINTERFACE (Hoofdcomponent)

**Bestand**: `components/ChatInterface.tsx`

### State Management:
```typescript
// Zustand store selectors
const currentStep = useWizardStore(s => s.extractedData.currentStep)
const focusedField = useWizardStore(s => s.extractedData?.focusedField)
const extractedData = useWizardStore(s => s.extractedData)
const projectType = useWizardStore(s => s.extractedData?.projectType)
const prioritizedWishes = useWizardStore(s => s.extractedData?.wishes)

// Lokale state
const [messages, setMessages] = useState<Message[]>([])
const [isTyping, setIsTyping] = useState(false)
const [showHandoffModal, setShowHandoffModal] = useState(false)
const [focusHint, setFocusHint] = useState({ fieldId, question })
```

### Auto-Hints bij Field Focus:
```javascript
useEffect(() => {
  if (!focusedField) return

  // Debounce (500ms wachten)
  debounceTimerRef.current = setTimeout(() => {
    // Check: Is veld al ingevuld?
    if (isFieldFilled(focusedField, extractedData)) {
      return // Skip hint
    }

    // Haal metadata op
    const meta = FIELD_METADATA[focusedField]

    // Genereer auto-hint
    setFocusHint({
      fieldId: focusedField,
      question: meta.julesQuestion // "Wat is je budget?"
    })

    // Verstuur AUTO-GENERATED bericht naar AI
    sendMessage(meta.julesQuestion, true)
  }, 500)
}, [focusedField])
```

### sendMessage Functie:
```typescript
const sendMessage = async (content: string, isAutoGenerated = false) => {
  // Voeg user bericht toe
  setMessages(prev => [...prev, {
    id: `m${Date.now()}`,
    role: 'user',
    content
  }])

  setIsTyping(true)

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...messages, newUserMsg],
        projectType: projectType || undefined,
        hasLocation: !!extractedData?.location,
        focusedField: focusedField || undefined,
        isAutoGenerated
      })
    })

    const data = await res.json()

    // Voeg AI antwoord toe
    setMessages(prev => [...prev, {
      id: `m${Date.now()}`,
      role: 'assistant',
      content: data.message
    }])
  } catch (error) {
    // Fallback bericht
  } finally {
    setIsTyping(false)
  }
}
```

---

## 🎯 4. MoSCoW PRIORITIZATION

**Bestanden**:
- `components/PrioritizationView.tsx`
- `components/PrioritizationSummary.tsx`

### Wanneer Actief:
```typescript
const showPrioritationView = currentStep === 3
```

### Logica:
```javascript
// Bereken summary
const totalWishes = prioritizedWishes.length
const mustCount = wishes.filter(w => w.priority === 'must').length
const shouldCount = wishes.filter(w => w.priority === 'should').length
const couldCount = wishes.filter(w => w.priority === 'could').length

// Check of alles geprioriteerd is
const allPrioritized =
  totalWishes > 0 &&
  mustCount + shouldCount + couldCount === totalWishes

// Als alles geprioriteerd → ga naar stap 4
if (allPrioritized) {
  setCurrentStep(4)
}
```

---

## 🆘 5. HUMAN HANDOFF

**Bestand**: `components/HumanHandoffModal.tsx`

### Formulier:
- Vraag (textarea, required)
- Naam (text)
- Email (required)
- Telefoonnummer (optioneel)

### Flow:
```javascript
1. User vult formulier in
   ↓
2. Snapshot van wizard state:
   {
     currentStep,
     focusedField,
     projectType,
     location,
     extractedData
   }
   ↓
3. POST naar /api/human-handoff
   ↓
4. Email naar user (bevestiging, 24u respons)
   ↓
5. Email naar admin (vraag + context)
   ↓
6. Succes melding tonen
   ↓
7. Modal sluiten na 2.4s
```

---

## 📋 6. FIELD METADATA

**Bestand**: `config/field-ids.ts`

### Structuur:
```typescript
export const FIELD_METADATA: Record<FieldId, FieldMetadata> = {
  projectType: {
    id: 'projectType',
    label: 'Projecttype',
    julesQuestion: 'Wat voor project is dit? Nieuwbouw of verbouwing?',
    chapter: 'basis',
    required: true,
    premiumOnly: false
  },

  budget: {
    id: 'budget',
    label: 'Budget',
    julesQuestion: 'Wat is je budget voor dit project? En is dat inclusief BTW?',
    chapter: 'budget',
    required: true,
    premiumOnly: false
  },

  // ... 50+ velden
}
```

### Gebruik:
- **Auto-hints**: ChatInterface gebruikt `julesQuestion` bij field focus
- **Validatie**: Check of veld ingevuld is
- **Premium gating**: Check of veld premium is

---

## 🔧 7. JULES' ARCHITECT VOORBEELDEN

### Scenario 1: Kind onderweg
```
User: "We krijgen een tweede kind"
Jules: "Ah! Gefeliciteerd! Hoeveel kinderen worden het in totaal?
       En hoe oud zijn ze nu? Dan kan ik nadenken over de ruimte
       die je nodig hebt."
```

### Scenario 2: Ruimtebehoefte
```
User: "4 slaapkamers"
Jules: "Oké, 4 slaapkamers. Voor wie? Kinderen? Logeerkamer?
       En hoe vaak worden die gebruikt?"
```

### Scenario 3: Budget
```
User: "Budget van 100.000"
Jules: "100k is een mooie start. Is dat inclusief BTW en
       onvoorziene kosten? En heb je al een architect ingecalculeerd?"
```

### Scenario 4: Oud huis
```
User: "Oud huis van 1930"
Jules: "Pre-oorlogse woning! Mooi, maar let op: fundering kan
       verrassingen geven. Ooit een bodemonderzoek laten doen?"
```

### Scenario 5: Duurzaamheid
```
User: "Duurzaam bouwen"
Jules: "Goed! Maar wat bedoel je met duurzaam? Zonnepanelen?
       Isolatie? Materialen? Of alles?"
```

---

## 🔄 8. DATA FLOW DIAGRAM

```
USER
  ↓
ChatInput.tsx (User typt)
  ↓
ChatInterface.tsx (State + logica)
  ↓
  ├──→ wizardStore (focusedField, extractedData)
  └──→ /api/chat (POST request)
        ↓
        ├─→ SYSTEM_PROMPT (Jules persona + context)
        └─→ RAG Search? (Bij technische keywords)
              ↓
              Vector DB → Knowledge chunks
              ↓
        OpenAI GPT-4o-mini
              ↓
        AI Response
              ↓
ChatInterface.tsx (Voeg toe aan messages)
  ↓
ChatMessage.tsx (Weergave)
```

---

## 🎨 9. UI COMPONENTEN OVERZICHT

| Component | Functie | Locatie |
|-----------|---------|---------|
| **ChatInterface** | Hoofdcontainer, state management | `components/ChatInterface.tsx` |
| **ChatMessage** | Individueel bericht weergeven | `components/ChatMessage.tsx` |
| **ChatInput** | Invoerveld + verstuur knop | `components/ChatInput.tsx` |
| **TypingIndicator** | Bouncing dots tijdens AI denkt | `components/TypingIndicator.tsx` |
| **SuggestionCard** | Quick-reply suggesties | `components/SuggestionCard.tsx` |
| **HumanHandoffModal** | Escaleer naar architect | `components/HumanHandoffModal.tsx` |
| **PrioritizationView** | MoSCoW grid | `components/PrioritizationView.tsx` |
| **PrioritizationSummary** | Stats overzicht | `components/PrioritizationSummary.tsx` |
| **HandoffBannerTrigger** | "Loop je vast?" banner | `components/HandoffBannerTrigger.tsx` |

---

## ⚙️ 10. CONFIGURATIE WIJZIGEN

### Jules' Persoonlijkheid Aanpassen:
**Bestand**: `api/chat/route.ts`
**Regel**: 9-55 (SYSTEM_PROMPT constant)

```typescript
const SYSTEM_PROMPT = `Je bent Jules Zwijsen...`
```

### Conversatie Regels Aanpassen:
**Bestand**: `api/chat/route.ts`
**Regel**: 19-25 (CONVERSATIE REGELS sectie)

### Technische Keywords Toevoegen:
**Bestand**: `api/chat/route.ts`
**Regel**: 90-95 (technicalKeywords array)

```typescript
const technicalKeywords = [
  'fundering', 'isolatie', // ... voeg toe
]
```

### Veld Vragen Aanpassen:
**Bestand**: `config/field-ids.ts`
**Pas** `julesQuestion` **aan per veld**

### OpenAI Model Wijzigen:
**Bestand**: `api/chat/route.ts`
**Regel**: 137-143

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',     // Wijzig hier
  temperature: 0.7,         // Of hier
  max_tokens: 500,          // Of hier
})
```

---

## 🔑 11. KEY DESIGN PRINCIPES

### ✅ Sterke Punten
1. **Context-aware** - Weet projecttype, locatie status
2. **RAG integratie** - Gebruikt kennisbank bij technische vragen
3. **Smart debouncing** - Niet voor elk keystroke een API call
4. **Personality** - Jules voelt als echte architect
5. **Error resilience** - Fallback bij API falen

### 🎯 Jules' Principes
1. **Luister eerst** - Herken antwoorden, herhaal niet
2. **Vraag waarom** - Niet alleen wat, maar motivatie
3. **Praktisch** - Geen jargon, wel architect-inzichten
4. **Proactief** - Waarschuw voor veelgemaakte fouten
5. **Beknopt** - Max 500 tokens, houd antwoorden kort

---

## 🚀 12. BELANGRIJKSTE BESTANDEN PER TAAK

| Wat wil je aanpassen? | Bestand |
|----------------------|---------|
| **Jules' persoonlijkheid** | `api/chat/route.ts` → SYSTEM_PROMPT |
| **Conversatie regels** | `api/chat/route.ts` → CONVERSATIE REGELS |
| **RAG kennisbank** | `api/vector-search/route.ts` |
| **Auto-hints bij veld focus** | `components/ChatInterface.tsx` → useEffect |
| **Chat UI styling** | `components/ChatMessage.tsx` |
| **Invoerveld** | `components/ChatInput.tsx` |
| **MoSCoW prioritering** | `components/PrioritizationView.tsx` |
| **Human handoff modal** | `components/HumanHandoffModal.tsx` |
| **Veld metadata (vragen)** | `config/field-ids.ts` → FIELD_METADATA |
| **OpenAI model/config** | `api/chat/route.ts` → model settings |

---

## 📝 13. CHECKLIST VOOR WIJZIGINGEN

### Bij aanpassen Jules' gedrag:
- [ ] Update SYSTEM_PROMPT in `api/chat/route.ts`
- [ ] Test met verschillende scenarios
- [ ] Check of antwoorden < 500 tokens blijven
- [ ] Verify dat conversatie logisch blijft

### Bij toevoegen nieuwe velden:
- [ ] Voeg toe aan `config/field-ids.ts`
- [ ] Definieer `julesQuestion`
- [ ] Test auto-hint functionaliteit
- [ ] Update wizard store indien nodig

### Bij aanpassen RAG:
- [ ] Update `technicalKeywords` array
- [ ] Test similarity threshold (0.7)
- [ ] Verify knowledge integration
- [ ] Check performance impact

---

## 🔧 14. DEBUGGING TIPS

### Console Logs Activeren:
**Bestand**: `api/chat/route.ts`

```typescript
console.log('🔍 Technische vraag gedetecteerd')
console.log(`✅ ${vectorData.results.length} chunks toegevoegd`)
```

### Chat State Inspecteren:
**Browser Console**:
```javascript
// Zustand store
useWizardStore.getState()

// Current messages
console.log(messages)
```

### RAG Results Bekijken:
**Check server logs** voor vector search results

---

## 📚 15. EXTERNE DEPENDENCIES

- **OpenAI**: GPT-4o-mini voor chat
- **Supabase**: Database + pgvector voor RAG
- **Zustand**: State management
- **React**: UI components
- **Next.js**: API routes + SSR

---

## 🎓 16. LEERMATERIAAL

### Nieuwe developer onboarding:
1. Lees `README.md` (dit bestand)
2. Bestudeer `api/chat/route.ts` (SYSTEM_PROMPT)
3. Bekijk `components/ChatInterface.tsx` (main logic)
4. Test lokaal met verschillende scenarios
5. Pas kleine wijzigingen toe in SYSTEM_PROMPT

### Belangrijkste concepten:
- **RAG** = Retrieval-Augmented Generation
- **MoSCoW** = Must/Should/Could/Won't prioritering
- **Jules persona** = 20 jaar architect ervaring
- **Auto-hints** = Automatische suggesties bij veld focus
- **Human handoff** = Escalatie naar echte architect

---

**Laatste update**: 2025-12-16
**Maintainer**: Brikx Development Team
