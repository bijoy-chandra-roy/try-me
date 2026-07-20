'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTryOn } from '@/features/try-on/hooks/useTryOn';
import { ImageUpload } from '@/features/try-on/components/ImageUpload';
import { TryOnResultView } from '@/features/try-on/components/TryOnResult';
import { Button } from '@/shared/components/Button';
import { GlassCard } from '@/shared/components/GlassCard';
import type { Product } from '@/shared/types';

interface TryOnModalProps {
  product: Product | null;
  onClose: () => void;
}

export function TryOnModal({ product, onClose }: TryOnModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { tryOn, loading, error, result, reset } = useTryOn();

  useEffect(() => {
    if (!product) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [product]);

  if (!product) return null;

  async function handleSubmit() {
    if (!selectedFile || !product) return;
    await tryOn(selectedFile, product._id);
  }

  function handleClose() {
    reset();
    setSelectedFile(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-overlay flex items-center justify-center p-4">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'var(--color-overlay)' }}
        onClick={handleClose}
        role="presentation"
      />

      <GlassCard
        className="relative z-10 flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col shadow-2xl"
        elastic={false}
        overflow="auto"
      >
        <div className="p-6">
        <div className="mb-5 flex shrink-0 items-start justify-between">
          <div className="min-w-0 pr-4">
            <h2 className="font-serif text-xl font-semibold text-primary">
              Virtual Try-On
            </h2>
            <p className="mt-1 truncate text-sm text-muted">{product.name}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="btn-destructive shrink-0"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-5 flex shrink-0 gap-4">
          <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-inner ring-1 ring-[var(--color-border)]">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <p className="line-clamp-4 text-sm text-muted">{product.description}</p>
        </div>

        {result ? (
          <TryOnResultView result={result} />
        ) : (
          <>
            <ImageUpload onSelect={setSelectedFile} disabled={loading} />

            {error && (
              <p className="mt-3 text-sm font-medium text-error">{error}</p>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || loading}
              className="mt-5 w-full shrink-0 py-3"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-accent)] border-t-transparent" />
                  Processing try-on…
                </span>
              ) : (
                'Generate Try-On'
              )}
            </Button>
          </>
        )}

        {result && (
          <button
            type="button"
            onClick={() => {
              reset();
              setSelectedFile(null);
            }}
            className="mt-4 w-full shrink-0 btn-secondary btn-md"
          >
            Try another photo
          </button>
        )}
        </div>
      </GlassCard>
    </div>
  );
}
