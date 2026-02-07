// /lib/sse/client.ts
// SSE client-side stream parser shared by chat + auto-turn

"use client";

import type { ChatSSEEventName } from "@/types/chat";

type SSEMalformedBlock = {
  eventName: string | null;
  dataRaw: string;
  block: string;
};

export async function processSSEStream(
  response: Response,
  onEvent: (event: ChatSSEEventName, dataRaw: string) => void,
  onMalformed?: (info: SSEMalformedBlock) => void
): Promise<void> {
  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let sseBuffer = "";

  const processSSEChunk = (chunk: string) => {
    sseBuffer += chunk;

    const blocks = sseBuffer.split("\n\n");
    sseBuffer = blocks.pop() || "";

    for (const block of blocks) {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) continue;

      const lines = trimmedBlock.split("\n");
      const eventLine = lines.find((l) => l.startsWith("event:"));
      const dataLines = lines.filter((l) => l.startsWith("data:"));

      const eventName = eventLine
        ? (eventLine.replace("event:", "").trim() as ChatSSEEventName)
        : null;

      const dataRaw = dataLines
        .map((l) => l.replace("data:", "").trim())
        .join("");

      if (!eventName || !dataRaw) {
        onMalformed?.({ eventName, dataRaw, block });
        continue;
      }

      onEvent(eventName, dataRaw);
    }
  };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const text = decoder.decode(value, { stream: true });
    if (text) processSSEChunk(text);
  }
}
