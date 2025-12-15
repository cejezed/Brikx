"use client";

import React, { useEffect, useRef } from "react";
import { useChatStore } from "@/lib/stores/useChatStore";
import ChatMessage from "@/components/chat/ChatMessage";
import TypingIndicator from "@/components/common/TypingIndicator";

type MsgRole = "user" | "assistant";

type Props = {
  className?: string;
};

export default function ChatFeed({ className }: Props) {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const error = useChatStore((s) => s.error);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isStreaming]);

  return (
    <div
      ref={containerRef}
      className={[
        "w-full h-full overflow-y-auto custom-scrollbar space-y-5 px-3 py-4 bg-white/70 dark:bg-slate-900/60 rounded-2xl border border-white/50 shadow-sm dark:border-white/10",
        className || "",
      ].join(" ")}
    >
      {messages
        .filter((m) => m.role !== "system")
        .map((m) => (
          <ChatMessage
            key={m.id}
            msg={{
              id: m.id,
              role: m.role as MsgRole,
              text: m.content,
            }}
          />
        ))}

      {isStreaming && (
        <div className="flex flex-col items-start animate-in fade-in">
          <TypingIndicator name="Jules" className="mt-2" />
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-700">
          <strong>Fout:</strong> {error}
        </div>
      )}
    </div>
  );
}
