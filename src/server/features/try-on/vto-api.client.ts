import fs from 'fs/promises';
import { config } from '@/server/config';

interface VtoResult {
  imageUrl: string;
  source: 'vto-api' | 'fallback-cache';
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

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.hfToken) {
      headers.Authorization = `Bearer ${this.hfToken}`;
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`VTO API error: HTTP ${response.status}`);
    }

    const result = await response.json();
    const outputPath = this.extractOutputPath(result);

    if (!outputPath) {
      throw new Error('VTO API returned no composite image');
    }

    return { imageUrl: outputPath, source: 'vto-api' };
  }

  private extractOutputPath(result: {
    data?: Array<{ url?: string; path?: string } | string>;
  }): string | null {
    const first = result?.data?.[0];
    if (first && typeof first === 'object') {
      if (first.url) return first.url;
      if (first.path) return first.path;
    }
    if (typeof first === 'string') return first;
    return null;
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
