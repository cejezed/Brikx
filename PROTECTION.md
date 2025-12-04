# Feature Protection System v3.2

**Versie:** v3.2.0
**Laatste update:** 2025-11-26
**Features beschermd:** 27
**Domeinen:** 6 (Wizard Core, Chat AI, PvE, Premium, Risk, Data Integrity)

Dit project heeft een **multi-layer beschermingssysteem** om te voorkomen dat kritieke features per ongeluk worden verwijderd tijdens code edits.

## 🛡️ Beschermingslagen

### 1. **Feature Registry** - Machine-Readable Source of Truth
- **Locatie:** [config/features.registry.json](./config/features.registry.json)
- **Doel:** Machine-readable definitie van alle 27 features
- **Inhoud:**
  - Feature ID's (WIZARD_F01, CHAT_F01, etc.)
  - Domain classificatie
  - File mappings
  - Check patterns voor grep-based verification
  - Feature groups (WIZARD_CORE, CHAT_AI, etc.)
- **Gebruik:** Input voor check scripts en documentatie generatie

### 2. **FEATURES.md** - Documentatie
- **Locatie:** [FEATURES.md](./FEATURES.md)
- **Doel:** Compleet overzicht van alle kritieke features per file (975 lines)
- **Gebruik:**
  - Lees ALTIJD voor je een file gaat editen
  - Bevat recovery procedures als iets mis gaat
  - Bevat code snippets per feature
  - Bevat check commands om features te verifiëren

### 3. **BUILD_STATUS** - Snapshot Documentation
- **Locatie:** [BUILD_STATUS_v3.2.md](./BUILD_STATUS_v3.2.md)
- **Doel:** Snapshot van volledige product status per versie
- **Inhoud:**
  - Status per feature domain (Wizard, Chat, PvE, Premium, Risk, Data)
  - Architecture overview
  - Known issues & tech debt
  - Deployment status
  - Roadmap
- **Gebruik:** Reference document voor current state of the codebase

### 4. **Pre-commit Hook** - Automatische controle
- **Locatie:** [.husky/pre-commit](./.husky/pre-commit)
- **Doel:** Blokkeert commits die kritieke features verwijderen
- **Werking:**
  ```bash
  git add .
  git commit -m "Fix bug"
  # → Hook draait automatisch
  # → Als feature missing: BLOCKED ❌
  # → Als alles OK: commit gaat door ✅
  ```
- **Bypass:** (alleen als je ZEKER weet wat je doet)
  ```bash
  git commit --no-verify -m "Intentionally remove feature"
  ```

### 5. **NPM Script** - Handmatige check
- **Command:** `npm run check:features`
- **Doel:** On-demand verificatie van alle 27 features
- **Gebruik:**
  ```bash
  # Voor commit
  npm run check:features

  # Output voorbeeld (v3.2):
  # ✅ All 27 critical features present!
  #   • 5 Wizard Core features
  #   • 10 Chat AI features
  #   • 3 PvE Report features
  #   • 3 Premium features
  #   • 3 Risk Analysis features
  #   • 3 Data Integrity features

  # Bij failures:
  # ❌ 2 feature(s) missing!
  # 💡 Check FEATURES.md for recovery procedures
  # 💡 Check config/features.registry.json for feature definitions
  ```

### 6. **Feature Check Script**
- **Locatie:** [scripts/check-features.sh](./scripts/check-features.sh)
- **Doel:** Grep-based verificatie van feature aanwezigheid
- **Werking:** Zoekt naar specifieke patterns in 15+ kritieke files
- **Coverage:**
  - Wizard Core: types/project.ts
  - Chat AI: app/api/chat/route.ts, lib/ai/ProModel.ts, lib/ai/toolHelp.ts, lib/ai/metaDetection.ts, components/chat/ChatPanel.tsx
  - PvE: lib/report/pveView.ts, components/wizard/ExportModal.tsx
  - Premium: components/premium/*.tsx
  - Risk: lib/analysis/budgetRiskAnalysis.ts, lib/domain/lifestyle.ts
  - Data Integrity: lib/wizard/CHAPTER_SCHEMAS.ts

---

## 📋 Workflow voor Developers

### Bij editen van bestaande files:

1. **VOOR edit:**
   ```bash
   # Lees feature manifest
   cat FEATURES.md

   # Check huidige status
   npm run check:features
   ```

2. **TIJDENS edit:**
   - Gebruik `Read` tool om HELE file te lezen (niet alleen snippet)
   - Controleer feature checklist uit FEATURES.md
   - Edit alleen wat nodig is

3. **NA edit:**
   ```bash
   # Verify features intact
   npm run check:features

   # TypeScript check
   npm run type-check

   # Als alles OK: commit
   git add .
   git commit -m "Your message"
   ```

### Als feature check faalt:

```bash
# Zie wat er veranderd is
git diff

# Optie 1: Revert je changes
git checkout -- <file>

# Optie 2: Fix handmatig
# - Open FEATURES.md
# - Zoek de missing feature
# - Voeg terug toe in je file

# Optie 3: Restore van git
git show HEAD:<file> > /tmp/old_version
# Copy missing feature uit /tmp/old_version
```

---

## 🎯 Voor Claude Code / AI Agents

**CRITICAL RULES:**

1. ✅ **ALTIJD** `Read FEATURES.md` voordat je een file edít
2. ✅ **ALTIJD** `Read` de **VOLLEDIGE** file voordat je edít (niet alleen snippet)
3. ✅ **NOOIT** een feature verwijderen zonder expliciete user instructie
4. ✅ **VERIFY** met `npm run check:features` na elke edit
5. ✅ Bij twijfel: **ASK USER** voordat je iets verwijdert

**WORKFLOW:**
```
User: "Fix the button styling in ChatPanel.tsx"

Agent:
  1. Read FEATURES.md
  2. Read components/chat/ChatPanel.tsx (FULL FILE)
  3. Identify features:
     - showOnboarding logic ✅
     - ChatOnboarding component ✅
     - Help button ✅
     - handleSend accepts messageText ✅
  4. Make surgical edit (only button styling)
  5. Verify: npm run check:features
  6. Done ✅
```

**ANTI-PATTERNS (NEVER DO THIS):**
```
❌ Edit file without reading FEATURES.md first
❌ Edit based on snippet only (always read full file)
❌ Replace entire sections without checking feature list
❌ Assume "it's probably still there" (VERIFY!)
```

---

## 🚨 Common Scenarios

### Scenario 1: "followUpQuestion logic missing"
**Symptom:** Chat responses no longer have follow-up questions

**Check:**
```bash
grep -n "followUpQuestion" app/api/chat/route.ts
grep -n "followUpQuestion" lib/ai/ProModel.ts
```

**Fix:** See FEATURES.md section "Route.ts" for exact implementation

---

### Scenario 2: "META_TOOLING pre-layer missing"
**Symptom:** Queries like "hoe gebruik ik deze chat" get irrelevant RAG responses

**Check:**
```bash
grep -n "detectMetaTooling" app/api/chat/route.ts
```

**Fix:** See FEATURES.md section "Route.ts" → META_TOOLING pre-layer

---

### Scenario 3: "ChatOnboarding missing"
**Symptom:** Empty chat panel, no welcome message

**Check:**
```bash
grep -n "showOnboarding" components/chat/ChatPanel.tsx
grep -n "ChatOnboarding" components/chat/ChatPanel.tsx
```

**Fix:** See FEATURES.md section "ChatPanel.tsx"

---

## 📊 Statistics (v3.2)

**Protected files:** 15+
- **Wizard Core:** types/project.ts, lib/stores/useWizardState.ts, lib/utils/patch.ts
- **Chat AI:** app/api/chat/route.ts, lib/ai/ProModel.ts, lib/ai/toolHelp.ts, lib/ai/metaDetection.ts, components/chat/ChatPanel.tsx, lib/rag/Kennisbank.ts
- **PvE:** lib/report/pveView.ts, components/wizard/ExportModal.tsx
- **Premium:** components/premium/PremiumGate.tsx, PremiumBudgetDetails.tsx, PremiumHint.tsx
- **Risk:** lib/analysis/budgetRiskAnalysis.ts, lib/domain/lifestyle.ts
- **Data Integrity:** lib/wizard/CHAPTER_SCHEMAS.ts

**Protected features:** 27
- 5 Wizard Core features
- 10 Chat AI features
- 3 PvE Report features
- 3 Premium features
- 3 Risk Analysis features
- 3 Data Integrity features

**Lines of code protected:** ~2000

**Last updated:** 2025-11-26 (v3.2.0)

---

## 🔗 Related Files

- [config/features.registry.json](./config/features.registry.json) - Machine-readable feature registry (v3.2)
- [FEATURES.md](./FEATURES.md) - Detailed feature documentation (975 lines)
- [BUILD_STATUS_v3.2.md](./BUILD_STATUS_v3.2.md) - Build status snapshot (v3.2)
- [.husky/pre-commit](./.husky/pre-commit) - Pre-commit hook implementation
- [scripts/check-features.sh](./scripts/check-features.sh) - Feature check script (27 checks)
- [package.json](./package.json) - NPM scripts (`check:features`)

---

## ❓ FAQ

**Q: Why do we need this protection?**
A: AI agents (and humans!) can accidentally remove features when editing files. This system prevents that.

**Q: Can I disable the pre-commit hook?**
A: Yes with `git commit --no-verify`, but only do this if you're 100% sure.

**Q: What if I need to intentionally remove a feature?**
A:
1. Remove it from the code
2. Update FEATURES.md to remove from checklist
3. Update scripts/check-features.sh to remove the check
4. Commit with explanation

**Q: How do I add a new feature to protection?**
A:
1. Add to `config/features.registry.json` met:
   - Feature ID (DOMAIN_Fxx format)
   - Name, domain, status
   - Files array
   - Check pattern
   - Description
2. Update FEATURES.md met feature documentation (waarom kritiek, implementation, check, recovery)
3. Add grep check to `scripts/check-features.sh`
4. Test with `npm run check:features`
5. Commit all changes together

**Q: Wat is het verschil tussen features.registry.json en FEATURES.md?**
A:
- `features.registry.json`: Machine-readable, single source of truth voor feature definities, input voor tooling
- `FEATURES.md`: Human-readable, uitgebreide documentatie met code snippets en recovery procedures
- Beiden moeten in sync blijven

---

Made with ❤️ to prevent duplicate work and protect your codebase integrity.
