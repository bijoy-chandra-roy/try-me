'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFloatingPosition } from '@/shared/hooks/useFloatingPosition';
import { ScrollArea } from '@/shared/components/ScrollArea';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  className = '',
  disabled = false,
  'aria-label': ariaLabel,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ?? options[0];

  const coords = useFloatingPosition({
    open,
    triggerRef,
    floatingRef: menuRef,
    preferredSide: 'bottom',
    align: 'start',
    gap: 4,
    matchTriggerWidth: true,
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
    <div className={className.includes('w-full') ? 'relative w-full' : 'relative inline-block min-w-0'}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`input-glass inline-flex w-full items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      >
        <span className="min-w-0 truncate">{selected?.label ?? 'Select…'}</span>
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-muted-subtle transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={menuRef}
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel}
            className={`fixed z-[200] overflow-hidden rounded-xl border border-sand-200/80 bg-sand-50/95 shadow-lg backdrop-blur-md transition-opacity duration-150 dark:border-olive-500/50 dark:bg-olive-800/95 ${
              coords ? 'opacity-100' : 'opacity-0'
            }`}
            style={
              coords
                ? {
                    top: coords.top,
                    left: coords.left,
                    width: coords.width,
                  }
                : { top: 0, left: 0 }
            }
          >
            <ScrollArea edgeInset={12} viewportClassName="max-h-60 py-1">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors ${
                      isSelected
                        ? 'bg-olive-600/12 font-medium text-olive-700 dark:bg-sand-100/10 dark:text-sand-50'
                        : 'text-olive-700 hover:bg-sand-200/60 dark:text-sand-100 dark:hover:bg-olive-600/40'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </ScrollArea>
          </div>,
          document.body
        )}
    </div>
  );
}
