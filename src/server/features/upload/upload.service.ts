import { imgbbClient } from './imgbb.client';

export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
}

class UploadService {
  async uploadUserImage(file: UploadedFile) {
    return imgbbClient.uploadImage(file.buffer, file.originalname);
  }
}

export const uploadService = new UploadService();
