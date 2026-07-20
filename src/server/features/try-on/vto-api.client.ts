import fs from 'fs/promises';
import { config } from '@/server/config';

interface VtoResult {
  imageUrl: string;
  source: 'vto-api' | 'fallback-cache';
}

interface GradioFileData {
  url?: string | null;
  path?: string | null;
}

const EMBEDDED_FALLBACK_JPEG =
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

function toFileData(imageUrl: string) {
  return {
    path: imageUrl,
    url: imageUrl,
    meta: { _type: 'gradio.FileData' as const },
  };
}

class VtoApiClient {
  constructor(
    private apiUrl: string,
    private hfToken: string
  ) {}

  async generateTryOn(userImageUrl: string, garmentImageUrl: string): Promise<VtoResult> {
    const payload = {
      data: [
        {
          background: toFileData(userImageUrl),
          layers: [] as [],
          composite: null,
        },
        toFileData(garmentImageUrl),
        'Short Sleeve Shirt',
        true,
        false,
        30,
        42,
      ],
    };

    const eventId = await this.submitJob(payload);
    const outputs = await this.waitForResult(eventId);
    const outputPath = this.extractOutputPath(outputs);

    if (!outputPath) {
      throw new Error('VTO API returned no composite image');
    }

    return { imageUrl: this.resolveImageUrl(outputPath), source: 'vto-api' };
  }

  private authHeaders(extra: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = { ...extra };
    if (this.hfToken) {
      headers.Authorization = `Bearer ${this.hfToken}`;
    }
    return headers;
  }

  private async submitJob(payload: { data: unknown[] }): Promise<string> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`VTO API submit error: HTTP ${response.status}${body ? ` — ${body.slice(0, 200)}` : ''}`);
    }

    const result = (await response.json()) as { event_id?: string };
    if (!result.event_id) {
      throw new Error('VTO API submit returned no event_id');
    }

    return result.event_id;
  }

  private async waitForResult(eventId: string): Promise<unknown> {
    const streamUrl = `${this.apiUrl.replace(/\/$/, '')}/${eventId}`;
    const response = await fetch(streamUrl, {
      headers: this.authHeaders({ Accept: 'text/event-stream' }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`VTO API stream error: HTTP ${response.status}${body ? ` — ${body.slice(0, 200)}` : ''}`);
    }

    if (!response.body) {
      throw new Error('VTO API stream returned no body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let eventName = 'message';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventName = line.slice(6).trim();
          continue;
        }

        if (!line.startsWith('data:')) {
          continue;
        }

        const raw = line.slice(5).trim();
        const normalized = eventName.toLowerCase();

        if (normalized === 'error') {
          throw new Error(`VTO API Error Event: ${raw || 'null'}`);
        }

        if (!raw || raw === 'null') {
          eventName = 'message';
          continue;
        }

        if (normalized === 'complete' || normalized === 'completed') {
          try {
            return JSON.parse(raw) as unknown;
          } catch {
            throw new Error(`VTO API returned unparseable complete payload: ${raw.slice(0, 200)}`);
          }
        }

        eventName = 'message';
      }
    }

    throw new Error('VTO API stream ended without a complete event');
  }

  private extractOutputPath(result: unknown): string | null {
    const outputs = Array.isArray(result)
      ? result
      : result && typeof result === 'object' && Array.isArray((result as { data?: unknown }).data)
        ? (result as { data: unknown[] }).data
        : null;

    if (!outputs?.length) return null;

    const first = outputs[0];
    if (first && typeof first === 'object') {
      const file = first as GradioFileData;
      if (file.url) return file.url;
      if (file.path) return file.path;
    }
    if (typeof first === 'string') return first;
    return null;
  }

  private resolveImageUrl(pathOrUrl: string): string {
    if (/^(https?:|data:)/i.test(pathOrUrl)) {
      return pathOrUrl;
    }

    try {
      const base = new URL(this.apiUrl);
      if (pathOrUrl.startsWith('/')) {
        return `${base.origin}${pathOrUrl}`;
      }
      return `${base.origin}/file=${pathOrUrl}`;
    } catch {
      return pathOrUrl;
    }
  }
}

class FallbackCache {
  constructor(private imagePath: string) {}

  async getFallbackResult(): Promise<VtoResult> {
    try {
      const buffer = await fs.readFile(this.imagePath);
      const base64 = buffer.toString('base64');
      return {
        imageUrl: `data:image/jpeg;base64,${base64}`,
        source: 'fallback-cache',
      };
    } catch {
      return {
        imageUrl: `data:image/jpeg;base64,${EMBEDDED_FALLBACK_JPEG}`,
        source: 'fallback-cache',
      };
    }
  }
}

export const vtoApiClient = new VtoApiClient(config.vtoApiUrl, config.hfToken);
export const fallbackCache = new FallbackCache(config.fallbackImagePath);
