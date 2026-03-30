import { NextResponse } from "next/server";

// SSE clients registry
const clients = new Set<ReadableStreamDefaultController>();

export function notifyClients(event: { type: string; payload: unknown }) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const controller of clients) {
    try {
      controller.enqueue(new TextEncoder().encode(data));
    } catch {
      clients.delete(controller);
    }
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const companyId = url.searchParams.get("companyId");

  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);

      // Send initial ping
      controller.enqueue(
        new TextEncoder().encode(
          `data: ${JSON.stringify({ type: "ping", payload: { companyId } })}\n\n`
        )
      );

      // Heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ type: "ping", payload: {} })}\n\n`
            )
          );
        } catch {
          clearInterval(heartbeat);
          clients.delete(controller);
        }
      }, 30000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        clients.delete(controller);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
