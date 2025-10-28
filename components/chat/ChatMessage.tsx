"use client";

import { memo } from "react";

export type ChatRole = "user" | "assistant";

export interface ChatMessageItem {
  id: string;
  role: ChatRole;
  content: string;
  // optioneel: snelle acties onder een bericht
  actions?: Array<{ label: string; onClick: () => void }>;
}

type Props = {
  item: ChatMessageItem;
};

function ChatMessageBase({ item }: Props) {
  const isUser = item.role === "user";

  // Bubble styles – subtiele kaartlook, geen heftige kleuren
  const bubble =
    "rounded-2xl px-4 py-3 shadow-[0_1px_0_rgba(0,0,0,0.05)] ring-1 ring-black/5 " +
    "bg-white/90 backdrop-blur-[1px]";
  const bubbleAssistant =
    "bg-[rgba(13,61,77,0.04)] ring-[#0d3d4d]/10"; // zachte teal hint
  const bubbleUser = "bg-white ring-black/10";

  return (
    <div
      className={`w-full flex ${isUser ? "justify-end" : "justify-start"} my-2`}
    >
      <div
        className={`max-w-[85%] md:max-w-[70%] ${bubble} ${
          isUser ? bubbleUser : bubbleAssistant
        }`}
      >
        <div
          className={`text-[15px] leading-relaxed ${
            isUser ? "text-gray-800" : "text-gray-900"
          }`}
        >
          {item.content}
        </div>

        {/* Actions / suggesties */}
        {item.actions && item.actions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {item.actions.map((a, i) => (
              <button
                key={i}
                onClick={a.onClick}
                className="text-xs md:text-[13px] px-2.5 py-1.5 rounded-full bg-white
                           ring-1 ring-black/10 hover:bg-gray-50 active:scale-[0.99] transition"
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ChatMessageBase);
