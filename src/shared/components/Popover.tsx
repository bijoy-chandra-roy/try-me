'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useFloatingPosition } from '@/shared/hooks/useFloatingPosition';

interface PopoverItem {
  label: string;
  onClick: () => void;
}

interface PopoverProps {
  label: string;
  items: PopoverItem[];
  children?: ReactNode;
}

export function Popover({ label, items, children }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const coords = useFloatingPosition({
    open,
    triggerRef,
    floatingRef: menuRef,
    preferredSide: 'bottom',
    align: 'end',
    gap: 4,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((prev) => !prev)}
        className="action-reveal rounded-full p-1.5 text-muted-subtle transition-colors hover:bg-sand-200/60 hover:text-olive-700 dark:hover:bg-olive-600/40 dark:hover:text-sand-100"
      >
        {children ?? (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        )}
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className={`fixed z-[200] min-w-[160px] overflow-hidden rounded-xl border border-sand-200/80 bg-sand-50/95 py-1 shadow-lg backdrop-blur-md transition-opacity duration-150 dark:border-olive-500/50 dark:bg-olive-800/95 ${
              coords ? 'opacity-100' : 'opacity-0'
            }`}
            style={
              coords
                ? { top: coords.top, left: coords.left }
                : { top: 0, left: 0 }
            }
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm text-olive-700 transition-colors hover:bg-sand-200/60 dark:text-sand-100 dark:hover:bg-olive-600/40"
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
