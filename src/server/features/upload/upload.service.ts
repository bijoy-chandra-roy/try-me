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
}

export const uploadService = new UploadService();
