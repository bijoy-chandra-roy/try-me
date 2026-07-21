import { AppError } from '@/server/lib/errors';

const SIGNATURES: { mime: string; check: (b: Buffer) => boolean }[] = [
  { mime: 'image/jpeg', check: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: 'image/png', check: (b) => b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  {
    mime: 'image/gif',
    check: (b) =>
      b.length >= 6 &&
      (b.subarray(0, 6).toString('ascii') === 'GIF87a' ||
        b.subarray(0, 6).toString('ascii') === 'GIF89a'),
  },
  {
    mime: 'image/webp',
    check: (b) =>
      b.length >= 12 &&
      b.subarray(0, 4).toString('ascii') === 'RIFF' &&
      b.subarray(8, 12).toString('ascii') === 'WEBP',
  },
];

export function detectImageMime(buffer: Buffer): string | null {
  for (const sig of SIGNATURES) {
    if (sig.check(buffer)) return sig.mime;
  }
  return null;
}

export function assertValidImageBuffer(buffer: Buffer, declaredType?: string): void {
  const detected = detectImageMime(buffer);
  if (!detected) {
    throw new AppError('File must be a valid JPEG, PNG, GIF, or WebP image', 400);
  }
  if (declaredType && !declaredType.startsWith('image/')) {
    throw new AppError('File must be an image', 400);
  }
}
