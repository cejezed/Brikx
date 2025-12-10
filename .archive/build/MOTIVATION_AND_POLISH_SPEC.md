# 🎨 MOTIVATION & POLISH SPECIFICATION
**Version:** 1.0 (Brikx v2.0 Enhancement Layer)  
**Date:** 8 November 2025  
**Owner:** Frontend Lead + UX Designer  
**Status:** ✅ Ready for Implementation (Week 3-4)

---

## 📋 EXECUTIVE SUMMARY

This document specifies the **psychological and visual layer** that transforms Brikx from a functional wizard into a motivating, professional experience.

**Problem:** Build v2.0 works but lacks:
- Psychological motivation to complete
- Visual "wow-factor" and polish
- Proactive guidance that feels smart

**Solution:** Add three integrated systems:
1. **Progress & Motivation System** - Psychology-driven completion
2. **Visual Identity Layer** - State-of-the-art polish
3. **Proactive Guidance System** - Smart, anticipatory tips

**Compatibility:** 100% compatible with Build v2.0. These are additive enhancements.

---

## 🎯 DESIGN PRINCIPLES

### 1. Psychological Motivation
Use proven behavioral psychology to drive completion:
- **Endowed Progress Effect** - Users feel they've already started
- **Goal Gradient** - Motivation increases as goal approaches
- **Small Wins** - Celebrate micro-completions

### 2. Professional Polish
State-of-the-art execution without gimmicks:
- **Subtle Animations** - Smooth, purposeful motion
- **Consistent Identity** - Color, typography, spacing
- **Attention to Detail** - Every pixel matters

### 3. Proactive Intelligence
The interface anticipates needs:
- **Context-Aware Tips** - Right info at right time
- **Smart Defaults** - Reduce cognitive load
- **Gentle Nudges** - Guide without forcing

---

## 🎯 PART 1: PROGRESS & MOTIVATION SYSTEM

### 1.1 The Endowed Progress Effect

**Research:** Studies show starting at 20% increases completion by 82% (Nunes & Drèze, 2006).

**Implementation:**

#### Component: `ProgressBar.tsx`

```typescript
"use client";

import React from "react";
import { motion } from "framer-motion";
import { useWizardState } from "@/lib/stores/useWizardState";

export default function ProgressBar() {
  const wizardState = useWizardState((s) => s.state);
  
  // Calculate progress with 20% endowment
  const rawProgress = calculateRawProgress(wizardState);
  const displayProgress = Math.max(20, rawProgress); // Never below 20%
  
  // Calculate milestone achievements
  const milestones = [
    { threshold: 25, label: "Start gemaakt", reached: displayProgress >= 25 },
    { threshold: 50, label: "Halverwege", reached: displayProgress >= 50 },
    { threshold: 75, label: "Bijna klaar", reached: displayProgress >= 75 },
    { threshold: 100, label: "Compleet", reached: displayProgress >= 100 },
  ];
  
  const currentMilestone = milestones.find((m) => !m.reached) || milestones[3];
  
  return (
    <div className="space-y-2 px-4 py-3">
      {/* Progress Label */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">
          Uw voortgang
        </span>
        <span className="text-slate-500">
          {Math.round(displayProgress)}%
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="relative h-2 overflow-hidden rounded-full bg-slate-200">
        <motion.div
          initial={{ width: "20%" }}
          animate={{ width: `${displayProgress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-accent to-accent/80"
        />
        
        {/* Milestone Markers */}
        {milestones.map((milestone) => (
          <div
            key={milestone.threshold}
            style={{ left: `${milestone.threshold}%` }}
            className="absolute top-0 h-full w-0.5 bg-white/50"
          />
        ))}
      </div>
      
      {/* Next Milestone */}
      <p className="text-xs text-slate-500">
        Volgende doel: <span className="font-medium text-accent">{currentMilestone.label}</span>
      </p>
    </div>
  );
}

/**
 * Calculate raw completion percentage based on filled fields
 */
function calculateRawProgress(wizardState: any): number {
  if (!wizardState?.chapterAnswers) return 0;
  
  const chapters = ["basis", "ruimtes", "wensen", "budget", "techniek"];
  let totalFields = 0;
  let filledFields = 0;
  
  // Required fields per chapter
  const requiredFields = {
    basis: ["projectNaam", "locatie", "projectType"],
    ruimtes: ["rooms"], // Array, count items
    wensen: ["wishes"],
    budget: ["klasse"],
    techniek: ["isolatie", "ventilation"],
  };
  
  chapters.forEach((chapter) => {
    const fields = requiredFields[chapter] || [];
    totalFields += fields.length;
    
    fields.forEach((field) => {
      const value = wizardState.chapterAnswers[chapter]?.[field];
      if (Array.isArray(value)) {
        if (value.length > 0) filledFields++;
      } else if (value !== null && value !== undefined && value !== "") {
        filledFields++;
      }
    });
  });
  
  return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
}
```

**Where to add:**
```typescript
// In WizardLayout.tsx - add to top of Canvas column

<div className="grid h-screen grid-cols-[35%_50%_15%]">
  <ChatPanel />
  
  <div className="flex flex-col">
    <ProgressBar /> {/* ← Add here */}
    <Canvas />
  </div>
  
  <ExpertCorner />
</div>
```

---

### 1.2 Goal Gradient Feedback

**Principle:** As users get closer to completion, motivation increases. Reinforce this with explicit feedback.

#### Implementation: Micro-Feedback System

**File:** `/lib/feedback/microFeedback.ts`

```typescript
export interface FeedbackTrigger {
  condition: (state: any, action: string) => boolean;
  message: string;
  type: "success" | "milestone" | "encouragement";
}

/**
 * Feedback messages triggered by specific actions
 */
export const FEEDBACK_TRIGGERS: FeedbackTrigger[] = [
  // First field filled
  {
    condition: (state, action) => {
      return action === "FIRST_FIELD_FILLED";
    },
    message: "Mooi, u bent begonnen! Dat helpt uw plan concreet te maken.",
    type: "success",
  },
  
  // 25% milestone
  {
    condition: (state) => {
      const progress = calculateRawProgress(state);
      return progress >= 25 && progress < 30;
    },
    message: "Prima voortgang — u heeft al een kwart afgerond.",
    type: "milestone",
  },
  
  // 50% milestone
  {
    condition: (state) => {
      const progress = calculateRawProgress(state);
      return progress >= 50 && progress < 55;
    },
    message: "Geweldig, u bent halverwege. De basis staat nu stevig.",
    type: "milestone",
  },
  
  // 75% milestone (Goal Gradient kicks in)
  {
    condition: (state) => {
      const progress = calculateRawProgress(state);
      return progress >= 75 && progress < 80;
    },
    message: "Bijna klaar! Nog een paar stappen en uw PvE is compleet.",
    type: "encouragement",
  },
  
  // Room added
  {
    condition: (state, action) => {
      return action === "ROOM_ADDED";
    },
    message: "Ruimte toegevoegd. Denk alvast aan lichtinval en routing.",
    type: "success",
  },
  
  // Budget filled
  {
    condition: (state, action) => {
      return action === "BUDGET_FILLED" && state.chapterAnswers?.budget?.klasse;
    },
    message: "Budget genoteerd. Dit helpt later bij materiaalkeuzes.",
    type: "success",
  },
  
  // All chapters touched (not completed)
  {
    condition: (state) => {
      const chapters = ["basis", "ruimtes", "wensen", "budget", "techniek"];
      return chapters.every((ch) => state.chapterAnswers?.[ch]);
    },
    message: "U heeft alle hoofdstukken bezocht. Goed overzicht!",
    type: "milestone",
  },
];

/**
 * Get feedback message based on current state and action
 */
export function getFeedback(
  state: any,
  action: string
): { message: string; type: string } | null {
  const trigger = FEEDBACK_TRIGGERS.find((t) => t.condition(state, action));
  return trigger ? { message: trigger.message, type: trigger.type } : null;
}
```

**Integration with ChatPanel:**

```typescript
// In ChatPanel.tsx - after state update

function handleStateUpdate(newState: any, action: string) {
  setWizardState(newState);
  
  // Check for feedback triggers
  const feedback = getFeedback(newState, action);
  
  if (feedback) {
    // Add as assistant message
    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        text: feedback.message,
        type: feedback.type, // For styling
      },
    ]);
  }
}
```

**Styling for feedback types:**

```typescript
// In ChatPanel message rendering
<div
  className={
    m.type === "milestone"
      ? "mr-auto rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 px-4 py-2 border border-accent/20"
      : m.type === "encouragement"
      ? "mr-auto rounded-2xl bg-gradient-to-br from-green-50 to-green-100/50 px-4 py-2"
      : "mr-auto rounded-2xl bg-slate-200 px-4 py-2"
  }
>
  {m.text}
</div>
```

---

### 1.3 Visual Mini-Goals

**Principle:** Break large task into visible small wins.

#### Component: `ChapterChecklist.tsx`

```typescript
"use client";

import React from "react";
import { motion } from "framer-motion";
import { useWizardState } from "@/lib/stores/useWizardState";

interface Chapter {
  id: string;
  label: string;
  icon: string;
  requiredFields: string[];
}

const CHAPTERS: Chapter[] = [
  { id: "basis", label: "Basis", icon: "📋", requiredFields: ["projectNaam", "locatie"] },
  { id: "ruimtes", label: "Ruimtes", icon: "🏠", requiredFields: ["rooms"] },
  { id: "wensen", label: "Wensen", icon: "💡", requiredFields: ["wishes"] },
  { id: "budget", label: "Budget", icon: "💰", requiredFields: ["klasse"] },
  { id: "techniek", label: "Techniek", icon: "🔧", requiredFields: ["isolatie"] },
];

export default function ChapterChecklist() {
  const wizardState = useWizardState((s) => s.state);
  
  const chapterStatus = CHAPTERS.map((chapter) => {
    const answers = wizardState?.chapterAnswers?.[chapter.id];
    const filled = chapter.requiredFields.filter((field) => {
      const value = answers?.[field];
      return Array.isArray(value) ? value.length > 0 : !!value;
    }).length;
    
    const total = chapter.requiredFields.length;
    const percentage = Math.round((filled / total) * 100);
    const isComplete = percentage === 100;
    
    return { ...chapter, filled, total, percentage, isComplete };
  });
  
  return (
    <div className="space-y-2 p-4">
      <h3 className="text-sm font-semibold text-slate-700">Hoofdstukken</h3>
      
      <div className="space-y-1">
        {chapterStatus.map((chapter) => (
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
              chapter.isComplete
                ? "bg-green-50 text-green-800"
                : chapter.percentage > 0
                ? "bg-blue-50 text-blue-800"
                : "bg-slate-50 text-slate-600"
            }`}
          >
            <span className="flex items-center gap-2">
              <span>{chapter.icon}</span>
              <span className="font-medium">{chapter.label}</span>
            </span>
            
            <span className="flex items-center gap-2">
              {chapter.isComplete ? (
                <span className="text-green-600">✓</span>
              ) : (
                <span className="text-xs">{chapter.percentage}%</span>
              )}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

**Where to add:**

```typescript
// In Canvas.tsx - sidebar or top section

<div className="space-y-4">
  <ChapterChecklist /> {/* ← Add here */}
  <CurrentChapterContent />
</div>
```

---

### 1.4 Milestone Celebrations

**Principle:** Celebrate achievements subtly and professionally (no confetti).

#### Component: `MilestoneBadge.tsx`

```typescript
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MilestoneBadgeProps {
  milestone: number; // 25, 50, 75, 100
}

export default function MilestoneBadge({ milestone }: MilestoneBadgeProps) {
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(timer);
  }, []);
  
  const milestoneConfig = {
    25: { icon: "🌱", label: "Start gemaakt", color: "from-green-400 to-green-600" },
    50: { icon: "⚡", label: "Halverwege", color: "from-blue-400 to-blue-600" },
    75: { icon: "🔥", label: "Bijna klaar", color: "from-orange-400 to-orange-600" },
    100: { icon: "🎉", label: "Compleet", color: "from-purple-400 to-purple-600" },
  };
  
  const config = milestoneConfig[milestone] || milestoneConfig[25];
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-20 right-6 z-50"
        >
          <div
            className={`flex items-center gap-3 rounded-2xl bg-gradient-to-r ${config.color} px-6 py-4 text-white shadow-2xl`}
          >
            <span className="text-3xl">{config.icon}</span>
            <div>
              <p className="font-bold">{config.label}!</p>
              <p className="text-sm opacity-90">{milestone}% voltooid</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Trigger in progress calculation:**

```typescript
// In ProgressBar.tsx or global state watcher

useEffect(() => {
  const progress = calculateRawProgress(wizardState);
  
  // Check if milestone just reached
  if (progress >= 25 && !hasShownMilestone25) {
    setShowMilestone(25);
    setHasShownMilestone25(true);
  }
  // ... repeat for 50, 75, 100
}, [wizardState]);
```

---

## 🎨 PART 2: VISUAL IDENTITY LAYER

### 2.1 Color Palette Integration

**File:** `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        primary: "#0D3D4D", // Diep donkergroen
        accent: "#40C0C0", // Turquoise
        neutral: {
          50: "#F5F7F6",
          100: "#E8EBE9",
          200: "#D1D6D3",
          // ... rest of scale
        },
        premium: "#B8865C", // Koper-goud
        success: "#59C173",
        error: "#E76F51",
      },
      fontFamily: {
        sans: ["Inter", "IBM Plex Sans", "sans-serif"],
      },
      letterSpacing: {
        relaxed: "0.01em",
      },
      lineHeight: {
        relaxed: "1.6",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.06)",
        medium: "0 4px 16px rgba(0, 0, 0, 0.08)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
```

**Apply to existing components:**

```typescript
// Update ChatPanel.tsx bubbles
<div
  className={
    m.role === "user"
      ? "ml-auto max-w-[80%] rounded-2xl bg-primary px-4 py-2 text-white shadow-soft"
      : "mr-auto max-w-[80%] rounded-2xl bg-neutral-100 px-4 py-2 text-primary shadow-soft"
  }
>
```

---

### 2.2 WhatsApp-Style Chat Refinement

**Enhanced Chat Bubbles:**

```typescript
// In ChatPanel.tsx - refine message styling

<div
  className={
    m.role === "user"
      ? `
        ml-auto max-w-[80%] rounded-[20px] rounded-tr-[4px]
        bg-primary px-4 py-3 text-white shadow-soft
        leading-relaxed
      `
      : `
        mr-auto max-w-[80%] rounded-[20px] rounded-tl-[4px]
        bg-neutral-100 px-4 py-3 text-primary shadow-soft
        leading-relaxed
      `
  }
>
  {m.text}
</div>
```

**Add timestamp:**

```typescript
<div className="flex items-end gap-2">
  <div className="bubble-style">
    {m.text}
  </div>
  <span className="text-[10px] text-slate-400">
    {formatTime(m.timestamp)}
  </span>
</div>
```

---

### 2.3 AI Avatar with Pulse Effect

**Component:** `Avatar.tsx`

```typescript
"use client";

import React from "react";
import { motion } from "framer-motion";

interface AvatarProps {
  status: "idle" | "thinking" | "speaking";
}

export default function Avatar({ status }: AvatarProps) {
  return (
    <div className="relative h-10 w-10">
      {/* Pulse effect when thinking */}
      {status === "thinking" && (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-accent/30"
        />
      )}
      
      {/* Avatar circle */}
      <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-medium">
        {/* Abstract geometric face */}
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <circle cx="8" cy="10" r="1.5" />
          <circle cx="16" cy="10" r="1.5" />
          <path d="M8 15 Q12 17 16 15" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
      
      {/* Status indicator */}
      {status === "speaking" && (
        <motion.div
          animate={{ scale: [0.8, 1, 0.8] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-success border-2 border-white"
        />
      )}
    </div>
  );
}
```

**Integration:**

```typescript
// In ChatPanel.tsx - add avatar to assistant messages

{m.role === "assistant" && (
  <div className="flex items-start gap-3">
    <Avatar status={isTyping ? "thinking" : "speaking"} />
    <div className="bubble-style">{m.text}</div>
  </div>
)}
```

---

### 2.4 Visual Input Components

#### Style Chips (for project type selection)

```typescript
"use client";

import React from "react";
import { motion } from "framer-motion";

const PROJECT_STYLES = [
  { id: "modern", label: "Modern", icon: "🏢", image: "/styles/modern.jpg" },
  { id: "classic", label: "Klassiek", icon: "🏛️", image: "/styles/classic.jpg" },
  { id: "industrial", label: "Industrieel", icon: "🏭", image: "/styles/industrial.jpg" },
  { id: "natural", label: "Natuurlijk", icon: "🌿", image: "/styles/natural.jpg" },
];

export default function StyleChips({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PROJECT_STYLES.map((style) => (
        <motion.button
          key={style.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(style.id)}
          className={`
            relative overflow-hidden rounded-2xl p-4 text-left transition-all
            ${
              value === style.id
                ? "ring-2 ring-accent shadow-medium"
                : "ring-1 ring-neutral-200 hover:ring-accent/50"
            }
          `}
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${style.image})` }}
          />
          
          {/* Content */}
          <div className="relative z-10">
            <span className="text-3xl">{style.icon}</span>
            <p className="mt-2 font-medium text-primary">{style.label}</p>
          </div>
          
          {/* Selected indicator */}
          {value === style.id && (
            <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white">
              ✓
            </div>
          )}
        </motion.button>
      ))}
    </div>
  );
}
```

---

### 2.5 Subtle Animation Library

**File:** `/lib/animations/variants.ts`

```typescript
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: "easeOut" },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

export const slideInFromRight = {
  initial: { x: 50, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 50, opacity: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
};

export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
  transition: { duration: 0.2 },
};

export const quickReplyHover = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 300, damping: 20 },
};
```

**Usage:**

```typescript
import { fadeInUp, quickReplyHover } from "@/lib/animations/variants";

// In components
<motion.div {...fadeInUp}>
  <Card />
</motion.div>

<motion.button {...quickReplyHover}>
  Quick Reply
</motion.button>
```

---

## 🧠 PART 3: PROACTIVE GUIDANCE SYSTEM

### 3.1 Context-Aware ExpertCorner Tips

**Enhanced Tip System with Proactivity:**

**File:** `/lib/expert/proactiveTips.ts`

```typescript
export interface ProactiveTip {
  id: string;
  trigger: (state: any) => boolean;
  content: string;
  icon: string;
  priority: "high" | "medium" | "low";
}

export const PROACTIVE_TIPS: ProactiveTip[] = [
  // Anticipatory tips
  {
    id: "think-ahead-lighting",
    trigger: (state) => {
      // When user adds a room but hasn't thought about windows
      const rooms = state.chapterAnswers?.ruimtes?.rooms || [];
      return rooms.length > 0 && !state.chapterAnswers?.techniek?.lighting;
    },
    content: "Denk alvast aan verlichting — elke ruimte heeft natuurlijk én kunstlicht nodig.",
    icon: "💡",
    priority: "medium",
  },
  
  {
    id: "budget-contingency",
    trigger: (state) => {
      // When budget is filled but no contingency
      const hasBudget = state.chapterAnswers?.budget?.klasse;
      const hasContingency = state.chapterAnswers?.budget?.contingency;
      return hasBudget && !hasContingency;
    },
    content: "Let op: reserveer 15-20% voor onvoorziene kosten. Dit voorkomt financiële stress.",
    icon: "⚠️",
    priority: "high",
  },
  
  {
    id: "room-relationships",
    trigger: (state) => {
      const rooms = state.chapterAnswers?.ruimtes?.rooms || [];
      return rooms.length >= 3;
    },
    content: "Tip: denk na over de relatie tussen ruimtes. Welke moeten dichtbij elkaar?",
    icon: "🔗",
    priority: "medium",
  },
  
  {
    id: "premium-value",
    trigger: (state) => {
      const progress = calculateRawProgress(state);
      const isPremium = state.mode === "PREMIUM";
      return progress >= 40 && !isPremium;
    },
    content: "Met Premium krijgt u toegang tot kostenschattingen en vergunningcheck.",
    icon: "🔒",
    priority: "low",
  },
  
  {
    id: "sustainability-prompt",
    trigger: (state) => {
      const hasTechniek = state.chapterAnswers?.techniek;
      const hasSustainability = state.chapterAnswers?.duurzaam;
      return hasTechniek && !hasSustainability;
    },
    content: "Overweeg ook duurzame opties — dit kan op lange termijn geld besparen.",
    icon: "🌿",
    priority: "medium",
  },
];

export function getProactiveTips(state: any): ProactiveTip[] {
  return PROACTIVE_TIPS.filter((tip) => tip.trigger(state)).sort(
    (a, b) => {
      const priority = { high: 3, medium: 2, low: 1 };
      return priority[b.priority] - priority[a.priority];
    }
  );
}
```

**Integration in ExpertCorner:**

```typescript
// In ExpertCorner.tsx

const proactiveTips = getProactiveTips(wizardState);

return (
  <div className="space-y-4 p-4">
    {/* Static tips (existing) */}
    {staticTips.length > 0 && <StaticTipsSection />}
    
    {/* Proactive tips (NEW) */}
    {proactiveTips.length > 0 && (
      <div>
        <h3 className="font-bold text-xs text-slate-700 mb-2">
          🔮 DENK VOORUIT
        </h3>
        <div className="space-y-2">
          {proactiveTips.map((tip) => (
            <motion.div
              key={tip.id}
              {...fadeInUp}
              className={`
                rounded-lg p-3 text-xs
                ${
                  tip.priority === "high"
                    ? "bg-orange-50 border border-orange-200"
                    : "bg-blue-50 border border-blue-200"
                }
              `}
            >
              <div className="flex gap-2">
                <span>{tip.icon}</span>
                <p className="leading-relaxed">{tip.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )}
    
    {/* Premium AI snippets (existing) */}
    {mode === "PREMIUM" && <RAGSnippets />}
  </div>
);
```

---

### 3.2 Smart Defaults

**Reduce cognitive load by suggesting common values:**

```typescript
// In form fields

<input
  placeholder="Bijv. Villa Zonnestraal, Renovatie Grachtenhuis..."
  defaultValue={suggestProjectName(wizardState)}
/>

function suggestProjectName(state: any): string {
  const location = state.chapterAnswers?.basis?.locatie || "";
  const type = state.chapterAnswers?.triage?.projectType || "";
  
  if (location && type) {
    return `${type} ${location}`;
  }
  return "";
}
```

---

### 3.3 Gentle Nudges

**Non-intrusive reminders about incomplete sections:**

```typescript
// In Canvas.tsx - show subtle indicator for incomplete chapters

const incompleteChapters = getIncompleteChapters(wizardState);

{incompleteChapters.length > 0 && (
  <div className="rounded-lg bg-amber-50 p-3 text-sm">
    <p className="font-medium text-amber-800">
      Nog {incompleteChapters.length} onderdelen te voltooien
    </p>
    <ul className="mt-2 space-y-1">
      {incompleteChapters.map((ch) => (
        <li key={ch.id} className="flex items-center gap-2 text-amber-700">
          <span>•</span>
          <button
            onClick={() => navigateToChapter(ch.id)}
            className="underline hover:text-amber-900"
          >
            {ch.label}
          </button>
        </li>
      ))}
    </ul>
  </div>
)}
```

---

## 📊 IMPLEMENTATION PLAN

### Week 3: Core Motivation System (Days 15-19)

#### Day 15 (Monday) - Progress System
- [ ] Create `ProgressBar.tsx` component
- [ ] Implement 20% endowed progress
- [ ] Add progress calculation logic
- [ ] Integrate with WizardLayout

**Acceptance Test:**
```typescript
it("should show minimum 20% progress on empty state", () => {
  const { getByText } = render(<ProgressBar />);
  expect(getByText(/20%/)).toBeInTheDocument();
});
```

---

#### Day 16 (Tuesday) - Micro-Feedback System
- [ ] Create `microFeedback.ts` logic
- [ ] Add feedback triggers
- [ ] Integrate with ChatPanel
- [ ] Style feedback message types

**Acceptance Test:**
```typescript
it("should show milestone feedback at 50%", async () => {
  const state = { /* 50% filled */ };
  const feedback = getFeedback(state, "FIELD_UPDATED");
  expect(feedback.message).toContain("halverwege");
});
```

---

#### Day 17 (Wednesday) - Visual Mini-Goals
- [ ] Create `ChapterChecklist.tsx`
- [ ] Calculate per-chapter completion
- [ ] Add to Canvas sidebar
- [ ] Style completion states

**Acceptance Test:**
```typescript
it("should show checkmark for completed chapters", () => {
  const { getByText } = render(<ChapterChecklist />);
  expect(getByText("✓")).toBeInTheDocument();
});
```

---

#### Day 18 (Thursday) - Milestone Celebrations
- [ ] Create `MilestoneBadge.tsx`
- [ ] Add milestone detection logic
- [ ] Trigger on progress milestones
- [ ] Test animations

**Acceptance Test:**
```typescript
it("should show badge when reaching 50%", async () => {
  const { getByText } = render(<MilestoneBadge milestone={50} />);
  expect(getByText("Halverwege!")).toBeInTheDocument();
});
```

---

#### Day 19 (Friday) - Integration & Testing
- [ ] Test full progress system end-to-end
- [ ] Verify feedback triggers correctly
- [ ] Check performance (no lag)
- [ ] Mobile responsive adjustments

---

### Week 4: Visual Polish & Proactivity (Days 20-24)

#### Day 20 (Monday) - Color Palette & Theme
- [ ] Update `tailwind.config.ts`
- [ ] Apply colors to ChatPanel
- [ ] Apply colors to Canvas
- [ ] Apply colors to ExpertCorner

---

#### Day 21 (Tuesday) - Chat Refinements
- [ ] WhatsApp-style bubble improvements
- [ ] Add Avatar component
- [ ] Add pulse effect for thinking state
- [ ] Add timestamps

---

#### Day 22 (Wednesday) - Visual Inputs
- [ ] Create `StyleChips.tsx`
- [ ] Create visual dropdowns
- [ ] Replace plain inputs where appropriate
- [ ] Test interactions

---

#### Day 23 (Thursday) - Proactive Tips
- [ ] Create `proactiveTips.ts` logic
- [ ] Integrate with ExpertCorner
- [ ] Add trigger conditions
- [ ] Style proactive tip cards

---

#### Day 24 (Friday) - Final Polish & Testing
- [ ] Add animation variants library
- [ ] Apply animations throughout
- [ ] Full visual audit
- [ ] Performance optimization
- [ ] Deploy to staging

---

## ✅ SUCCESS CRITERIA

By end of Week 4, verify:

### Progress & Motivation
- [ ] Progress bar shows minimum 20% on empty state
- [ ] Milestone badges appear at 25%, 50%, 75%, 100%
- [ ] Micro-feedback triggers appropriately
- [ ] Chapter checklist shows accurate completion

### Visual Polish
- [ ] Color palette applied consistently
- [ ] WhatsApp-style chat feels natural
- [ ] Avatar pulse effect works smoothly
- [ ] Animations are subtle and performant

### Proactive Guidance
- [ ] ExpertCorner shows context-aware tips
- [ ] Proactive tips appear at right moments
- [ ] Gentle nudges for incomplete sections
- [ ] No annoying or excessive notifications

### Performance
- [ ] No jank or lag in animations
- [ ] Page load < 2 seconds
- [ ] Smooth interactions on mobile

---

## 📊 METRICS TO TRACK

| Metric | Baseline (Before) | Target (After) | How to Measure |
|--------|-------------------|----------------|----------------|
| **Completion Rate** | ~30% | > 60% | % users who reach 100% |
| **Time to 50%** | 20 min | < 10 min | Median time to halfway |
| **Bounce Rate** | ~40% | < 20% | % leave without progress |
| **Return Rate** | ~10% | > 30% | % users who return |
| **Premium Conversion** | ~5% | > 12% | % upgrade to Premium |

---

## 🚀 DEPLOYMENT STRATEGY

### Week 3: Core Features
```bash
git checkout -b feature/motivation-system
# ... implement Days 15-19 ...
git commit -m "feat: add progress & motivation system"
git push origin feature/motivation-system
```

### Week 4: Polish Layer
```bash
git checkout -b feature/visual-polish
# ... implement Days 20-24 ...
git commit -m "feat: add visual identity & proactive guidance"
git push origin feature/visual-polish
```

### Merge Strategy
1. Week 3 → Merge to `main` after testing (Day 19)
2. Week 4 → Merge to `main` after final audit (Day 24)
3. Deploy to production as **v1.2**

---

## 🎯 FINAL RECOMMENDATION

**Priority:** P2 (High - implement after v1.0)

**Rationale:**
- Dramatically improves user experience
- Increases completion rates (proven psychology)
- Makes Brikx feel modern and professional
- Minimal risk (additive enhancements only)

**Sequence:**
1. Week 1-2: Build v2.0 core (as planned)
2. Week 3: Motivation system (this spec)
3. Week 4: Visual polish (this spec)

**Result:** Brikx v1.2 with state-of-the-art UX

---

**Status:** ✅ Ready for implementation (Week 3-4)  
**Last Updated:** 8 November 2025  
**Dependencies:** Build v2.0 must be complete first
