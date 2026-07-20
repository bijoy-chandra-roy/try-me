'use client';

import { useCallback, useRef, useState } from 'react';

interface ImageUploadProps {
  onSelect: (file: File) => void;
  disabled?: boolean;
}

export function ImageUpload({ onSelect, disabled }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      setPreview(URL.createObjectURL(file));
      onSelect(file);
    },
    [onSelect]
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${
        dragOver
          ? 'border-olive-500 bg-olive-500/5'
          : 'border-sand-300 bg-sand-100/50 dark:border-olive-600 dark:bg-olive-700/20'
      } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Your photo preview"
          className="max-h-48 rounded-lg object-contain"
        />
      ) : (
        <>
          <svg
            className="mb-3 h-10 w-10 text-sand-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <p className="text-sm font-medium text-sand-700 dark:text-sand-200">
            Upload your photo
          </p>
          <p className="mt-1 text-xs text-sand-500 dark:text-sand-400">
            Drag & drop or click to browse
          </p>
        </>
      )}
    </div>
  );
}
