'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTryOn } from '@/features/try-on/hooks/useTryOn';
import { ImageUpload } from '@/features/try-on/components/ImageUpload';
import { TryOnResultView } from '@/features/try-on/components/TryOnResult';
import { GlassButton } from '@/shared/components/GlassButton';
import { GlassCard } from '@/shared/components/GlassCard';
import type { Product } from '@/shared/types';

interface TryOnModalProps {
  product: Product | null;
  onClose: () => void;
}

export function TryOnModal({ product, onClose }: TryOnModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { tryOn, loading, error, result, reset } = useTryOn();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-olive-900/40 backdrop-blur-sm"
        onClick={handleClose}
        role="presentation"
      />

      <GlassCard className="relative z-10 w-full max-w-lg p-6 shadow-2xl" elastic={false}>
        <div className="mb-5 flex items-start justify-between">
          <div className="min-w-0 pr-4">
            <h2 className="font-serif text-xl font-semibold text-olive-700 dark:text-sand-100">
              Virtual Try-On
            </h2>
            <p className="mt-1 truncate text-sm text-sand-600 dark:text-sand-300">{product.name}</p>
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

        <div className="mb-5 flex gap-4">
          <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg ring-1 ring-sand-200/80 dark:ring-olive-600/60">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <p className="line-clamp-4 text-sm text-sand-600 dark:text-sand-300">{product.description}</p>
        </div>

        {result ? (
          <TryOnResultView result={result} />
        ) : (
          <>
            <ImageUpload onSelect={setSelectedFile} disabled={loading} />

            {error && (
              <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            )}

            <GlassButton
              onClick={handleSubmit}
              disabled={!selectedFile || loading}
              className="mt-5 w-full py-3"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-sand-50 border-t-transparent" />
                  Processing try-on…
                </span>
              ) : (
                'Generate Try-On'
              )}
            </GlassButton>
          </>
        )}

        {result && (
          <button
            type="button"
            onClick={() => {
              reset();
              setSelectedFile(null);
            }}
            className="mt-4 w-full rounded-full border border-sand-300 py-2.5 text-sm font-medium text-sand-700 transition-colors hover:bg-sand-100 dark:border-olive-600 dark:text-sand-200 dark:hover:bg-olive-700/30"
          >
            Try another photo
          </button>
        )}
      </GlassCard>
    </div>
  );
}
