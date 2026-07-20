'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, RotateCcw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Tooltip } from '@/shared/components/Tooltip';
import { useT } from '@/shared/hooks/useT';

interface ImageUploadProps {
  onSelect: (file: File) => void;
  disabled?: boolean;
}

type Mode = 'choose' | 'camera' | 'preview';

export function ImageUpload({ onSelect, disabled }: ImageUploadProps) {
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<Mode>('choose');
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [startingCamera, setStartingCamera] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      if (preview) URL.revokeObjectURL(preview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup on unmount only
  }, []);

  // Attach stream after the video element mounts (mode flip → paint → ref ready)
  useEffect(() => {
    if (mode !== 'camera' || !streamRef.current || !videoRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    void videoRef.current.play();
  }, [mode]);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
      setMode('preview');
      setCameraError(null);
      onSelect(file);
    },
    [onSelect]
  );

  async function startCamera() {
    if (disabled) return;
    setCameraError(null);
    setStartingCamera(true);
    setMode('camera');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(t('tryOn.cameraUnsupported'));
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      stopCamera();
      setMode('choose');
      setCameraError(
        err instanceof Error && err.message === t('tryOn.cameraUnsupported')
          ? t('tryOn.cameraUnsupported')
          : t('tryOn.cameraError')
      );
    } finally {
      setStartingCamera(false);
    }
  }

  function cancelCamera() {
    stopCamera();
    setMode('choose');
    setCameraError(null);
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror to match the selfie preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `try-on-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        stopCamera();
        handleFile(file);
      },
      'image/jpeg',
      0.92
    );
  }

  function resetSelection() {
    stopCamera();
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setMode('choose');
    setCameraError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (disabled || mode !== 'choose') return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  if (mode === 'camera') {
    return (
      <div className="space-y-3">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-black ring-1 ring-[var(--color-border)] sm:aspect-video">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full scale-x-[-1] object-cover"
          />
          {startingCamera && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={cancelCamera}
            disabled={disabled}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={capturePhoto}
            disabled={disabled || startingCamera}
          >
            <span className="inline-flex items-center gap-2">
              <Camera className="h-4 w-4" />
              {t('tryOn.capture')}
            </span>
          </Button>
        </div>
      </div>
    );
  }

  if (mode === 'preview' && preview) {
    return (
      <div className="space-y-3">
        <div className="relative flex min-h-[200px] w-full items-center justify-center overflow-hidden rounded-xl bg-[var(--color-background-surface)] ring-1 ring-[var(--color-border)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={t('tryOn.previewAlt')}
            className="max-h-56 w-full object-contain p-2"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={resetSelection}
          disabled={disabled}
        >
          <span className="inline-flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            {t('tryOn.useDifferent')}
          </span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Tooltip content={t('tryOn.uploadTooltip')} fullWidth>
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !disabled) fileInputRef.current?.click();
          }}
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`relative flex min-h-[160px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${
            dragOver
              ? 'border-[var(--color-accent-fill)] bg-[var(--color-overlay-hover)]'
              : 'border-[var(--color-border-emphasized)] bg-[var(--color-background-surface)]'
          } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={disabled}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          <ImagePlus className="mb-3 h-9 w-9 text-[var(--color-text-disabled)]" strokeWidth={1.5} />
          <p className="text-sm font-medium text-primary">{t('tryOn.uploadTitle')}</p>
          <p className="mt-1 text-xs text-muted-subtle">
            {t('tryOn.uploadHint')}
          </p>
        </div>
      </Tooltip>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--color-border)]" />
        <span className="text-xs text-muted-subtle">{t('common.or')}</span>
        <div className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={startCamera}
        disabled={disabled}
      >
        <span className="inline-flex items-center gap-2">
          <Camera className="h-4 w-4" />
          {t('tryOn.takePhoto')}
        </span>
      </Button>

      {cameraError && (
        <p className="text-sm font-medium text-error">{cameraError}</p>
      )}
    </div>
  );
}
