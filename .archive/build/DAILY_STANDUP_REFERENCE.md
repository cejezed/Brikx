# 📋 DAILY STANDUP REFERENCE (3–14 Nov 2025)

Use this card in your daily standup to report progress.

---

## 🗓️ MON 3 NOV — Server Nudge (P2 Blocker)

**Owner:** Backend Lead  
**Goal:** Context-aware nudge that includes original query  
**Files:** `/types/chat.ts`, `/lib/sse/stream.ts`, `/app/api/chat/route.ts`

### Standup Template

```
✅ COMPLETED:
- [ ] WizardState has stateVersion field
- [ ] SSE writer implemented (lib/sse/stream.ts)
- [ ] /api/chat returns SSE stream (not JSON)
- [ ] essentialsCheck() + makeContextAwareNudge() work

🚧 IN PROGRESS:
- [ ] (none yet)

❌ BLOCKED:
- [ ] (none yet)

📊 METRICS:
- First-token latency: ___ ms
- Tests passing: ___ / ___
- TypeScript errors: ___
```

### Acceptance Test (copy-paste)

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "query": "Fijne kookplek",
    "wizardState": { "stateVersion": 0 },
    "mode": "PREVIEW"
  }' 2>&1 | grep -E "event:|data:"
```

**Expected output:** 
```
event: metadata
data: {...,"policy":"ASK_CLARIFY",...}
event: stream
data: {...,"text":"Ik wil graag..."}
```

---

## 🗓️ TUE 4 NOV — Server Triage & Policy (P2 Blocker)

**Owner:** Backend Lead  
**Goal:** AI classification + confidence policy tree  
**Files:** `/lib/ai/ProModel.ts`, `/app/api/chat/route.ts`

### Standup Template

```
✅ COMPLETED:
- [ ] ProModel.classify() implemented (stub)
- [ ] determinePolicy() function works
- [ ] /api/chat routes to correct intent handler
- [ ] Confidence bands are calculated
- [ ] SSE stream includes metadata event

🚧 IN PROGRESS:
- [ ] (none yet)

❌ BLOCKED:
- [ ] (if LLM API not ready)

📊 METRICS:
- Intents classified: ___ / ___
- Policy accuracy: ___ %
- Tests passing: ___ / ___
```

### Acceptance Test (copy-paste)

```bash
# Test high-confidence intent
curl -X POST http://localhost:3000/api/chat \
  -H "Accept: text/event-stream" \
  -d '{
    "query": "3 slaapkamers",
    "wizardState": {
      "stateVersion": 1,
      "chapterAnswers": { "basis": { "projectNaam": "Villa Dijk" } }
    },
    "mode": "PREVIEW"
  }' 2>&1 | grep -E "APPLY_OPTIMISTIC|confidence"
```

**Expected:** Both strings in output, confidence >= 0.90

---

## 🗓️ WED 5 NOV — Client Streaming (P1 Blocker)

**Owner:** Frontend Lead  
**Goal:** ChatPanel uses SSE, no "dumb" nudge gate  
**Files:** `/components/chat/ChatPanel.tsx`

### Standup Template

```
✅ COMPLETED:
- [ ] Old nudge gate (lines 264–288) removed
- [ ] SSE fetch implemented (Accept: text/event-stream)
- [ ] Event parser works (metadata, patch, stream)
- [ ] Live message updates (streaming UI)
- [ ] Inline toast system implemented

🚧 IN PROGRESS:
- [ ] (none yet)

❌ BLOCKED:
- [ ] (if server not streaming)

📊 METRICS:
- Message streaming latency: ___ ms
- Tests passing: ___ / ___
- TypeScript errors: ___
```

### Acceptance Test (Manual)

```
1. npm run dev
2. Open http://localhost:3000/wizard
3. Send chat: "Ik wil een grote woonkamer"
4. Verify:
   ✅ Message appears immediately
   ✅ Response streams (not instant)
   ✅ No "Vul basis in!" blocking
   ✅ Toast appears for verification
```

**Expected:** No TypeScript errors, smooth streaming UX

---

## 🗓️ THU 6 NOV — Client Policy & State (P1 Blocker)

**Owner:** Frontend Lead  
**Goal:** Policy tree + conflict detection + retries  
**Files:** `/components/chat/ChatPanel.tsx`

### Standup Template

```
✅ COMPLETED:
- [ ] Policy routing (all 4 types)
- [ ] APPLY_OPTIMISTIC works
- [ ] APPLY_WITH_INLINE_VERIFY shows toast
- [ ] ASK_CLARIFY shows nudge
- [ ] Conflict detection implemented
- [ ] Retry logic (max 3, exponential backoff)
- [ ] rollbackPatch() works

🚧 IN PROGRESS:
- [ ] (none yet)

❌ BLOCKED:
- [ ] (if server versioning issues)

📊 METRICS:
- Conflict detection success rate: ___ %
- Retry success rate: ___ %
- Tests passing: ___ / ___
```

### Acceptance Test (Integration)

```bash
# Test conflict handling
npm run test ChatPanel.test.ts -t "conflict"

# Expected: All conflict tests pass
# Expected: Retry happens, no data loss
```

---

## 🗓️ FRI 7 NOV — Smart Export (P3)

**Owner:** Backend Lead  
**Goal:** Export uses Pro-model (not mini-model)  
**Files:** `/lib/ai/ProModel.ts`, `/lib/export/print.ts`

### Standup Template

```
✅ COMPLETED:
- [ ] ProModel.synthesizePvE() implemented
- [ ] Export uses Pro-model
- [ ] Basis-PvE shows synthesis
- [ ] Premium-PvE includes RAG context
- [ ] PDF generated without errors

🚧 IN PROGRESS:
- [ ] (none yet)

❌ BLOCKED:
- [ ] (if LLM API not ready)

📊 METRICS:
- Export success rate: ___ %
- PDF generation time: ___ ms
- Tests passing: ___ / ___
```

### Acceptance Test (Manual)

```
1. Fill in wizard
2. Go to Preview step
3. Click "Download PvE"
4. Verify:
   ✅ PDF generated
   ✅ PDF contains synthesis (not "mini-model" generic)
   ✅ Consistency with chat responses
```

---

## 🗓️ MON 10 NOV — Kennisbank Taxonomy (P4)

**Owner:** Backend Lead  
**Goal:** RAG taxonomy + multi-dimensional tagging  
**Files:** `/lib/rag/taxonomy.ts`, `/lib/rag/Kennisbank.ts`

### Standup Template

```
✅ COMPLETED:
- [ ] Taxonomy defined (chapter_tags, topic_tags)
- [ ] RAGNugget interface created
- [ ] Kennisbank.query() filters correctly
- [ ] Multi-dimensional tagging works
- [ ] Topic detection works

🚧 IN PROGRESS:
- [ ] (none yet)

❌ BLOCKED:
- [ ] (if ABJZ.pdf not atomized)

📊 METRICS:
- Nuggets indexed: ___ / ___
- Query accuracy: ___ %
- Cache hit rate: ___ %
```

### Acceptance Test

```bash
npm run test Kennisbank.test.ts

# Expected: All taxonomy tests pass
# Expected: Multi-dimensional filtering works
```

---

## 🗓️ TUE 11 NOV — CI Health Gate (P4)

**Owner:** DevOps  
**Goal:** CI gate active, telemetry monitoring  
**Files:** `.github/workflows/health-check.yml`

### Standup Template

```
✅ COMPLETED:
- [ ] CI workflow created
- [ ] Type check in CI works
- [ ] Test suite in CI works
- [ ] Telemetry completeness check added
- [ ] No PRs blocked (intentionally)

🚧 IN PROGRESS:
- [ ] (none yet)

❌ BLOCKED:
- [ ] (none yet)

📊 METRICS:
- CI latency: ___ s
- Telemetry completeness: ___ %
- Workflow success rate: ___ %
```

### Acceptance Test

```bash
# Push a test commit
git push origin feature/test-ci

# Watch GitHub Actions
# Expected: All checks pass (type-check, test, telemetry)
```

---

## 🗓️ WED 12 NOV — Regression Tests (P4)

**Owner:** QA Lead  
**Goal:** E2E tests + amnesiac bug fix tests  
**Files:** `__tests__/e2e/chat-policy-tree.test.ts`, `__tests__/integration/amnesiac-fix.test.ts`

### Standup Template

```
✅ COMPLETED:
- [ ] E2E test suite created
- [ ] All policy scenarios tested
- [ ] Context-aware nudge tested
- [ ] Conflict handling tested
- [ ] "Amnesiac bug" explicitly tested
- [ ] No regressions found

🚧 IN PROGRESS:
- [ ] (none yet)

❌ BLOCKED:
- [ ] (none yet)

📊 METRICS:
- Test coverage: ___ %
- Tests passing: ___ / ___
- Regressions found: ___
```

### Acceptance Test

```bash
npm run test --coverage

# Expected: Coverage > 80%
# Expected: All tests pass
# Expected: "Amnesiac bug fix" tests pass
```

---

## 🗓️ THU 13 NOV — Performance Optimization (P4)

**Owner:** Backend + Frontend  
**Goal:** Latency < 200ms (first token), < 2s (full response)  
**Files:** `/app/api/chat/route.ts`, `/lib/rag/Kennisbank.ts`

### Standup Template

```
✅ COMPLETED:
- [ ] Performance metrics tracked
- [ ] Latency benchmarks run
- [ ] RAG cache implemented
- [ ] Bundle size acceptable
- [ ] Load test passed (100 concurrent)

🚧 IN PROGRESS:
- [ ] (optimization iterations)

❌ BLOCKED:
- [ ] (if latency target not met)

📊 METRICS:
- First-token latency p95: ___ ms (target: <200)
- Full response latency p95: ___ ms (target: <2000)
- Bundle size: ___ KB (target: <50)
- Cache hit rate: ___ % (target: >70)
- Load test success: ___ %
```

### Acceptance Test

```bash
npm run bench

# Expected: First-token < 200ms p95
# Expected: Full response < 2s p95
# Expected: Bundle < 50KB
```

---

## 🗓️ FRI 14 NOV — Release v1.0 (Final Sign-off)

**Owner:** All  
**Goal:** RC v1.0 tagged, deployed to staging, all tests pass  

### Standup Template

```
✅ COMPLETED:
- [ ] Code quality checks pass (type-check, lint, test)
- [ ] Build succeeds
- [ ] Documentation complete
- [ ] Release tagged (v1.0.0)
- [ ] Deployed to staging
- [ ] Smoke tests pass

🚧 IN PROGRESS:
- [ ] (none)

❌ BLOCKED:
- [ ] (if smoke tests fail)

📊 METRICS:
- Type-check errors: 0
- Lint warnings: 0
- Test coverage: ___ %
- Build time: ___ s
```

### Final Checklist (Copy-paste)

```
SIGN-OFF FOR v1.0.0
Date: 14 November 2025

✅ All 10 days completed with green DoD
✅ Zero regressions
✅ First-token latency < 200ms
✅ All policies correctly applied
✅ "Amnesiac nudge" bug fixed
✅ Pro-model used for chat + export
✅ CI health gate active
✅ Regression tests pass
✅ Documentation complete
✅ Tagged and deployed

APPROVED BY:
Backend Lead: __________________ Date: ______
Frontend Lead: _________________ Date: ______
Product Owner: ________________ Date: ______
```

---

## 🚀 QUICK GIT COMMANDS

```bash
# Start a feature
git checkout -b feature/my-feature origin/main

# Commit
git add .
git commit -m "feat: description (task name)"

# Push
git push origin feature/my-feature

# Create PR
# (Use GitHub web UI)

# After approval, merge to main
git checkout main
git pull origin main
git merge feature/my-feature
git push origin main

# Tag release (on Friday)
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

---

## 📞 ESCALATION CHECKLIST

If you're blocked, check this list:

- [ ] Is the spec document clear? → Reference `/outputs/BRIKX_BUILD_PROTOCOL_v2.0_TECHNICAL_SPEC.md`
- [ ] Is the test passing locally? → `npm run test`
- [ ] Is there a TypeScript error? → `npm run type-check`
- [ ] Did the dependency install? → `npm install --exact [package]`
- [ ] Is the server running? → `npm run dev`
- [ ] Is the API endpoint responding? → `curl http://localhost:3000/api/chat`

If still blocked → **Async message in Slack with:**
1. What you're trying to do
2. What happened
3. Error message (or log output)
4. What you've already tried

---

**Print this card and keep it at your desk!** 🖨️

