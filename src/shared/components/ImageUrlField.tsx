'use client';

import { useCallback, useRef, useState } from 'react';
import { uploadImage } from '@/features/upload/api/upload.api';

interface ImageUrlFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export function ImageUrlField({
  value,
  onChange,
  label = 'Image',
  required,
  disabled,
}: ImageUrlFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('File must be an image');
        return;
      }

      setError('');
      setUploading(true);
      try {
        const url = await uploadImage(file);
        onChange(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  return (
    <div>
      {label && <label className="mb-1 block text-xs capitalize">{label}</label>}

      <div
        role="button"
        tabIndex={disabled || uploading ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled && !uploading) inputRef.current?.click();
          }
        }}
        onClick={() => {
          if (!disabled && !uploading) inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative flex min-h-[140px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition-colors ${
          dragOver
            ? 'border-[var(--color-accent-fill)] bg-[var(--color-overlay-hover)]'
            : 'border-[var(--color-border-emphasized)] bg-[var(--color-background-surface)]'
        } ${disabled || uploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled || uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = '';
          }}
        />

        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Upload preview"
            className="max-h-36 rounded-lg object-contain"
          />
        ) : (
          <>
            <svg
              className="mb-2 h-8 w-8 text-[var(--color-text-disabled)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="8.5" cy="10" r="1.5" fill="currentColor" stroke="none" />
              <path d="M21 16l-5.5-5.5a1.5 1.5 0 00-2.12 0L9 15" />
            </svg>
            <p className="text-sm font-medium text-primary">
              {uploading ? 'Uploading…' : 'Drop an image here'}
            </p>
            <p className="mt-1 text-xs text-muted-subtle">or click to browse</p>
          </>
        )}

        {value && !uploading && (
          <p className="mt-2 text-xs text-muted-subtle">Drop or click to replace</p>
        )}
        {uploading && value && (
          <p className="mt-2 text-xs text-muted-subtle">Uploading…</p>
        )}
      </div>

      <input
        type="url"
        value={value}
        onChange={(e) => {
          setError('');
          onChange(e.target.value);
        }}
        placeholder="Or paste an image URL"
        required={required}
        disabled={disabled || uploading}
        className="input-glass mt-2 w-full rounded-lg px-3 py-2 text-sm"
      />

      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}
