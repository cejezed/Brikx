# Build Rules v3.1 – AI Layer

Definitieve contracten voor de AI-pijplijn. Gebruik dit als bron voor regressies en reviews.

## OrchestrateTurn call-order (vast)
1) Memory load (ConversationMemory.load)  
1b) UI/context: FieldWatcher.detectFocus + FeedbackQueue.checkQueue  
2) Parallel analyzers (BehaviorAnalyzer, AnticipationEngine, SystemIntelligence) via Promise.allSettled  
3) TurnPlanner.decide  
4) ContextPruner.prune  
5) FallbackStrategy.runWithGuardAndRetry (ResponseOrchestrator.generate → AnswerGuard.validate → retry/approve/fallback)  
6) Persist turns (ConversationMemory.addTurn)

## TurnGoals & safety
- allowPatches=false ⇒ eindresultaat patches=[] (hard strip na guard-loop).  
- requiresConfirmation default true voor indirect patching (tenzij expliciet anders).  
- Formeel NL (u/uw), geen emoji’s.

## ChapterInitializer regels
- Budget: turnGoal = fill_data (anticipation kan vraaginhoud sturen, niet goal).  
- Basis: turnGoal = clarify.  
- Tone field aanwezig als metadata (default neutral); PromptBuilder/LLM bepaalt de echte tone-directives.  
- Conflict → surface_risks; critical anticipation → anticipate_and_guide, behalve budget (blijft fill_data).

## ProjectAnalysis completeness (gewichten som=100)
- basis 25, ruimtes 20, wensen 20, budget 20, techniek 15. (duurzaam/risico tellen in v3.1 niet mee)  
- Volledig ingevulde chapters → 100%. Alleen basis → ~25%. Gebruik required fields per chapter, niet “key count”.

## AnswerGuard verdict mapping (prod)
- llm_error ⇒ APPROVED.  
- parse_error ⇒ RETRY_REQUIRED (tot maxRetries), geen HARD_FAIL op retry-exhaustion.  
- Retry-exhaustion → fallback reply (usedFallback=true, patches=[]), guardVerdict blijft RETRY_REQUIRED.  
- HARD_FAIL alleen bij echte forbidden output/rules.  
- (Confidence wordt bepaald in ResponseOrchestrator; AnswerGuard past confidence niet aan.)

## ConversationMemory query-chain (mock contract)
- select('*') → eq('user_id', …) → eq('project_id', …) → order('created_at', { ascending: false }) → limit(n).  
- getRelevantContext voegt ilike('message', `%query%`) vóór order/limit toe.  
- HeeftLongHistory wanneer length ≥ maxTurns.

## ContextPruner
- Optional maxTokens override toegestaan; default limit 4000, reserve 500.  
- Caps: history max 3, conflicts max 2, anticipation max 1; tokenEstimator heuristiek 4 chars ≈ 1 token (fixture guarantee: <500 geschatte tokens in tests).

## ResponseOrchestrator essentials
- tokensUsed komt uit LLM usage (mock: 237).  
- Invalid JSON/schema ⇒ status=parse_error (geen fallback success).  
- Confidence per goal; surface_risks 0.95–0.96 (conflicts liften confidence >=0.96 bij allowPatches=false).

## Commit hygiene (aanbevolen)
- Eén stabilisatiecommit: “fix(ai): stabilize v3.1 guardrails + align tests”.
