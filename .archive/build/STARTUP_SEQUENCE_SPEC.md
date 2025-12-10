# 🚀 STARTUP SEQUENCE SPECIFICATION
**Version:** 1.0 (Brikx v2.0 Post-Release Enhancement)  
**Date:** 6 November 2025  
**Owner:** Frontend Lead + UX Designer  
**Status:** ✅ Ready for Implementation (Week 3+)

---

## 📋 EXECUTIVE SUMMARY

This document specifies the **startup experience** for new Brikx users.

**Problem:** Build v2.0 starts with an empty 3-column interface, which can overwhelm first-time users.

**Solution:** Implement **Progressive Disclosure** - start with a focused welcome, then expand to the full workspace.

**Compatibility:** 100% compatible with Build v2.0 architecture. No breaking changes to AI-First Triage, ChatPanel, or ExpertCorner.

---

## 🎯 DESIGN PRINCIPLES

### 1. Progressive Disclosure
Start simple, reveal complexity gradually.

```
Empty → Focused Welcome → Full Workspace
```

### 2. Immediate Value
User sees purpose within 3 seconds.

### 3. Guided Activation
The first action is obvious and low-friction.

### 4. No Dead Ends
Every state has a clear next step.

---

## 🔄 THE TWO APPROACHES

We specify **two implementations** - choose based on UX testing results:

| Approach | Complexity | User Testing | Implementation Time |
|----------|-----------|--------------|---------------------|
| **A. Simple Welcome** | Low | Not required | 2 hours |
| **B. Progressive Reveal** | Medium | Recommended | 6-8 hours |

---

## 🌟 APPROACH A: SIMPLE WELCOME (Recommended for v1.0)

### Overview
The 3-column layout is visible from the start, but Chat is pre-populated with a welcome message.

### User Flow

```
┌─────────────────────────────────────────────────────────────┐
│ User lands on /wizard                                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  LEFT (35%)          MIDDLE (50%)         RIGHT (15%)       │
│  ┌──────────┐        ┌──────────┐        ┌──────────┐      │
│  │  CHAT    │        │  CANVAS  │        │  EXPERT  │      │
│  │          │        │          │        │          │      │
│  │ 🤖 Welkom│        │ (empty)  │        │ ℹ️ Focus │      │
│  │ bij Brikx│        │          │        │ op veld  │      │
│  │          │        │          │        │ voor tips│      │
│  │ Ik ben...│        │          │        │          │      │
│  │          │        │          │        │          │      │
│  │ [input] │        │          │        │          │      │
│  └──────────┘        └──────────┘        └──────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Implementation

**File:** `/components/chat/ChatPanel.tsx`

```typescript
// MODIFY: ChatPanel.tsx initial state

const [messages, setMessages] = useState<
  { role: "user" | "assistant"; text: string; id?: string }[]
>([
  {
    role: "assistant",
    text: "Welkom bij Brikx! 👋 Ik ben uw digitale bouwcoach. Laten we uw (ver)bouwplan rustig stap-voor-stap in kaart brengen.\n\nHeeft u al een concreet plan, of wilt u eerst brainstormen?",
    id: "welcome-msg",
  },
]);
```

**Styling adjustment:**

```typescript
// Add visual emphasis to first message
<div
  className={
    m.role === "assistant" && m.id === "welcome-msg"
      ? "mr-auto max-w-[90%] rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 px-5 py-4 text-slate-900 shadow-sm"
      : m.role === "assistant"
      ? "mr-auto max-w-[80%] rounded-2xl bg-slate-200 px-4 py-2 text-slate-900"
      : "ml-auto max-w-[80%] rounded-2xl bg-slate-800 px-4 py-2 text-white"
  }
>
  {m.text}
</div>
```

### Quick Reply Chips (Optional Enhancement)

```typescript
// Add after welcome message
const [quickReplies, setQuickReplies] = useState<string[]>([
  "Ik heb een concreet plan",
  "Ik wil eerst brainstormen",
  "Toon me een voorbeeld",
]);

// Render below welcome message
{messages[0]?.id === "welcome-msg" && quickReplies.length > 0 && (
  <div className="flex flex-wrap gap-2 px-3">
    {quickReplies.map((reply, i) => (
      <button
        key={i}
        onClick={() => {
          sendQuery(reply);
          setQuickReplies([]); // Hide after click
        }}
        className="rounded-xl border border-accent bg-white px-4 py-2 text-sm text-accent hover:bg-accent hover:text-white transition-colors"
      >
        {reply}
      </button>
    ))}
  </div>
)}
```

### Acceptance Tests

```typescript
// __tests__/startup/simple-welcome.test.tsx

describe("Simple Welcome", () => {
  it("should show welcome message on first load", () => {
    render(<ChatPanel />);
    expect(screen.getByText(/Welkom bij Brikx/)).toBeInTheDocument();
  });

  it("should show quick reply chips", () => {
    render(<ChatPanel />);
    expect(screen.getByText("Ik heb een concreet plan")).toBeInTheDocument();
  });

  it("should hide quick replies after user sends message", async () => {
    render(<ChatPanel />);
    const chip = screen.getByText("Ik heb een concreet plan");
    fireEvent.click(chip);
    
    await waitFor(() => {
      expect(screen.queryByText("Ik heb een concreet plan")).not.toBeInTheDocument();
    });
  });
});
```

### Pros & Cons

**Pros:**
- ✅ Simple (2 hours implementation)
- ✅ No routing changes needed
- ✅ Consistent with Build v2.0 architecture
- ✅ Can deploy immediately

**Cons:**
- ⚠️ Full 3-column layout visible (might overwhelm)
- ⚠️ Canvas and ExpertCorner are empty (wasted space)

---

## 🎨 APPROACH B: PROGRESSIVE REVEAL (Recommended for v1.1+)

### Overview
Start with a **centered welcome screen**, then animate to the 3-column workspace after user's first interaction.

### User Flow

**Step 1: Landing (0-3 seconds)**

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                                                              │
│                    ┌──────────────────┐                     │
│                    │                  │                     │
│                    │  🏗️ WELKOM       │                     │
│                    │  BIJ BRIKX       │                     │
│                    │                  │                     │
│                    │  Laten we uw     │                     │
│                    │  plannen ordenen │                     │
│                    │                  │                     │
│                    │  [Button 1]      │                     │
│                    │  [Button 2]      │                     │
│                    │                  │                     │
│                    └──────────────────┘                     │
│                                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Step 2: Transition (3-3.5 seconds)**

Animated expansion:
- Welcome screen slides left → becomes ChatPanel
- Canvas fades in from right
- ExpertCorner slides in from far right

**Step 3: Workspace (3.5+ seconds)**

```
┌─────────────────────────────────────────────────────────────┐
│  CHAT          │     CANVAS        │    EXPERT              │
│  (was welcome) │   (fade in)       │   (slide in)           │
└─────────────────────────────────────────────────────────────┘
```

### Implementation

**File 1:** `/components/welcome/WelcomeScreen.tsx` (NEW)

```typescript
"use client";

import React from "react";
import { motion } from "framer-motion";

interface WelcomeScreenProps {
  onStart: (choice: "plan" | "brainstorm") => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100"
    >
      <div className="max-w-lg space-y-8 text-center">
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-4xl text-white shadow-lg"
        >
          🏗️
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-4xl font-bold text-primary">
            Welkom bij Brikx
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Laten we uw (ver)bouwplan rustig stap-voor-stap in kaart brengen.
          </p>
        </motion.div>

        {/* Choice Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <button
            onClick={() => onStart("plan")}
            className="group w-full rounded-xl bg-accent px-6 py-4 text-lg font-medium text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
          >
            <span className="flex items-center justify-center gap-2">
              📋 Ik heb een concreet plan
              <span className="text-2xl transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </button>

          <button
            onClick={() => onStart("brainstorm")}
            className="group w-full rounded-xl border-2 border-accent bg-white px-6 py-4 text-lg font-medium text-accent transition-all hover:scale-105 hover:bg-accent hover:text-white"
          >
            <span className="flex items-center justify-center gap-2">
              💡 Ik wil eerst brainstormen
              <span className="text-2xl transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </button>
        </motion.div>

        {/* Subtle hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-sm text-slate-400"
        >
          Geen zorgen, u kunt later altijd van richting veranderen.
        </motion.p>
      </div>
    </motion.div>
  );
}
```

---

**File 2:** `/components/wizard/WizardLayout.tsx` (MODIFY)

```typescript
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WelcomeScreen from "@/components/welcome/WelcomeScreen";
import ChatPanel from "@/components/chat/ChatPanel";
import Canvas from "@/components/wizard/Canvas";
import ExpertCorner from "@/components/expert/ExpertCorner";
import { useWizardState } from "@/lib/stores/useWizardState";

export default function WizardLayout() {
  const [hasStarted, setHasStarted] = useState(false);
  const setWizardState = useWizardState((s) => s.setState);

  const handleStart = (choice: "plan" | "brainstorm") => {
    // Initialize triage with user's choice
    setWizardState({
      triage: {
        intent: [choice === "plan" ? "structured" : "exploratory"],
      },
      stateVersion: 1,
    });

    // Trigger transition
    setHasStarted(true);
  };

  return (
    <AnimatePresence mode="wait">
      {!hasStarted ? (
        <WelcomeScreen key="welcome" onStart={handleStart} />
      ) : (
        <motion.div
          key="workspace"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid h-screen grid-cols-[35%_50%_15%]"
        >
          {/* Chat Panel - slides in from left */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <ChatPanel />
          </motion.div>

          {/* Canvas - fades in */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Canvas />
          </motion.div>

          {/* Expert Corner - slides in from right */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <ExpertCorner />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

**File 3:** `/components/chat/ChatPanel.tsx` (MODIFY)

```typescript
// MODIFY: Initial message depends on user's choice

const [messages, setMessages] = useState<
  { role: "user" | "assistant"; text: string; id?: string }[]
>(() => {
  // Read from wizardState.triage.intent
  const intent = useWizardState.getState().state?.triage?.intent?.[0];
  
  if (intent === "structured") {
    return [
      {
        role: "assistant",
        text: "Perfect! U heeft al een plan. Laten we beginnen met de basis. Wat is de naam van uw project?",
        id: "welcome-structured",
      },
    ];
  } else if (intent === "exploratory") {
    return [
      {
        role: "assistant",
        text: "Mooi, laten we brainstormen! Vertel me: wat triggerde deze verbouwing? Een nieuw gezinslid, thuiswerken, of iets anders?",
        id: "welcome-exploratory",
      },
    ];
  }
  
  // Fallback (shouldn't happen)
  return [];
});
```

---

### State Management

**File:** `/lib/stores/useStartupStore.ts` (NEW)

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StartupState {
  hasCompletedWelcome: boolean;
  userChoice: "plan" | "brainstorm" | null;
  markWelcomeComplete: () => void;
  reset: () => void;
}

export const useStartupStore = create<StartupState>()(
  persist(
    (set) => ({
      hasCompletedWelcome: false,
      userChoice: null,
      
      markWelcomeComplete: () =>
        set({ hasCompletedWelcome: true }),
      
      reset: () =>
        set({ hasCompletedWelcome: false, userChoice: null }),
    }),
    {
      name: "brikx-startup",
    }
  )
);
```

**Usage:**

```typescript
// In WizardLayout.tsx
const hasCompletedWelcome = useStartupStore((s) => s.hasCompletedWelcome);

// Skip welcome if user already completed it
const [hasStarted, setHasStarted] = useState(hasCompletedWelcome);
```

---

### Acceptance Tests

```typescript
// __tests__/startup/progressive-reveal.test.tsx

describe("Progressive Reveal", () => {
  it("should show welcome screen on first load", () => {
    render(<WizardLayout />);
    expect(screen.getByText(/Welkom bij Brikx/)).toBeInTheDocument();
  });

  it("should transition to workspace after choice", async () => {
    render(<WizardLayout />);
    
    const planButton = screen.getByText(/Ik heb een concreet plan/);
    fireEvent.click(planButton);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Typ uw vraag/)).toBeInTheDocument();
    });
  });

  it("should initialize wizardState with user choice", async () => {
    const { container } = render(<WizardLayout />);
    
    const brainstormButton = screen.getByText(/Ik wil eerst brainstormen/);
    fireEvent.click(brainstormButton);
    
    await waitFor(() => {
      const state = useWizardState.getState().state;
      expect(state.triage.intent).toContain("exploratory");
    });
  });

  it("should show different welcome message based on choice", async () => {
    render(<WizardLayout />);
    
    const planButton = screen.getByText(/Ik heb een concreet plan/);
    fireEvent.click(planButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Laten we beginnen met de basis/)).toBeInTheDocument();
    });
  });

  it("should skip welcome on return visit", () => {
    // Simulate completed welcome
    useStartupStore.setState({ hasCompletedWelcome: true });
    
    render(<WizardLayout />);
    
    // Should see workspace directly
    expect(screen.getByPlaceholderText(/Typ uw vraag/)).toBeInTheDocument();
    expect(screen.queryByText(/Welkom bij Brikx/)).not.toBeInTheDocument();
  });
});
```

---

### Pros & Cons

**Pros:**
- ✅ Clean first impression (no overwhelming UI)
- ✅ Guided activation (clear call-to-action)
- ✅ Contextual welcome message (based on choice)
- ✅ Professional animation (smooth reveal)
- ✅ Respects return users (skip on second visit)

**Cons:**
- ⚠️ More complex (6-8 hours implementation)
- ⚠️ Requires Framer Motion (already in stack)
- ⚠️ Needs UX testing (does progressive disclosure help?)

---

## 📊 COMPARISON TABLE

| Feature | Approach A (Simple) | Approach B (Progressive) |
|---------|---------------------|--------------------------|
| **Implementation Time** | 2 hours | 6-8 hours |
| **Animation Complexity** | None | Medium (Framer Motion) |
| **First Impression** | 3-column workspace | Focused welcome |
| **Cognitive Load** | Medium (all UI visible) | Low (progressive reveal) |
| **Return User Experience** | Same as new user | Skips welcome |
| **Mobile Adaptation** | Works (stacked) | Needs mobile variant |
| **A/B Testing** | Not needed | Recommended |
| **Risk** | Very low | Low |

---

## 🎯 RECOMMENDED IMPLEMENTATION PLAN

### Phase 1: v1.0 (Week 1-2) - Build v2.0 Focus
**Deploy Approach A (Simple Welcome)**
- Minimal effort
- Gets basic welcome in place
- Can deploy with v1.0

### Phase 2: v1.1 (Week 3) - UX Enhancement
**Evaluate need for Approach B**
- Gather user feedback on Approach A
- If users report "overwhelmed": implement Approach B
- If users like direct access: keep Approach A

### Phase 3: v1.2+ (Week 4+) - Optimization
**Refine based on data**
- Track completion rates
- A/B test both approaches
- Implement winner

---

## 📋 IMPLEMENTATION CHECKLIST (Approach B)

### Day 1 (4 hours)
- [ ] Create `/components/welcome/WelcomeScreen.tsx`
- [ ] Add Framer Motion animations
- [ ] Style with Tailwind (gradient, shadows)
- [ ] Test in isolation (Storybook if available)

### Day 2 (4 hours)
- [ ] Modify `/components/wizard/WizardLayout.tsx`
- [ ] Add state management (`useStartupStore`)
- [ ] Implement transition logic
- [ ] Handle edge cases (back button, refresh)

### Day 3 (2 hours)
- [ ] Modify `ChatPanel.tsx` initial message
- [ ] Connect to wizardState.triage.intent
- [ ] Test different welcome messages

### Day 4 (2 hours)
- [ ] Write unit tests (WelcomeScreen)
- [ ] Write integration tests (full flow)
- [ ] Test return user experience

### Day 5 (2 hours)
- [ ] Mobile responsive adjustments
- [ ] Accessibility audit (keyboard navigation, ARIA)
- [ ] Performance check (animation smoothness)

### Day 6 (2 hours)
- [ ] Deploy to staging
- [ ] Smoke tests
- [ ] Documentation

**Total:** 16 hours (2 days for 1 developer)

---

## 🧪 TESTING SCENARIOS

### Scenario 1: First-Time User (Plan Path)
```
1. User lands on /wizard
2. Sees welcome screen with 2 buttons
3. Clicks "Ik heb een concreet plan"
4. Workspace fades in (0.5s animation)
5. Chat shows: "Perfect! Laten we beginnen..."
6. Canvas is empty (waiting for first input)
7. ExpertCorner shows: "Focus op veld voor tips"

Expected: Smooth transition, no errors, clear next step
```

### Scenario 2: First-Time User (Brainstorm Path)
```
1. User lands on /wizard
2. Clicks "Ik wil eerst brainstormen"
3. Workspace fades in
4. Chat shows: "Mooi, laten we brainstormen..."
5. User types: "Ik wil meer ruimte"
6. AI responds with exploratory questions

Expected: Different welcome message, exploratory tone
```

### Scenario 3: Return User
```
1. User completed welcome previously
2. Lands on /wizard
3. SKIPS welcome screen (hasCompletedWelcome = true)
4. Goes directly to workspace
5. Chat shows previous conversation history

Expected: No animation, direct access to workspace
```

### Scenario 4: Mobile User
```
1. User on mobile device (< 768px)
2. Sees welcome screen (responsive)
3. Buttons stack vertically
4. After choice, workspace switches to mobile layout:
   - Chat (full width, collapsible)
   - Canvas (full width, below chat)
   - ExpertCorner (bottom drawer)

Expected: Responsive, no horizontal scroll
```

### Scenario 5: Back Button
```
1. User completes welcome
2. Workspace is visible
3. User clicks browser back button
4. Returns to welcome screen (if hasCompletedWelcome is false)
   OR stays in workspace (if hasCompletedWelcome is true)

Expected: No broken state, consistent behavior
```

---

## 🎨 ANIMATION SPECIFICATIONS

### Welcome Screen Entry
```typescript
// WelcomeScreen.tsx
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.3, ease: "easeOut" }}
```

### Workspace Reveal
```typescript
// ChatPanel
initial={{ x: -50, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ delay: 0.2, duration: 0.4 }}

// Canvas
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ delay: 0.4, duration: 0.4 }}

// ExpertCorner
initial={{ x: 50, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ delay: 0.6, duration: 0.4 }}
```

**Total animation time:** 1.0 second (0.2s delay + 0.4s duration + 0.4s stagger)

**Easing:** `easeOut` for natural deceleration

---

## 📱 MOBILE CONSIDERATIONS

### Welcome Screen (Mobile)
```typescript
<div className="max-w-lg space-y-8 px-4 text-center md:space-y-8">
  {/* Same content, more padding */}
</div>
```

### Workspace (Mobile)
```typescript
// Stack columns vertically
<div className="flex h-screen flex-col md:grid md:grid-cols-[35%_50%_15%]">
  <ChatPanel />
  <Canvas />
  <ExpertCorner />
</div>
```

---

## 🔐 SECURITY & PRIVACY

### Persistence
```typescript
// useStartupStore persists to localStorage
// Data stored: { hasCompletedWelcome: boolean, userChoice: string }

// Clear on logout:
useStartupStore.getState().reset();
```

### No PII
Welcome screen collects **no personal information**. Only stores boolean flag and choice type.

---

## 🎯 SUCCESS METRICS

Track these metrics to evaluate startup effectiveness:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Completion Rate** | > 80% | % users who click a button |
| **Time to First Interaction** | < 5 seconds | Time from land to first click |
| **Bounce Rate** | < 20% | % users who leave without clicking |
| **Return User Skip Rate** | > 90% | % return users who skip welcome |
| **Mobile Completion** | > 70% | % mobile users who complete |

---

## 🚀 DEPLOYMENT STRATEGY

### Week 1-2 (Build v2.0)
```bash
# Deploy Approach A (Simple Welcome)
git checkout -b feature/simple-welcome
# ... implement ...
git commit -m "feat: add welcome message to ChatPanel"
git push origin feature/simple-welcome
```

### Week 3 (UX Enhancement)
```bash
# Deploy Approach B (Progressive Reveal)
git checkout -b feature/progressive-welcome
# ... implement WelcomeScreen ...
git commit -m "feat: add progressive welcome screen"
git push origin feature/progressive-welcome

# A/B test both approaches (if analytics available)
# Deploy to 50% of users
```

### Week 4+ (Optimization)
```bash
# Based on data, choose winner
# Remove losing approach
# Optimize winning approach
```

---

## ✅ FINAL RECOMMENDATION

**For Build v2.0 (Week 1-2):**
✅ Implement **Approach A (Simple Welcome)**
- Low risk, fast implementation
- Gets basic welcome in place
- Can iterate later

**For v1.1+ (Week 3+):**
✅ Consider **Approach B (Progressive Reveal)**
- If user feedback requests it
- If completion rates are low with Approach A
- If budget allows 2-day development

**Priority:** P4 (Nice-to-have, not blocking v1.0)

---

## 📞 SUPPORT & QUESTIONS

If implementing this spec, refer to:
1. Build v2.0 Technical Spec (for ChatPanel structure)
2. ExpertCorner Implementation Plan (for right column behavior)
3. Framer Motion docs (for animation syntax)

**Questions?** Check existing components first:
- `ChatPanel.tsx` for message handling
- `WizardLayout.tsx` for layout structure
- `useWizardState.ts` for state management

---

**Status:** ✅ Ready for implementation (Week 3+)  
**Last Updated:** 6 November 2025  
**Next Review:** After v1.0 user feedback
