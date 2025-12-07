"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Send, XCircle, Lightbulb, Save } from "lucide-react";
import { useChatStore } from "@/lib/stores/useChatStore";
import { useWizardState } from "@/lib/stores/useWizardState";
import { useIsPremium } from "@/lib/stores/useAccountStore";
import ExpertCorner from "@/components/expert/ExpertCorner";
import ChatMessage from "@/components/chat/ChatMessage";
import TypingIndicator from "@/components/common/TypingIndicator";
import { useSaveProject } from "@/lib/hooks/useSaveProject";

type MsgRole = "user" | "assistant";

export default function MobileChatInput() {
    const mode = useWizardState((s) => s.mode);
    const sendMessage = useChatStore((s) => s.sendMessage);
    const isStreaming = useChatStore((s) => s.isStreaming);
    const abortController = useChatStore((s) => s.abortController);
    const messages = useChatStore((s) => s.messages);
    const isPremium = useIsPremium();
    const expertMode = isPremium ? "PREMIUM" : "PREVIEW";

    const [input, setInput] = useState("");
    const [showExpert, setShowExpert] = useState(false);
    const [showResponses, setShowResponses] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // TODO: Add logic to detect when there's a relevant tip
    const hasRelevantTip = true;

    // Get last 3 messages for quick view
    const recentMessages = messages
        .filter((m) => m.role !== "system")
        .slice(-3);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (showResponses && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, showResponses]);

    // Auto-show responses when there are messages
    useEffect(() => {
        if (messages.length > 0 && !showResponses) {
            setShowResponses(true);
        }
    }, [messages, showResponses]);

    const handleSend = useCallback(() => {
        const q = input.trim();
        if (!q || isStreaming) return;
        sendMessage(q, mode);
        setInput("");
        setShowResponses(true);
    }, [input, isStreaming, sendMessage, mode]);

    const handleAbort = useCallback(() => {
        if (abortController) {
            abortController.abort();
        }
    }, [abortController]);

    const { handleSave, isSaving } = useSaveProject();

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };


    return (
        <>
            {/* Chat Responses Area - Collapsible */}
            {showResponses && recentMessages.length > 0 && (
                <div className="xl:hidden flex-shrink-0 border-t border-slate-200 bg-slate-50 max-h-[20vh] overflow-y-auto">
                    <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-600">Chat Responses</span>
                            <button
                                onClick={() => setShowResponses(false)}
                                className="text-xs text-slate-500 hover:text-slate-700"
                            >
                                Verberg
                            </button>
                        </div>
                        {recentMessages.map((m) => (
                            <ChatMessage
                                key={m.id}
                                msg={{
                                    id: m.id,
                                    role: m.role as MsgRole,
                                    text: m.content,
                                }}
                            />
                        ))}
                        {isStreaming && <TypingIndicator name="Jules" className="mt-2" />}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            )}

            {/* Chat Input Bar */}
            <div className="xl:hidden flex-shrink-0 border-t-2 border-slate-200 bg-white p-2 pb-0">
                <div className="flex items-end gap-2">
                    {/* Expert Button */}
                    <button
                        onClick={() => setShowExpert(true)}
                        className={`flex-shrink-0 p-2.5 rounded-full transition-all ${hasRelevantTip
                            ? "bg-amber-400 text-amber-900 animate-pulse"
                            : "bg-slate-100 text-slate-600"
                            }`}
                        aria-label="Expert tips"
                    >
                        <Lightbulb size={20} />
                    </button>

                    {/* Chat Input */}
                    <div className="flex-1 flex items-end gap-2 bg-slate-100 rounded-2xl px-3 py-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Stel een vraag..."
                            disabled={isStreaming}
                            rows={1}
                            className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm max-h-24 resize-none text-slate-800 placeholder:text-slate-400"
                            style={{ minHeight: "20px" }}
                        />
                        {isStreaming ? (
                            <button
                                onClick={handleAbort}
                                className="text-slate-400 hover:text-red-500 transition-colors pb-0.5"
                            >
                                <XCircle size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim()}
                                className={`pb-0.5 transition-colors ${input.trim() ? "text-blue-600" : "text-slate-300"
                                    }`}
                            >
                                <Send size={20} />
                            </button>
                        )}
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-shrink-0 p-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                        aria-label="Opslaan"
                    >
                        {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                    </button>
                </div>
            </div>

            {/* Expert Corner Modal */}
            {showExpert && (
                <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-sm flex items-end xl:hidden">
                    <div className="bg-white w-full max-h-[80vh] rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <Lightbulb size={20} className="text-amber-500" />
                                <h2 className="font-semibold text-slate-900">Expert Tips</h2>
                            </div>
                            <button
                                onClick={() => setShowExpert(false)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <ExpertCorner mode={expertMode} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
