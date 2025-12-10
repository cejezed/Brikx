# 🎯 EXPERT CORNER IMPLEMENTATION PLAN
**Version:** 1.0 (Brikx v2.0 Build Strategy Addendum)  
**Date:** 31 October 2025  
**Owner:** Frontend Lead + Backend Lead  
**Status:** ✅ CRITICAL ADDITION

---

## 🚨 WHAT WAS MISSING

In the original build strategy, the **Expert Corner (Adviseur)** — the right-side panel that provides real-time, context-aware tips — was mentioned but **NOT fully integrated into the 10-day build plan**.

This document **fixes that omission** by adding Expert Corner to the 2-week implementation.

---

## 📐 ARCHITECTURE REMINDER (3-Column Layout)

```
┌──────────────────────────────────────────────────────────────┐
│                     BRIKX v2.0 LAYOUT                        │
├──────────────┬──────────────────────────┬───────────────────┤
│   LEFT       │      MIDDLE              │      RIGHT        │
│ (35%)        │      (50%)               │      (15%)        │
├──────────────┼──────────────────────────┼───────────────────┤
│              │                          │                   │
│  ChatPanel   │  WizardRouter            │  ExpertCorner     │
│  (Jules)     │  (Canvas with chapters)  │  (Adviseur)       │
│              │                          │                   │
│  • User msgs │  • Intake form           │  • Static tips    │
│  • Chat flow │  • Ruimtes cards         │  • AI snippets    │
│  • Intent    │  • Budget sliders        │  • RAG context    │
│    actions   │  • Technology options    │  • Smart hints    │
│              │  • Preview step          │                   │
│              │                          │  🆕 REAL-TIME     │
│              │                          │     UPDATES       │
│              │                          │                   │
└──────────────┴──────────────────────────┴───────────────────┘
```

**The Expert Corner is NOT static.** It's **active, real-time, and context-aware.**

---

## 🎯 EXPERT CORNER DESIGN SPECIFICATION

### Core Functionality

The Expert Corner should:

1. **Listen to current focus**
   - Which chapter is open? (basis, ruimtes, budget, techniek, etc.)
   - Which field is focused? (projectNaam, rooms count, budget range, etc.)

2. **Show context-aware tips**
   - For each field: 2–3 architecture tips (static rules)
   - When in PREMIUM mode: Add AI-generated snippets (RAG-powered)

3. **Update in real-time**
   - As user focuses on different fields, tips change instantly
   - No page reload needed

4. **Provide value, not bloat**
   - Static tips: Always shown (free value)
   - AI snippets: Premium mode only (paywall)
   - Tips are SHORT (2–3 bullets, max 100 words per tip)

---

## 📋 EXPERT CORNER COMPONENTS

### Component 1: `/components/expert/ExpertCorner.tsx`

```typescript
// Core component that listens to focus and renders tips

import React, { useEffect, useState } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import { useUiStore } from "@/lib/stores/useUiStore";
import { fetchRagSnippets } from "@/lib/rag/fetchSnippets";
import { STATIC_TIPS } from "@/lib/expert/rules";

export default function ExpertCorner() {
  const focusedField = useUiStore((s) => s.focusedField);
  const mode = useWizardState((s) => s.mode) as "PREVIEW" | "PREMIUM";
  const [ragSnippets, setRagSnippets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Get static tips based on focused field
  const staticTips = focusedField
    ? STATIC_TIPS[focusedField.chapter]?.[focusedField.fieldId] || []
    : [];

  // 2. Fetch RAG snippets if PREMIUM (async, non-blocking)
  useEffect(() => {
    if (!focusedField || mode !== "PREMIUM") {
      setRagSnippets([]);
      return;
    }

    const fetchSnippets = async () => {
      setLoading(true);
      try {
        const snippets = await fetchRagSnippets({
          chapter: focusedField.chapter,
          fieldId: focusedField.fieldId,
        });
        setRagSnippets(snippets);
      } finally {
        setLoading(false);
      }
    };

    fetchSnippets();
  }, [focusedField, mode]);

  if (!focusedField) {
    return (
      <div className="p-4 text-slate-500 text-sm">
        ℹ️ Focus op een veld om architectentips te zien.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Static Tips (Always shown) */}
      {staticTips.length > 0 && (
        <div>
          <h3 className="font-bold text-xs text-slate-700 mb-2">
            💡 ARCHITECTENTIPS
          </h3>
          <ul className="space-y-2">
            {staticTips.map((tip, i) => (
              <li key={i} className="text-xs text-slate-600 leading-relaxed">
                • {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Premium AI Snippets */}
      {mode === "PREMIUM" && (
        <div>
          <h3 className="font-bold text-xs text-slate-700 mb-2">
            🧠 AI INZICHTEN {loading && "⏳"}
          </h3>
          {loading && (
            <p className="text-xs text-slate-500 italic">
              Raadpleegde kennis wordt opgehaald...
            </p>
          )}
          {ragSnippets.length > 0 && (
            <ul className="space-y-2">
              {ragSnippets.map((snippet, i) => (
                <li
                  key={i}
                  className="text-xs text-slate-600 leading-relaxed bg-blue-50 p-2 rounded"
                >
                  📚 {snippet.text}
                  {snippet.source && (
                    <span className="text-xs text-slate-400 block mt-1">
                      ({snippet.source})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Premium Upsell */}
      {mode === "PREVIEW" && (
        <div className="p-2 bg-amber-50 rounded border border-amber-200">
          <p className="text-xs text-amber-800">
            🔒 AI inzichten zijn beschikbaar in Premium mode
          </p>
        </div>
      )}
    </div>
  );
}
```

---

### Component 2: `/lib/expert/rules.ts` (Static Tips Database)

```typescript
// Static tips that always show (no LLM needed, just good architecture knowledge)

export const STATIC_TIPS: Record<
  string,
  Record<string, string[]>
> = {
  basis: {
    projectNaam: [
      "Kies een naam die aansluit bij je visie. Dit helpt later bij communicatie met bouwers.",
      "Denk aan de functie: is dit een renovatie, uitbouw, of complete nieuwbouw?",
    ],
    locatie: [
      "De zuidoriëntatie bepaalt de lichtinval en energieprestatie.",
      "Check de buurt: zijn er geluidsoverlast (straat, vliegveld) of uitzichtlijnen?",
    ],
    budget: [
      "Budget = bruto bouwsom. Voeg 15–20% toe voor onvoorziens.",
      "Onderscheid: ruwbouw (€1.900–€2.600/m²) vs afbouw (€600–€1.100/m²).",
    ],
  },

  ruimtes: {
    "rooms[0].name": [
      "Noem elke ruimte duidelijk (bv. 'Woonkamer', niet 'Space 1').",
      "Dit helpt later bij communicatie met aannemers.",
    ],
    "rooms[0].m2": [
      "Richtwaarden: woonkamer min. 20 m², slaapkamer 12 m².",
      "Grotere ruimtes voelen luxe, maar verhogen kosten. Balanceer beide.",
    ],
    "rooms[0].wishes": [
      "Wat maakt deze ruimte perfect? (licht, akoestiek, flexibiliteit?)",
      "Noteer de 'lifestyle' wensen: hoe wil je hier leven?",
    ],
  },

  wensen: {
    wishes: [
      "Prioriteer! MoSCoW: Must have, Should have, Could have, Won't have.",
      "Niet alles tegelijk is mogelijk. Wat geeft je project het meeste waarde?",
    ],
  },

  budget: {
    klasse: [
      "Budget-klasse bepaalt materiaalkeuze en afwerking.",
      "Economisch (<€1.500/m²) = functioneel. Comfort (€2.000+/m²) = kwaliteit.",
    ],
    contingency: [
      "15–20% onvoorziene kosten is standaard. Begraven nooit!",
      "Specialistische onderzoeken (PFAS, funderingen) kunnen €10k–€50k kosten.",
    ],
  },

  techniek: {
    isolatie: [
      "RC-waarde bepaalt energieverbruik. Moderner = beter (RC ≥ 4.5).",
      "Goed geïsoleerd huis kost minder om te verwarmen.",
    ],
    ventilation: [
      "Kies: natuurlijke ventilatie (ramen) of mechanische (WTW-unit).",
      "WTW (warmoterugwinnning) bespaart energie, kost ~€3.000–€5.000.",
    ],
    electricity: [
      "Plannen: EV-laadpunt, werkplek, entertainment zones.",
      "Meer stekkers nu = minder renovatie later.",
    ],
  },

  duurzaam: {
    energySource: [
      "Warmtepomp of verre-CV: warmtepomp is toekomstbestendig (elektrisch).",
      "Gas wordt uitgeleid; plan nu al voor elektriciteit.",
    ],
    solarPanels: [
      "Opbrengst hangt af van oriëntatie (zuid beste). Rendabel in 10–12 jaar.",
      "Combineert goed met warmtepomp voor optimale efficiëntie.",
    ],
  },
};
```

---

### Component 3: `/lib/rag/fetchSnippets.ts` (Async RAG Fetcher)

```typescript
// Async function to fetch RAG snippets when user focuses on a field (Premium only)

import { Kennisbank } from "./Kennisbank";
import { logEvent } from "@/lib/logging/logEvent";

export async function fetchRagSnippets(
  options: {
    chapter: string;
    fieldId: string;
  }
): Promise<any[]> {
  const { chapter, fieldId } = options;

  try {
    // Convert fieldId to natural language query
    // E.g., "rooms[0].m2" → "square meters room size"
    const query = fieldIdToQuery(fieldId);

    // Query RAG
    const result = await Kennisbank.query(query, {
      chapter,
      isPremium: true,
      maxResults: 3,
    });

    logEvent("expert.rag_fetch", {
      fieldId,
      chapter,
      docsRetrieved: result.docs?.length || 0,
      cacheHit: result.cacheHit,
    });

    // Return formatted snippets
    return (result.docs || []).map((doc: any) => ({
      text: doc.text,
      source: doc.source || "Kennisbank",
      relevance: doc.relevance_score,
    }));
  } catch (error) {
    console.error("RAG fetch failed:", error);
    logEvent("expert.rag_error", { error: String(error), fieldId });
    return [];
  }
}

function fieldIdToQuery(fieldId: string): string {
  const mapping: Record<string, string> = {
    "rooms[0].m2": "square meters room size oppervlakte",
    "rooms[0].wishes": "room requirements wishes needs",
    isolatie: "insulation rc-value energy",
    ventilation: "ventilation air quality",
    warmtepomp: "heat pump efficiency",
    // ... more mappings
  };

  return mapping[fieldId] || fieldId;
}
```

---

## 📅 EXPERT CORNER IN BUILD PLAN

### Day 6 (Thursday 6 Nov) — MODIFIED

Previously: "Client Policy & State"  
**Now:** "Client Policy & State + Expert Corner Integration"

**Additional tasks:**

```
✅ Existing: Policy tree + conflict detection

🆕 NEW TASKS:

1. Create /components/expert/ExpertCorner.tsx
   - Listens to useUiStore.focusedField
   - Renders static tips from STATIC_TIPS
   - Fetches RAG snippets when PREMIUM (async)
   
2. Create /lib/expert/rules.ts
   - Static tips for all chapters/fields
   - Database of 20+ tip groups
   - Easy to extend
   
3. Create /lib/rag/fetchSnippets.ts
   - Async function to query RAG
   - Maps fieldId to natural language
   - Error handling + logging
   
4. Update /lib/stores/useUiStore.ts
   - Add focusedField tracking
   - Exported setFocusedField() setter
   
5. Update WizardLayout.tsx
   - Add ExpertCorner to right column
   - Layout: 35% Chat | 50% Canvas | 15% Expert
   
6. Test Expert Corner
   - Static tips show immediately
   - RAG fetches when PREMIUM
   - Tips change when focus changes
   - Loads don't block chat
```

**Estimated time:** +2 hours (move this to next day if needed)

---

## 🎬 EXPERT CORNER USER FLOWS

### Flow 1: Static Tips (Always works)

```
User focuses on field
        ↓
ExpertCorner detects focusedField change
        ↓
Look up STATIC_TIPS[chapter][fieldId]
        ↓
Render tips immediately (no network delay)
        ↓
User sees tips in <100ms
```

**No latency. Always works. Great UX.**

---

### Flow 2: RAG Snippets (Premium only)

```
User focuses on field + mode="PREMIUM"
        ↓
ExpertCorner calls fetchRagSnippets(async)
        ↓
Convert fieldId to query ("m2" → "square meters room size")
        ↓
Query Kennisbank.query() with chapter filter
        ↓
Get 3 most relevant docs (with relevance scoring)
        ↓
Format and render in Expert Corner
        ↓
User sees "Loading..." then snippets appear (200–500ms)
```

**Non-blocking. Premium value-add. Excellent for PREMIUM users.**

---

### Flow 3: Field Focus Triggers

Field focus can come from 2 sources:

**A) Manual focus (user clicks input field)**
```
User clicks "Woonkamer m²" input
        ↓
Input.onFocus handler fires
        ↓
useUiStore.setFocusedField({ chapter: "ruimtes", fieldId: "rooms[0].m2" })
        ↓
ExpertCorner re-renders with new tips
```

**B) Chat action (AI suggests focus)**
```
User says "Ik wil een grote woonkamer"
        ↓
ChatPanel generates patch + sets focusedField via AI intent
        ↓
useUiStore.setFocusedField({ chapter: "ruimtes", fieldId: "rooms[0].m2" })
        ↓
ExpertCorner updates tips
        ↓
Canvas scrolls to field + highlights it
```

**Result:** User feels guided, not lost.

---

## 💾 STORAGE & CACHING STRATEGY

### Static Tips Storage

```typescript
// Simple JSON in code (no database needed)
// Size: ~10 KB (fully in memory after app loads)

export const STATIC_TIPS: Record<string, Record<string, string[]>> = {
  basis: {
    projectNaam: ["Tip 1", "Tip 2"],
    // ...
  }
  // ...
}
```

**Advantage:** Instant, no network requests, always available.

---

### RAG Snippet Cache

```typescript
// Cache per fieldId (topic-based)
// TTL: 1 hour per snippet group
// Size limit: 10 cached groups

const CACHE_CONFIG = {
  ttl: 3600 * 1000,  // 1 hour
  limit: 10,          // max 10 cached groups
};

// Usage:
const cached = ragCache.getOrFetch(
  "rooms[0].m2",
  () => Kennisbank.query(...)  // Only called on cache miss
);
```

**Advantage:** Premium users see fast updates (cache hits < 10ms).

---

## 📊 EXPERT CORNER IN THE 3-COLUMN LAYOUT

### Mobile (Stacked)

On mobile, Expert Corner becomes a collapsible sidebar:

```
┌────────────────────────────┐
│ CHAT (collapsed)           │ ← Swipe to expand
├────────────────────────────┤
│ CANVAS (full width)        │
├────────────────────────────┤
│ 🧠 EXPERT CORNER (sticky)  │ ← Always accessible
└────────────────────────────┘
```

---

## 🎯 EXPERT CORNER SUCCESS CRITERIA

By end of Week 1:

```
✅ ExpertCorner component renders correctly
✅ Static tips appear within <100ms of focus
✅ Tips change when user focuses different field
✅ Premium RAG fetches without blocking chat
✅ Graceful error handling (RAG error ≠ broken UI)
✅ Logging shows which tips are viewed
✅ No TypeScript errors
✅ Mobile responsive (stacked layout)
```

---

## 🔌 INTEGRATION POINTS

### 1. ChatPanel → ExpertCorner (via Zustand)

```typescript
// ChatPanel sets focus when AI suggests action
useUiStore.setFocusedField({
  chapter: "ruimtes",
  fieldId: "rooms[0].m2"
});

// ExpertCorner listens automatically (no props needed)
const focusedField = useUiStore((s) => s.focusedField);
```

**Decoupled. Clean. Reactive.**

---

### 2. Canvas → ExpertCorner (via input onFocus)

```typescript
// Any input field can trigger Expert Corner
<input
  onFocus={() => {
    useUiStore.setFocusedField({
      chapter: "ruimtes",
      fieldId: "rooms[0].m2"
    });
  }}
/>
```

**Automatic. User-friendly. Contextual.**

---

### 3. ExpertCorner → RAG (async)

```typescript
// Non-blocking RAG fetch
useEffect(() => {
  if (!focusedField || mode !== "PREMIUM") return;

  fetchRagSnippets({ ...focusedField }).then((snippets) => {
    setRagSnippets(snippets);  // Update UI when ready
  });
}, [focusedField, mode]);
```

**Non-blocking. User sees immediate static tips, then AI snippets arrive.**

---

## 📝 IMPLEMENTATION CHECKLIST (Day 6, Afternoon)

```
🏗️ STRUCTURE

[ ] Create /components/expert/ExpertCorner.tsx (150 lines)
[ ] Create /lib/expert/rules.ts (300+ lines of tips)
[ ] Create /lib/rag/fetchSnippets.ts (100 lines)
[ ] Update useUiStore.ts (add focusedField + setter)

🎨 INTEGRATION

[ ] Update WizardLayout.tsx (add Expert right column)
[ ] Update all chapter components (add onFocus handlers)
[ ] Test focus flow (Chat → Canvas → Expert)
[ ] Test RAG async fetch (Premium only)

✅ TESTING

[ ] Unit: STATIC_TIPS renders correctly
[ ] Unit: focusedField setter works
[ ] Unit: RAG fetch error handling
[ ] E2E: Focus change triggers Expert update
[ ] E2E: Premium user sees RAG snippets
[ ] E2E: Preview user sees only static tips
[ ] Mobile: Expert Corner responsive

📊 METRICS

[ ] Static tips latency: <100ms
[ ] RAG fetch latency: <500ms (cache hits <10ms)
[ ] Error rate: <1%
[ ] Coverage: All chapter/field combinations documented
```

---

## 🎓 PROMPTS FOR EXPERT CORNER

### Prompt: "Generate Static Tips Database"

```
You are a senior architect with 20+ years experience.

For each field in the Brikx wizard, write 2–3 SHORT, practical tips 
that a first-time builder should know.

Tone: Warm, not condescending. Practical, not theoretical.

Format (example):
{
  "basis": {
    "projectNaam": [
      "Kies een naam die aansluit bij je visie. Dit helpt later bij communicatie met bouwers.",
      "Denk aan de functie: is dit een renovatie, uitbouw, of complete nieuwbouw?"
    ]
  }
}

Fields to cover:
- basis: projectNaam, locatie, budget
- ruimtes: rooms[].name, rooms[].m2, rooms[].wishes
- wensen: wishes
- budget: klasse, contingency
- techniek: isolatie, ventilation, electricity
- duurzaam: energySource, solarPanels
```

---

## 🎊 EXPERT CORNER DIFFERENTIATOR

The Expert Corner transforms Brikx from a "form filler" to an **"intelligent advisor."**

**Without Expert Corner:**
- User enters data ❌ (no guidance)
- Lots of mistakes ❌
- Feels like a boring form 😑

**With Expert Corner:**
- User enters data ✅ (with real-time tips)
- Fewer mistakes ✅
- Feels like talking to an architect 🧠
- Premium users get AI-powered suggestions ⭐

---

## ✅ FINAL CHECKLIST

```
Is Expert Corner in the build plan? ✅ YES (Day 6 afternoon)
Is Expert Corner in the 3-column layout? ✅ YES (15% right column)
Is Expert Corner responsive? ✅ YES (mobile collapsible)
Does it work in PREVIEW mode? ✅ YES (static tips only)
Does it work in PREMIUM mode? ✅ YES (static + RAG snippets)
Is it non-blocking? ✅ YES (async RAG fetch)
Is it documented? ✅ YES (this document)
```

---

**Status:** ✅ Ready for implementation (Day 6, Afternoon)  
**Next:** Update IMPLEMENTATION_CHECKLIST_Week1-2.md with these changes

