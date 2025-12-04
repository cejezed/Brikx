# 🛡️ Feature Protection System v3.2 - README

**Laatste update:** 2025-11-26
**Versie:** v3.2.0
**Features beschermd:** 27
**Domeinen:** 6

---

## 🎯 Wat is dit systeem?

Het **Feature Protection System** is een multi-layer beschermingsmechanisme dat voorkomt dat kritieke features per ongeluk worden verwijderd tijdens code edits. Het combineert:

1. **Machine-readable registry** (JSON) voor tooling
2. **Human-readable documentatie** (Markdown) voor developers
3. **Automated checks** (Bash scripts) voor verificatie
4. **Git hooks** voor pre-commit bescherming
5. **Health monitoring** (Doctor tool) voor maintenance
6. **VS Code snippets** voor developer experience

---

## 🚀 Quick Start

```bash
# Check of alle 27 features aanwezig zijn
npm run check:features

# Health check van het hele systeem
npm run brikx:doctor

# Build + type check
npm run check
```

**Expected output:**
```
✅ All 27 critical features present!

Protected features:
  • 5 Wizard Core features
  • 10 Chat AI features
  • 3 PvE Report features
  • 3 Premium features
  • 3 Risk Analysis features
  • 3 Data Integrity features
```

---

## 📚 Core Files

### 1. Feature Registry (Source of Truth)
**File:** [config/features.registry.json](config/features.registry.json)
**Purpose:** Machine-readable definitie van alle features
**Format:**
```json
{
  "WIZARD_F01_CHAPTER_FLOW": {
    "name": "7-Chapter Wizard Flow",
    "domain": "Wizard Core",
    "status": "stable",
    "files": ["types/project.ts"],
    "checkPattern": "ChapterDataMap",
    "description": "Wizard heeft exact 7 chapters..."
  }
}
```

### 2. Feature Documentation
**File:** [FEATURES.md](FEATURES.md) (975 lines)
**Purpose:** Human-readable docs met code snippets en recovery procedures
**Contents:**
- Feature index per domein
- Waarom elk feature kritiek is
- Implementation code snippets
- Check commands
- Recovery procedures

### 3. Protection Workflow
**File:** [PROTECTION.md](PROTECTION.md)
**Purpose:** Workflow en best practices voor developers
**Contents:**
- 6 protection layers uitgelegd
- Developer workflow
- FAQ
- Common scenarios

### 4. Build Status
**File:** [BUILD_STATUS_v3.2.md](BUILD_STATUS_v3.2.md)
**Purpose:** Snapshot van product status per versie
**Contents:**
- Status per feature domain
- Architecture overview
- Known issues & roadmap
- Deployment info

### 5. Check Scripts
**Files:**
- [scripts/check-features.sh](scripts/check-features.sh) - Grep-based feature verification
- [scripts/brikx-doctor.js](scripts/brikx-doctor.js) - Health monitoring tool

### 6. Git Hooks
**File:** [.husky/pre-commit](.husky/pre-commit)
**Purpose:** Blokkeert commits die kritieke features verwijderen

### 7. VS Code Snippets
**File:** [.vscode/brikx-features.code-snippets](.vscode/brikx-features.code-snippets)
**Snippets:**
- `brikx-new-feature` - Add feature to registry
- `brikx-protected` - Mark code as protected
- `brikx-check-feature` - Add check to script
- `brikx-doc-feature` - Document feature
- `brikx-feature-group` - Add feature group
- `brikx-health` - Run health check

---

## 🔧 Tools & Commands

### npm run check:features
**What:** Verifieert of alle 27 features aanwezig zijn
**When:** Na elke code edit, voor commit
**Output:** Exit code 0 = all green, 1 = failures

### npm run brikx:doctor
**What:** Health check van het hele Feature Protection System
**When:** Weekly maintenance, na grote refactors
**Checks:**
- Registry structure validity
- File references (missing files)
- FEATURES.md sync with registry
- check-features.sh sync with registry
- Orphan features (in registry but not in groups)
- Ghost features (in groups but not in registry)
- Feature ID naming conventions
**Output:**
- ✅ EXCELLENT HEALTH - No issues
- ⚠️ GOOD HEALTH - Warnings only
- ❌ POOR HEALTH - Errors found

---

## 📋 Protected Features

### Wizard Core (5 features)
- **WIZARD_F01** - 7-Chapter Wizard Flow (ChapterDataMap)
- **WIZARD_F02** - Patch Event System (PatchEvent/PatchDelta)
- **WIZARD_F03** - MoSCoW Prioriteiten (must/nice/optional/wont)
- **WIZARD_F04** - Budget Data Structure (BudgetData)
- **WIZARD_F05** - Central WizardState (Zustand store)

### Chat AI (10 features)
- **CHAT_F01** - Smart Follow-up Questions (followUpQuestion)
- **CHAT_F02** - META_TOOLING Pre-layer (detectMetaTooling)
- **CHAT_F03** - Chat Onboarding (getOnboardingMessage)
- **CHAT_F04** - RAG Guard Layer (minConfidence)
- **CHAT_F05** - Intent Classification (VULLEN_DATA/ADVIES_VRAAG)
- **CHAT_F06** - SSE Streaming Protocol (metadata/stream/done)
- **CHAT_F07** - ProModel Patch Generation (generatePatch)
- **CHAT_F08** - Confirmation Requirement ("BEVESTIGING IS VERPLICHT")
- **CHAT_F09** - Formal U/Uw Tone (u/uw niet je/jij)
- **CHAT_F10** - Chapter Quick Replies (4 suggesties per chapter)

### PvE Report (3 features)
- **PVE_F01** - MoSCoW in PvE (priorities in rapport)
- **PVE_F02** - PvE Chapter Structure (buildPvEView)
- **PVE_F03** - Export Modal (PDF/print export)

### Premium (3 features)
- **PREMIUM_F01** - Premium Mode Gating (PREVIEW vs PREMIUM)
- **PREMIUM_F02** - Premium Insights (budget/risk analyses)
- **PREMIUM_F03** - Premium UI Indicators (badges/hints)

### Risk Analysis (3 features)
- **RISK_F01** - Budget vs Wensen Analysis (analyzeBudgetRisk)
- **RISK_F02** - Lifestyle Profiling (deriveLifestyleProfile)
- **RISK_F03** - Scope Profiling (deriveScopeProfile)

### Data Integrity (3 features)
- **DATA_F01** - Chapter Schema Validation (validateChapter)
- **DATA_F02** - UUID Injection (randomUUID)
- **DATA_F03** - State Versioning (stateVersion)

---

## 🔄 Workflow: Adding a New Feature

### Step 1: Add to Registry
**File:** `config/features.registry.json`

```json
{
  "DOMAIN_F08_NEW_FEATURE": {
    "name": "New Feature Name",
    "domain": "Chat AI",
    "status": "stable",
    "files": ["path/to/file.ts"],
    "checkPattern": "uniquePattern",
    "description": "What this feature does"
  }
}
```

**Tip:** Use `brikx-new-feature` snippet in VS Code

### Step 2: Add to Feature Group
**File:** `config/features.registry.json`

```json
{
  "featureGroups": {
    "CHAT_AI": [
      "CHAT_F01_SMART_FOLLOWUP",
      "...",
      "DOMAIN_F08_NEW_FEATURE"  // Add here
    ]
  }
}
```

### Step 3: Document in FEATURES.md
**File:** `FEATURES.md`

Use `brikx-doc-feature` snippet to add:
- Waarom kritiek
- Files + line numbers
- Implementation code snippet
- Check command
- Recovery procedure

### Step 4: Add Check to Script
**File:** `scripts/check-features.sh`

```bash
echo "📄 Checking path/to/file.ts..."
check_feature "path/to/file.ts" "uniquePattern" "DOMAIN_F08: New Feature Name"
echo ""
```

**Tip:** Use `brikx-check-feature` snippet

### Step 5: Mark Code as Protected
**File:** `path/to/file.ts`

```typescript
// @protected DOMAIN_F08_NEW_FEATURE
// This code does X, Y, Z
// DO NOT REMOVE: This is a critical feature tracked in config/features.registry.json
export function myFeature() {
  // ...
}
```

**Tip:** Use `brikx-protected` snippet

### Step 6: Verify

```bash
# Health check
npm run brikx:doctor

# Feature check
npm run check:features
```

**Expected:**
- ✅ Registry valid
- ✅ All files exist
- ✅ FEATURES.md synced
- ✅ Check script synced
- ✅ All features present

---

## 🩺 Health Monitoring

### Daily
```bash
npm run check:features
```

### Weekly
```bash
npm run brikx:doctor
```

### Monthly
- Review `BUILD_STATUS_v3.2.md`
- Check for orphan features
- Update feature statuses (stable → deprecated)
- Remove deprecated features

### After Major Refactor
```bash
npm run brikx:doctor
npm run check:features
npm run type-check
npm run lint
```

---

## 🚨 Troubleshooting

### ❌ Feature check fails
```bash
❌ CHAT_F01: Smart Follow-up Questions - MISSING!
```

**Solution:**
1. Check `FEATURES.md` for feature ID
2. Read "Recovery" section
3. Restore code from git: `git show HEAD~1:path/to/file.ts`
4. Run `npm run check:features` to verify

### ⚠️ Doctor warnings
```
⚠️ WARNING: Feature WIZARD_F08 not found in FEATURES.md
```

**Solution:**
1. Add feature to `FEATURES.md` using `brikx-doc-feature` snippet
2. Run `npm run brikx:doctor` to verify

### ❌ Doctor errors
```
❌ ERROR: File not found: lib/missing/file.ts
```

**Solution:**
1. Update file path in `config/features.registry.json`
2. Or create the missing file
3. Run `npm run brikx:doctor` to verify

---

## 📖 Best Practices

### ✅ DO
- Run `check:features` after every code edit
- Run `brikx:doctor` weekly
- Read `FEATURES.md` before editing files
- Use VS Code snippets for consistency
- Mark protected code with `@protected` comments
- Keep registry + docs in sync

### ❌ DON'T
- Remove features without updating registry
- Edit files without reading FEATURES.md first
- Skip feature checks before committing
- Use `git commit --no-verify` (unless intentional)
- Let registry and docs drift out of sync

---

## 🎓 Learning Path

### Week 1: Basics
1. Read [PROTECTION.md](PROTECTION.md)
2. Run `npm run check:features`
3. Run `npm run brikx:doctor`
4. Browse [FEATURES.md](FEATURES.md)

### Week 2: Understanding
1. Read [config/features.registry.json](config/features.registry.json)
2. Understand feature taxonomy (DOMAIN_Fxx format)
3. Learn feature groups
4. Study check patterns

### Week 3: Contributing
1. Add a new feature (follow workflow above)
2. Use VS Code snippets
3. Run health checks
4. Commit with confidence

---

## 📊 Metrics

**Coverage:**
- 27 features protected
- 6 domains covered
- 20 files monitored
- ~2000 LOC protected

**Tooling:**
- 1 health check tool (brikx:doctor)
- 1 feature check script (27 checks)
- 6 VS Code snippets
- 1 pre-commit hook

**Documentation:**
- 975 lines in FEATURES.md
- 1 build status snapshot
- 1 protection workflow guide
- 1 system README (this file)

---

## 🔮 Future Enhancements (Optional)

### v3.3
- [ ] Auto-generate FEATURES.md from registry
- [ ] Web dashboard voor feature monitoring
- [ ] Integration met CI/CD pipeline
- [ ] Feature usage analytics

### v3.4
- [ ] Automated feature deprecation workflow
- [ ] Feature dependency graph
- [ ] Impact analysis tool
- [ ] Feature version history

---

## 🆘 Support

**Questions?**
1. Check [FEATURES.md](FEATURES.md) - Feature-specific docs
2. Check [PROTECTION.md](PROTECTION.md) - Workflow & FAQ
3. Check [BUILD_STATUS_v3.2.md](BUILD_STATUS_v3.2.md) - Current state
4. Run `npm run brikx:doctor` - Health diagnostics

**Found a bug?**
1. Check if features are intact: `npm run check:features`
2. Check system health: `npm run brikx:doctor`
3. Review git history: `git log --oneline --all --decorate --graph`
4. Restore from backup if needed

---

## 📜 Version History

- **v3.2.0** (2025-11-26) - Multi-domain expansion (27 features across 6 domains)
  - Added Wizard Core features (5)
  - Added PvE features (3)
  - Added Premium features (3)
  - Added Risk features (3)
  - Added Data Integrity features (3)
  - Added brikx:doctor health check tool
  - Added VS Code snippets
  - Created BUILD_STATUS document

- **v3.1.0** - Chat-only protection (16 features)
  - Initial FEATURES.md
  - Basic check-features.sh
  - Pre-commit hooks

---

**Made with ❤️ to prevent feature decay and protect codebase integrity.**
