'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

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
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="action-reveal rounded-full p-1.5 text-sand-500 transition-colors hover:bg-sand-200/60 hover:text-olive-700 dark:hover:bg-olive-600/40 dark:hover:text-sand-100"
      >
        {children ?? (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 min-w-[160px] overflow-hidden rounded-xl border border-sand-200/80 bg-sand-50/95 py-1 shadow-lg backdrop-blur-md dark:border-olive-600/60 dark:bg-olive-700/95"
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
        </div>
      )}
    </div>
  );
}
