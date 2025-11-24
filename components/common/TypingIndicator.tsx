// components/common/TypingIndicator.tsx
// ✅ v3.13: Animated typing indicator for chat/AI responses

"use client";

import React from "react";

interface TypingIndicatorProps {
  /** Name shown before "is aan het typen" */
  name?: string;
  /** Custom className for the container */
  className?: string;
}

/**
 * Animated typing indicator with bouncing dots
 * Shows "Jules is aan het typen" with animated ellipsis
 */
export default function TypingIndicator({
  name = "Jules",
  className = "",
}: TypingIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Avatar bubble */}
      <div className="w-8 h-8 rounded-full bg-[#40C0C0] flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold">
          {name.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Typing bubble */}
      <div className="bg-slate-100 rounded-2xl px-4 py-3 flex items-center gap-1">
        <span className="text-sm text-slate-600">{name} is aan het typen</span>

        {/* Animated dots */}
        <div className="flex items-center gap-0.5 ml-1">
          <span
            className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms", animationDuration: "600ms" }}
          />
          <span
            className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms", animationDuration: "600ms" }}
          />
          <span
            className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms", animationDuration: "600ms" }}
          />
        </div>
      </div>
    </div>
  );
}
