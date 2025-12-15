# ARCHITECT_TRIGGERS_RULESET_v1_0
**Deterministische trigger-regels voor proactief architect-gedrag**

---

## 0. Doel

Dit document definieert **wanneer** de architect automatisch mag reageren op wizard-activiteiten. Het voorkomt willekeur, spam en AI-looping.

**Belangrijk:**
- Geen LLM-calls in triggers
- Alleen state-diffs + drempels
- Triggers zijn observeerbaar en testbaar

---

## 1. Algemene Trigger-voorwaarden

Een trigger **MAG** alleen vuren als:
- wijziging afkomstig is van `source=user_input | wizard_navigation`
- wijziging niet door AI-patch is veroorzaakt
- debounce-venster (750 ms) is verstreken
- rate-limit (1 auto-turn / 10s / project) niet is overschreden

---

## 2. Trigger Overzicht

| ID | Type | Voorwaarde | Priority | Architect-doel |
|----|------|------------|----------|----------------|
| T1 | chapter_entered | currentChapter wijzigt | low | Intro & kaderen |
| T2 | chapter_completed | requiredFields voldaan | medium | Volgende stap |
| T3 | budget_edited | Δ >5% of >€5.000 | medium | Realiteitscheck |
| T4 | room_added | rooms.length +1 | low | Verdieping |
| T5 | conflicts_increased | conflicts.count ↑ | high | Waarschuwen |
| T6 | wizard_idle | 30s geen input | low | Activeren |

---

## 3. Trigger Specificaties

### T1 – chapter_entered

**Detectie:**
```ts
prev.currentChapter !== next.currentChapter
```

**Event payload:**
```json
{ "chapter": "ruimtes" }
```

**Architect gedrag:**
- Korte uitleg waarom dit hoofdstuk belangrijk is
- Max 1 vraag

---

### T2 – chapter_completed

**Detectie:**
```ts
isChapterComplete(prev) === false && isChapterComplete(next) === true
```

**Architect gedrag:**
- Benoem voortgang
- Kondig volgend hoofdstuk aan

---

### T3 – budget_edited

**Detectie:**
```ts
Math.abs(prev.budget - next.budget) > max(5000, prev.budget * 0.05)
```

**Architect gedrag:**
- Check conflicten
- Geen patches

---

### T4 – room_added

**Detectie:**
```ts
next.rooms.length > prev.rooms.length
```

**Architect gedrag:**
- Vraag naar functie/relatie van nieuwe ruimte

---

### T5 – conflicts_increased

**Detectie:**
```ts
next.conflicts.length > prev.conflicts.length
```

**Architect gedrag:**
- surface_risks
- Expliciete waarschuwing

---

### T6 – wizard_idle

**Detectie:**
```ts
lastUserAction > 30s geleden
```

**Architect gedrag:**
- Activerende vraag
- Geen inhoudelijke analyse

---

## 4. Verboden Triggers

- Geen trigger op elk veld
- Geen trigger bij elke patch
- Geen trigger zonder state-diff

---

## 5. Testvereisten

- Per trigger minimaal 2 tests
- Edge case: snelle wijzigingen
- Edge case: AI-patch

---

**Status:** LOCKED v1.0