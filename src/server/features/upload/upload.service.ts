import { imgbbClient } from './imgbb.client';

export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
}

class UploadService {
  async uploadImage(file: UploadedFile) {
    return imgbbClient.uploadImage(file.buffer, file.originalname);
  }

  async uploadUserImage(file: UploadedFile) {
    return this.uploadImage(file);
  }

  /** Fetch a remote/data-URI image and persist it to ImgBB. */
  async uploadImageFromSource(
    imageUrl: string,
    filename = 'try-on-result.jpg',
    fetchHeaders?: Record<string, string>
  ) {
    const buffer = await this.readImageBuffer(imageUrl, fetchHeaders);
    return this.uploadImage({ buffer, originalname: filename });
  }

  private async readImageBuffer(
    imageUrl: string,
    fetchHeaders?: Record<string, string>
  ): Promise<Buffer> {
    if (imageUrl.startsWith('data:')) {
      const match = /^data:[^;]+;base64,(.+)$/i.exec(imageUrl);
      if (!match) {
        throw new Error('Invalid data URI image');
      }
      return Buffer.from(match[1], 'base64');
    }

    const response = await fetch(imageUrl, {
      headers: fetchHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image for upload: HTTP ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }
}

export const uploadService = new UploadService();
