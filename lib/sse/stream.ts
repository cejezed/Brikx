// /lib/sse/stream.ts

export interface SSEWriter {
  writeEvent(event: string, data: any): void;
  writeError(message: string): void;
  close(): void;
}

export function createSSEStream(): {
  stream: ReadableStream<Uint8Array>;
  writer: SSEWriter;
} {
  let controller: ReadableStreamDefaultController<Uint8Array> | null = null;
  const encoder = new TextEncoder();

  console.log('[stream.ts] Creating ReadableStream');

  const stream = new ReadableStream<Uint8Array>({
    start(ctrl) {
      console.log('[stream.ts] ReadableStream start() called, controller initialized');
      controller = ctrl;
    },
    cancel(reason) {
      console.log('[stream.ts] ReadableStream cancelled:', reason);
    },
  });

  const writer: SSEWriter = {
    writeEvent(event, data) {
      console.log('[stream.ts] writeEvent called:', event);
      
      if (!controller) {
        console.error('[stream.ts] ERROR: controller is null!');
        return;
      }

      const eventLine = `event: ${event}\n`;
      const dataLine = `data: ${JSON.stringify(data)}\n\n`;
      const fullMessage = eventLine + dataLine;
      
      console.log('[stream.ts] Enqueuing:', fullMessage.substring(0, 100));
      controller.enqueue(encoder.encode(fullMessage));
    },
    writeError(message) {
      console.log('[stream.ts] writeError called');
      this.writeEvent("error", { message });
    },
    close() {
      console.log('[stream.ts] close() called');
      if (controller) {
        controller.close();
      } else {
        console.error('[stream.ts] ERROR: Cannot close, controller is null!');
      }
    },
  };

  return { stream, writer };
}