import { config } from '@/server/config';

/** Public Freeimage.host guest key (Chevereto-compatible API). */
const FREEIMAGE_API_KEY = '6d207e02198a847aa98d0a2a901485a5';

interface CheveretoSuccess {
  success?: boolean | { message?: string; code?: number };
  status_code?: number;
  data?: { url?: string; display_url?: string };
  image?: { url?: string; display_url?: string; url_viewer?: string };
  error?: { message?: string; code?: number };
  status_txt?: string;
}

class ImgBBClient {
  constructor(private apiKey: string) {}

  async uploadImage(buffer: Buffer, filename = 'user-photo.jpg'): Promise<string> {
    if (!this.apiKey) {
      return this.toDataUri(buffer, filename);
    }

    const safeName = this.sanitizeFilename(filename);

    try {
      return await this.uploadToHost(
        'https://api.imgbb.com/1/upload',
        this.apiKey,
        buffer,
        safeName
      );
    } catch (primaryError) {
      try {
        return await this.uploadToHost(
          'https://freeimage.host/api/1/upload',
          FREEIMAGE_API_KEY,
          buffer,
          safeName
        );
      } catch {
        throw primaryError instanceof Error
          ? primaryError
          : new Error('Image upload failed');
      }
    }
  }

  private async uploadToHost(
    endpoint: string,
    apiKey: string,
    buffer: Buffer,
    filename: string
  ): Promise<string> {
    const body = new FormData();
    body.append('image', buffer.toString('base64'));
    body.append('name', filename);

    const response = await fetch(
      `${endpoint}?key=${encodeURIComponent(apiKey)}`,
      { method: 'POST', body }
    );

    const payload = (await response.json().catch(() => null)) as CheveretoSuccess | null;

    if (!response.ok) {
      const detail =
        payload?.error?.message ||
        payload?.status_txt ||
        `HTTP ${response.status}`;
      throw new Error(`Image upload failed: ${detail}`);
    }

    const url =
      payload?.data?.url ||
      payload?.data?.display_url ||
      payload?.image?.url ||
      payload?.image?.display_url;

    if (!url) {
      throw new Error(
        payload?.error?.message || 'Image upload failed: no URL in response'
      );
    }

    return url;
  }

  private toDataUri(buffer: Buffer, filename: string): string {
    const base64 = buffer.toString('base64');
    const mime = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,${base64}`;
  }

  private sanitizeFilename(filename: string): string {
    const base = filename.replace(/\\/g, '/').split('/').pop() || 'upload.jpg';
    const cleaned = base.replace(/[^\w.\-]+/g, '_').slice(0, 100);
    return cleaned || 'upload.jpg';
  }
}

export const imgbbClient = new ImgBBClient(config.imgbbApiKey.trim());
