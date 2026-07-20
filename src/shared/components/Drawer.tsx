'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from '@/shared/components/IconButton';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Prefer left for nav, right for account menus. */
  side?: 'left' | 'right';
}

export function Drawer({ open, onClose, title, children, side = 'left' }: DrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const sideClass =
    side === 'right'
      ? 'right-0 border-l border-subtle'
      : 'left-0 border-r border-subtle';

  return createPortal(
    <div className="fixed inset-0 z-overlay md:hidden" role="presentation">
      <button
        type="button"
        aria-label="Dismiss menu"
        className="absolute inset-0 bg-[var(--color-overlay)]"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`glass-card absolute bottom-0 top-0 flex w-[min(100%,20rem)] flex-col overflow-y-auto p-5 shadow-med ${sideClass}`}
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="font-serif text-lg font-semibold text-primary">{title}</h2>
          <IconButton label="Close menu" onClick={onClose} showTooltip={false}>
            <X className="h-5 w-5" strokeWidth={1.75} />
          </IconButton>
        </div>
        {children}
      </aside>
    </div>,
    document.body
  );
}
