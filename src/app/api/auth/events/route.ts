import { requireAuth } from '@/server/lib/auth-guard';
import {
  subscribeAuthEvents,
  type AuthEventPayload,
} from '@/server/lib/auth-events';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HEARTBEAT_MS = 25_000;

function encodeSse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = user.id;
  let cleanup: (() => void) | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(encodeSse(event, data)));
        } catch {
          /* stream already closed */
        }
      };

      const shutdown = () => {
        if (heartbeat) {
          clearInterval(heartbeat);
          heartbeat = undefined;
        }
        cleanup?.();
        cleanup = undefined;
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      send('connected', { userId, at: Date.now() });

      const onEvent = (payload: AuthEventPayload) => {
        send(payload.type, payload);
      };

      cleanup = subscribeAuthEvents(userId, onEvent);

      heartbeat = setInterval(() => {
        send('heartbeat', { at: Date.now() });
      }, HEARTBEAT_MS);

      request.signal.addEventListener('abort', shutdown);
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
