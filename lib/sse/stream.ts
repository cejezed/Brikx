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
  let controller: ReadableStreamDefaultController<Uint8Array>;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(ctrl) {
      controller = ctrl;
    },
  });

  const writer: SSEWriter = {
    writeEvent(event, data) {
      const eventLine = `event: ${event}\n`;
      const dataLine = `data: ${JSON.stringify(data)}\n\n`;
      controller.enqueue(encoder.encode(eventLine + dataLine));
    },
    writeError(message) {
      this.writeEvent("error", { message });
    },
    close() {
      controller.close();
    },
  };

  return { stream, writer };
}
