"use client";

import React, { useState } from "react";
import { Lightbulb, X } from "lucide-react";
import { useIsPremium } from "@/lib/stores/useAccountStore";
import ExpertCorner from "@/components/expert/ExpertCorner";

export default function MobileExpertIndicator({ className }: { className?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const isPremium = useIsPremium();
    const expertMode = isPremium ? "PREMIUM" : "PREVIEW";

    // TODO: Add logic to detect when there's a relevant tip
    const hasRelevantTip = true;

    const defaultButtonClass = `xl:hidden fixed top-4 left-4 z-[60] p-2.5 rounded-full shadow-md transition-all border ${hasRelevantTip
            ? "bg-amber-400 text-amber-900 border-amber-500 animate-pulse"
            : "bg-white/90 backdrop-blur-sm text-slate-700 border-slate-200"
        }`;

    return (
        <>
            {/* Floating Expert Icon */}
            <button
                onClick={() => setIsOpen(true)}
                className={className || defaultButtonClass}
                aria-label="Expert tips"
            >
                <Lightbulb size={24} />
            </button>

            {/* Expert Corner Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-sm flex items-end xl:hidden">
                    <div className="bg-white w-full max-h-[80vh] rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <Lightbulb size={20} className="text-amber-500" />
                                <h2 className="font-semibold text-slate-900">Expert Tips</h2>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X size={24} />
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
