// /app/api/chat/logic.ts
import { randomUUID } from "node:crypto";
import { ProModel } from "@/lib/ai/ProModel";
import { ConversationEngine } from "@/lib/ai/ConversationEngine";
import { Kennisbank } from "@/lib/rag/Kennisbank";
import { type SSEWriter } from "@/lib/sse/stream";
import { logEvent } from "@/lib/logging/logEvent";
import { computeMissingFields, type MissingItem } from "@/lib/ai/missing";
import { classifyMissing } from "@/lib/ai/essentials";
import { transformWithDelta, normalizePatchEvent } from "@/lib/utils/patch";
import { validateChapter } from "@/lib/wizard/CHAPTER_SCHEMAS";
import { getToolHelp, getOnboardingMessage } from "@/lib/ai/toolHelp";
import { detectMetaTooling } from "@/lib/ai/metaDetection";
import { ChapterInitializer } from "@/lib/ai/ChapterInitializer";
import {
    runAnswerGuard,
    buildClarificationPrompt,
    buildRelevancePrompt,
    type AnswerGuardInput,
} from "@/lib/ai/AnswerGuard";

import type { ChatRequest } from "@/types/chat";
import type {
    WizardState,
    ChapterKey,
    PatchEvent,
} from "@/types/project";

export type ServerWizardState = WizardState & {
    mode?: "PREVIEW" | "PREMIUM";
    triage?: any;
};

export async function runAITriage(
    writer: SSEWriter,
    ctx: {
        requestId: string;
        startTime: number;
        query: string;
        mode: "PREVIEW" | "PREMIUM";
        wizardState: ServerWizardState;
        clientFastIntent?: ChatRequest["clientFastIntent"];
        history?: ChatRequest["history"];
        previousChapter?: ChapterKey | null;
    }
) {
    const { requestId, startTime, query, mode, history } = ctx;

    console.log("[runAITriage] query:", query);

    // 1) Normaliseer state
    const normalized = normalizeWizardState(ctx.wizardState);
    const initialActive = getActiveChapter(normalized);
    const initialFlow = getChapterFlow(normalized);

    // 2) Verrijk state
    const wizardState: ServerWizardState = {
        ...normalized,
        currentChapter: initialActive ?? normalized.currentChapter,
        chapterFlow: initialFlow,
    };

    const activeChapter = getActiveChapter(wizardState);
    const chapterFlow = getChapterFlow(wizardState);
    const previousChapter = ctx.previousChapter ?? null;

    // ✅ v2.0: Init/Update session
    const session = ConversationEngine.getInitialSession(wizardState);
    session.turnCount += 1;
    wizardState.chatSession = session;

    console.log(`[runAITriage] Turn ${session.turnCount}, PIM NorthStar: ${session.pim?.northStar || 'none'}`);

    try {
        // Chapter transition guard: trigger ChapterInitializer once, skip normal flow
        if (previousChapter && previousChapter !== activeChapter) {
            const initializer = new ChapterInitializer();
            const initResponse = initializer.handleChapterStart(
                activeChapter || "basis",
                wizardState,
                history as any[] || []
            );

            writer.writeEvent("metadata", {
                intent: "CHAPTER_OPENING",
                confidence: 1.0,
                policy: "APPLY_OPTIMISTIC",
                stateVersion: wizardState.stateVersion ?? 0,
                activeChapter,
            });
            writer.writeEvent("stream", { text: initResponse.message });
            writer.writeEvent("done", {
                logId: requestId,
                tokensUsed: 0,
                latencyMs: Date.now() - startTime,
            });
            return;
        }

        if (detectMetaTooling(query)) {
            // @protected CHAT_F02_META_TOOLING
            console.log("[runAITriage] META_TOOLING detected → fixed response");
            // @protected CHAT_F10_QUICK_REPLIES
            const helpResponse = getToolHelp(query, {
                currentChapter: activeChapter || "basis",
            });

            await logEvent("triage.meta_tooling", {
                requestId,
                query,
                activeChapter,
            });

            writer.writeEvent("metadata", {
                intent: "META_TOOLING",
                confidence: 0.95,
                policy: "APPLY_OPTIMISTIC",
                stateVersion: wizardState.stateVersion ?? 0,
                activeChapter,
            });

            writer.writeEvent("stream", { text: helpResponse.answer });

            if (helpResponse.quickReplies && helpResponse.quickReplies.length > 0) {
                writer.writeEvent("suggestions", {
                    suggestions: helpResponse.quickReplies,
                });
            }

            writer.writeEvent("done", {
                logId: requestId,
                tokensUsed: 0,
                latencyMs: Date.now() - startTime,
            });

            return;
        }

        const userMessages = history?.filter((m) => m.role === "user") ?? [];
        if (userMessages.length === 0) {
            // @protected CHAT_F03_ONBOARDING
            console.log("[runAITriage] ONBOARDING detected → welcome message");
            const onboardingResponse = getOnboardingMessage(
                activeChapter || "basis"
            );

            await logEvent("triage.onboarding", {
                requestId,
                activeChapter,
            });

            writer.writeEvent("metadata", {
                intent: "ONBOARDING",
                confidence: 1.0,
                policy: "APPLY_OPTIMISTIC",
                stateVersion: wizardState.stateVersion ?? 0,
                activeChapter,
            });

            writer.writeEvent("stream", { text: onboardingResponse.answer });

            if (onboardingResponse.quickReplies && onboardingResponse.quickReplies.length > 0) {
                writer.writeEvent("suggestions", {
                    suggestions: onboardingResponse.quickReplies,
                });
            }

            writer.writeEvent("done", {
                logId: requestId,
                tokensUsed: 0,
                latencyMs: Date.now() - startTime,
            });

            return;
        }

        console.log("[runAITriage] Checking essentials (graduated)...");
        const missingItems = computeMissingFields(wizardState);
        const { critical, strong, hasCritical, hasStrong } =
            classifyMissing(missingItems);

        if (hasCritical) {
            console.log(
                "[runAITriage] HARD BLOCK: Critical essentials missing:",
                critical.map((c) => c.fieldId)
            );

            const firstCritical = critical[0];
            const nudge = makeContextAwareNudge(
                query,
                [firstCritical]
            );

            await logEvent("triage.nudge", {
                requestId,
                severity: "CRITICAL",
                missing: critical.map((m) => m.fieldId),
                query,
                activeChapter,
            });

            writer.writeEvent("metadata", {
                intent: "NUDGE",
                confidence: 1.0,
                policy: "ASK_CLARIFY",
                nudge,
                stateVersion: wizardState.stateVersion ?? 0,
                activeChapter,
            });

            writer.writeEvent("stream", { text: nudge });
            writer.writeEvent("done", {
                logId: requestId,
                tokensUsed: 0,
                latencyMs: Date.now() - startTime,
            });

            return;
        }

        if (hasStrong) {
            console.log(
                "[runAITriage] Soft prompt: STRONG essentials missing:",
                strong.map((s) => s.fieldId)
            );
        }

        console.log("[runAITriage] Classifying intent & watching plan...");

        // PlanWatcher check
        const { nextPIM, verdict } = ConversationEngine.planWatcher(session.pim!, wizardState, query);
        session.pim = nextPIM;

        const classifyResult = await ProModel.classify(
            query,
            wizardState
        );
        const { intent, confidence } = classifyResult;

        // Mode logic: Default FAST, but trigger FULL if CONFLICT/DRIFT
        const isTriggeredFull = verdict !== 'CONSISTENT' || !!ctx.clientFastIntent;
        const mode_v2 = isTriggeredFull ? "FULL" : "FAST";

        console.log(`[runAITriage] Mode: ${mode_v2}, Verdict: ${verdict}, Intent: ${intent}`);

        const policy = determinePolicy(confidence, intent);

        await logEvent("triage.classify", {
            requestId,
            intent,
            confidence,
            policy,
            activeChapter,
            verdict,
            mode: mode_v2
        });

        writer.writeEvent("metadata", {
            intent,
            confidence,
            policy,
            stateVersion: wizardState.stateVersion ?? 0,
            activeChapter,
        });

        let responseText = "";
        const patchesApplied: PatchEvent[] = [];

        if (intent === "VULLEN_DATA") {
            console.log("[runAITriage] VULLEN_DATA → generatePatches");

            const llmResult = await ProModel.generatePatch(
                query,
                wizardState,
                history
            );

            if (llmResult.pimUpdate) {
                session.pim = { ...session.pim!, ...llmResult.pimUpdate };
                console.log("[runAITriage] PIM Updated from LLM");
            }

            if (llmResult.newObligation) {
                const newOb = ConversationEngine.createObligation(
                    llmResult.newObligation.topic,
                    llmResult.newObligation.reason,
                    session.turnCount
                );
                session.obligations = [...(session.obligations || []), newOb];
                console.log(`[runAITriage] New Obligation created: ${newOb.topic}`);
            }

            if (llmResult.addressedObligationId) {
                session.obligations = session.obligations?.map(o =>
                    o.id === llmResult.addressedObligationId ? { ...o, status: 'addressed' } : o
                );
                console.log(`[runAITriage] Obligation addressed: ${llmResult.addressedObligationId}`);
            }

            const allowPatchesByVerdict = verdict === 'CONSISTENT';
            if (!allowPatchesByVerdict) {
                console.log("[runAITriage] Patches BLOCKED due to DRIFT/CONFLICT verdict");
            }

            responseText = llmResult.followUpQuestion || "";

            if (llmResult.action === "reset") {
                console.log("[runAITriage] RESET action detected - sending reset event");
                writer.writeEvent("reset", {});
            }

            if (llmResult.action === "undo") {
                console.log("[runAITriage] UNDO action detected - sending undo event");
                writer.writeEvent("undo", {});
            }

            const patches = allowPatchesByVerdict ? (llmResult.patches ?? []) : [];
            console.log(`[runAITriage] Processing ${patches.length} patches from AI`);

            for (const rawPatch of patches) {
                const patch = normalizePatchEvent(rawPatch as PatchEvent);
                const targetChapter = patch.chapter;

                if (
                    patch.delta.operation === "append" &&
                    (targetChapter === "ruimtes" || targetChapter === "wensen" || targetChapter === "risico") &&
                    typeof patch.delta.value === "object" &&
                    patch.delta.value !== null &&
                    !Array.isArray(patch.delta.value)
                ) {
                    const val = patch.delta.value as { id?: string };
                    if (!val.id) {
                        val.id = randomUUID();
                        console.log(`[runAITriage] Injected new UUID for ${targetChapter}`);
                    }
                }

                console.log(`[runAITriage] Processing patch for ${targetChapter}`);

                if (!isAllowedChapter(targetChapter, wizardState)) {
                    console.warn(
                        `[runAITriage] Patch rejected: chapter ${targetChapter} not in flow`
                    );
                    responseText = `Ik kan het deel **${labelForChapter(targetChapter)}** nog niet toepassen, omdat dit niet in uw huidige traject zit.`;
                    break;
                }

                const prevData =
                    wizardState.chapterAnswers[targetChapter as ChapterKey] ?? {};
                const nextData = transformWithDelta(
                    prevData as any,
                    patch.delta
                );

                if (!validateChapter(targetChapter, nextData)) {
                    console.warn(
                        `[runAITriage] Patch validation FAILED for ${targetChapter}:`,
                        patch.delta
                    );

                    responseText =
                        "Ik kan dit nog niet verwerken omdat het geen geldige situatie oplevert. Kunt u dit wat concreter maken?";

                    await logEvent("triage.patch_rejected", {
                        requestId,
                        chapter: targetChapter,
                        delta: patch.delta,
                        reason: "validation_failed",
                    });

                    break;
                }

                wizardState.chapterAnswers[targetChapter as ChapterKey] = nextData as any;
                wizardState.stateVersion = (wizardState.stateVersion ?? 0) + 1;

                writer.writeEvent("patch", patch);
                patchesApplied.push(patch);

                console.log(
                    `[runAITriage] Patch applied: ${targetChapter} (state v${wizardState.stateVersion})`
                );

                await logEvent("triage.patch_applied", {
                    requestId,
                    chapter: targetChapter,
                    delta: patch.delta,
                });
            }

            if (patchesApplied.length > 0) {
                const lastChapter = patchesApplied[patchesApplied.length - 1]
                    .chapter;
                writer.writeEvent("navigate", { chapter: lastChapter });

                const lastPatch = patchesApplied[patchesApplied.length - 1];
                if (lastPatch.delta?.path) {
                    const focusKey = `${lastPatch.chapter}:${lastPatch.delta.path}`;
                    writer.writeEvent("expert_focus", { focusKey, query });
                    console.log(`[runAITriage] Expert focus sent: ${focusKey}`);
                }
            }
        } else if (intent === "ADVIES_VRAAG") {
            console.log("[runAITriage] ADVIES_VRAAG → RAG + AnswerGuard");
            const ragContext = await Kennisbank.query(query, {
                chapter: activeChapter ?? undefined,
                isPremium: mode === "PREMIUM",
            });

            const draftAnswer = await ProModel.generateResponse(
                query,
                ragContext,
                { mode, wizardState, history }
            );

            console.log("[runAITriage] Draft answer generated, running AnswerGuard...");

            const guardInput: AnswerGuardInput = {
                userQuery: query,
                intent,
                activeChapter,
                draftAnswer,
                ragMeta: {
                    topicId: ragContext.topicId,
                    docsFound: ragContext.docs?.length || 0,
                    cacheHit: ragContext.cacheHit,
                },
            };

            const guardResult = await runAnswerGuard(guardInput, callLLMForValidation);

            if (guardResult.verdict === "OK") {
                console.log("[runAITriage] AnswerGuard: OK - using draft");
                responseText = draftAnswer;
            } else if (guardResult.verdict === "NEEDS_CLARIFICATION") {
                console.log("[runAITriage] AnswerGuard: NEEDS_CLARIFICATION - generating clarification");

                await logEvent("answer_guard.needs_clarification", {
                    requestId,
                    query,
                    intent,
                    reasons: guardResult.reasons,
                });

                const clarificationPrompt = buildClarificationPrompt(
                    query,
                    guardResult.suggestions
                );

                responseText = await generateImprovedResponse(
                    query,
                    clarificationPrompt,
                    mode
                );
            } else if (guardResult.verdict === "IRRELEVANT") {
                console.log("[runAITriage] AnswerGuard: IRRELEVANT - generating focused answer");

                await logEvent("answer_guard.irrelevant", {
                    requestId,
                    query,
                    intent,
                    reasons: guardResult.reasons,
                });

                const relevancePrompt = buildRelevancePrompt(
                    query,
                    guardResult.suggestions
                );

                responseText = await generateImprovedResponse(
                    query,
                    relevancePrompt,
                    mode
                );
            }

            if (ragContext.topicId && ragContext.topicId !== "general") {
                const topicToChapter: Record<string, string> = {
                    natural_light: "duurzaam:daglichtAmbitie",
                    soundproofing: "duurzaam:akoestiekAmbitie",
                    thermal_comfort: "techniek:heatingAmbition",
                    budget_estimation: "budget:budgetTotaal",
                    permits_regulation: "basis:projectType",
                    materials: "duurzaam:materiaalstrategie",
                };
                const focusKey = topicToChapter[ragContext.topicId];
                if (focusKey) {
                    writer.writeEvent("expert_focus", { focusKey, query });
                    console.log(`[runAITriage] Expert focus from RAG topic: ${focusKey}`);
                }
            }
        } else if (intent === "NAVIGATIE") {
            console.log("[runAITriage] NAVIGATIE");
            const target = resolveNavigationTarget(
                query,
                wizardState,
                chapterFlow
            );

            if (target && isAllowedChapter(target, wizardState)) {
                writer.writeEvent("navigate", { chapter: target });
                responseText = `Prima, we gaan naar **${labelForChapter(
                    target
                )}**.`;
            } else if (target) {
                responseText =
                    "Dat hoofdstuk is in uw huidige traject niet beschikbaar.";
            } else {
                responseText =
                    "Ik kon niet goed bepalen naar welk onderdeel u wilt. Probeer: 'ga naar [hoofdstuk]'.";
            }
        } else {
            console.log("[runAITriage] SMALLTALK/FALLBACK → with AnswerGuard");

            const draftAnswer = await ProModel.generateResponse(
                query,
                null,
                { mode, wizardState, history }
            );

            console.log("[runAITriage] Draft answer generated, running AnswerGuard...");

            const guardInput: AnswerGuardInput = {
                userQuery: query,
                intent,
                activeChapter,
                draftAnswer,
            };

            const guardResult = await runAnswerGuard(guardInput, callLLMForValidation);

            if (guardResult.verdict === "OK") {
                console.log("[runAITriage] AnswerGuard: OK - using draft");
                responseText = draftAnswer;
            } else if (guardResult.verdict === "NEEDS_CLARIFICATION") {
                console.log("[runAITriage] AnswerGuard: NEEDS_CLARIFICATION - generating clarification");

                await logEvent("answer_guard.needs_clarification", {
                    requestId,
                    query,
                    intent,
                    reasons: guardResult.reasons,
                });

                const clarificationPrompt = buildClarificationPrompt(
                    query,
                    guardResult.suggestions
                );

                responseText = await generateImprovedResponse(
                    query,
                    clarificationPrompt,
                    mode
                );
            } else if (guardResult.verdict === "IRRELEVANT") {
                console.log("[runAITriage] AnswerGuard: IRRELEVANT - generating focused answer");

                await logEvent("answer_guard.irrelevant", {
                    requestId,
                    query,
                    intent,
                    reasons: guardResult.reasons,
                });

                const relevancePrompt = buildRelevancePrompt(
                    query,
                    guardResult.suggestions
                );

                responseText = await generateImprovedResponse(
                    query,
                    relevancePrompt,
                    mode
                );
            }
        }

        if (responseText) {
            for (const chunk of chunkText(responseText)) {
                writer.writeEvent("stream", { text: chunk });
            }
        }

        writer.writeEvent("chat_session", session);

        writer.writeEvent("done", {
            logId: requestId,
            tokensUsed: classifyResult.tokensUsed ?? 0,
            latencyMs: Date.now() - startTime,
            mode: mode_v2,
            verdict,
        });
    } catch (error) {
        console.error("[runAITriage] CAUGHT ERROR:", error);
        await logEvent("triage.error", {
            requestId,
            error: String(error),
        });
        writer.writeEvent("error", {
            message:
                "Er ging iets mis bij het verwerken van uw vraag.",
        });
    } finally {
        console.log("[runAITriage] Closing stream");
        writer.close();
    }
}

// ┌──────────────────────────────────────────────────────────────
// │ HELPERS
// └──────────────────────────────────────────────────────────────

export function normalizeWizardState(state: ServerWizardState): ServerWizardState {
    return {
        stateVersion: state.stateVersion ?? 1,
        chapterAnswers: state.chapterAnswers ?? {},
        currentChapter: state.currentChapter,
        chapterFlow: Array.isArray(state.chapterFlow) ? state.chapterFlow : [],
        focusedField: state.focusedField,
        showExportModal: state.showExportModal,
        mode: state.mode,
        triage: state.triage,
    };
}

export function getChapterFlow(state: ServerWizardState): ChapterKey[] {
    return Array.isArray(state.chapterFlow) ? state.chapterFlow : [];
}

export function getActiveChapter(state: ServerWizardState): ChapterKey | null {
    if (state.currentChapter) return state.currentChapter;
    const flow = getChapterFlow(state);
    return flow.length > 0 ? flow[0] : null;
}

export function isAllowedChapter(target: ChapterKey, state: ServerWizardState): boolean {
    const flow = getChapterFlow(state);
    if (!flow || flow.length === 0) return true;
    return flow.includes(target);
}

export function labelForChapter(ch: ChapterKey): string {
    const labels: Record<string, string> = {
        basis: "Basis",
        wensen: "Wensen",
        ruimtes: "Ruimtes",
        budget: "Budget",
        techniek: "Techniek",
        duurzaam: "Duurzaamheid",
        risico: "Risico's",
    };
    return labels[ch] ?? ch;
}

export function chunkText(text: string, size = 48): string[] {
    const words = text.split(" ");
    const chunks: string[] = [];
    let buf: string[] = [];

    for (const w of words) {
        const next = (buf.join(" ") + " " + w).trim();
        if (next.length > size && buf.length) {
            chunks.push(buf.join(" ") + " ");
            buf = [w];
        } else {
            buf.push(w);
        }
    }

    if (buf.length) {
        chunks.push(buf.join(" ") + " ");
    }

    return chunks;
}

function makeContextAwareNudge(query: string, missingItems: MissingItem[]): string {
    const sorted = [...missingItems].sort((a, b) => {
        if (a.severity === b.severity) return 0;
        return a.severity === "required" ? -1 : 1;
    });

    const first = sorted[0];
    const pretty = first.label;

    return `Ik wil graag **"${query}"** voor u verwerken. Mag ik daarvoor eerst ${pretty} noteren? Dan kan ik u gerichter helpen.`;
}

function determinePolicy(confidence: number, intent: string): "APPLY_OPTIMISTIC" | "APPLY_WITH_INLINE_VERIFY" | "ASK_CLARIFY" | "CLASSIFY" {
    if (intent === "NAVIGATIE") {
        return confidence >= 0.7 ? "APPLY_OPTIMISTIC" : "ASK_CLARIFY";
    }
    if (intent === "ADVIES_VRAAG") {
        return confidence >= 0.7 ? "APPLY_WITH_INLINE_VERIFY" : "ASK_CLARIFY";
    }
    if (intent === "SMALLTALK") {
        return "CLASSIFY";
    }
    return confidence >= 0.9 ? "APPLY_WITH_INLINE_VERIFY" : "ASK_CLARIFY";
}

function resolveNavigationTarget(query: string, state: ServerWizardState, flow: ChapterKey[]): ChapterKey | null {
    const q = query.toLowerCase();
    const map: Record<string, ChapterKey> = {
        basis: "basis", start: "basis", introductie: "basis",
        wensen: "wensen", "wensen en eisen": "wensen",
        kamers: "ruimtes", ruimtes: "ruimtes", indeling: "ruimtes",
        budget: "budget", kosten: "budget",
        techniek: "techniek", installaties: "techniek",
        duurzaam: "duurzaam", duurzaamheid: "duurzaam",
        risico: "risico", "risico's": "risico",
        preview: "basis", samenvatting: "basis", export: "basis", pve: "basis",
    };

    for (const [key, chapter] of Object.entries(map)) {
        if (q.includes(key)) return chapter;
    }

    const active = getActiveChapter(state);
    if (!active || !flow || flow.length === 0) return null;

    const idx = flow.indexOf(active);
    if (idx === -1) return null;

    if (q.includes("volgende") || q.includes("next")) {
        return (flow[idx + 1] ?? flow[idx]) || null;
    }
    if (q.includes("vorige") || q.includes("terug") || q.includes("back")) {
        return (flow[idx - 1] ?? flow[idx]) || null;
    }

    return null;
}

async function callLLMForValidation(opts: { system: string; user: string }): Promise<string> {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "system", content: opts.system }, { role: "user", content: opts.user }],
                temperature: 0.0,
                response_format: { type: "json_object" },
                max_tokens: 500,
            }),
        });
        if (!response.ok) throw new Error(`LLM validation error: ${response.status}`);
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "{}";
    } catch (error) {
        console.error("[callLLMForValidation] Error:", error);
        return '{"verdict":"OK","reasons":[],"suggestions":[],"confidence":0.5}';
    }
}

async function generateImprovedResponse(query: string, improvedPrompt: string, mode: "PREVIEW" | "PREMIUM"): Promise<string> {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: mode === "PREMIUM" ? "gpt-4o" : "gpt-4o-mini",
                messages: [
                    { role: "system", content: `U bent Jules, de digitale bouwcoach van Brikx. U bent vriendelijk, behulpzaam en eerlijk. Spreek de gebruiker aan met "u".` },
                    { role: "user", content: improvedPrompt },
                ],
                temperature: 0.3,
                max_tokens: 300,
            }),
        });
        if (!response.ok) throw new Error(`LLM improved response error: ${response.status}`);
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "Kunt u uw vraag iets specifieker formuleren?";
    } catch (error) {
        console.error("[generateImprovedResponse] Error:", error);
        return "Kunt u uw vraag iets specifieker formuleren? Dan kan ik u beter helpen.";
    }
}
