import { config } from '@/server/config';

class ImgBBClient {
  constructor(private apiKey: string) {}

  async uploadImage(buffer: Buffer, filename = 'user-photo.jpg'): Promise<string> {
    if (!this.apiKey) {
      const base64 = buffer.toString('base64');
      const mime = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
      return `data:${mime};base64,${base64}`;
    }

    const base64 = buffer.toString('base64');
    const body = new URLSearchParams({
      key: this.apiKey,
      image: base64,
      name: filename,
    });

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`ImgBB upload failed with status ${response.status}`);
    }

    const payload = await response.json();
    if (!payload.success) {
      throw new Error(payload.error?.message || 'ImgBB upload failed');
    }

    return payload.data.url;
  }
}

export const imgbbClient = new ImgBBClient(config.imgbbApiKey);
