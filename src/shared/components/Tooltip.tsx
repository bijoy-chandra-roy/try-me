'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  useFloatingPosition,
  type FloatingSide,
} from '@/shared/hooks/useFloatingPosition';

interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: FloatingSide;
  fullWidth?: boolean;
}

export function Tooltip({ content, children, side = 'top', fullWidth = false }: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const tooltipId = useId();

  const coords = useFloatingPosition({
    open,
    triggerRef,
    floatingRef: bubbleRef,
    preferredSide: side,
    align: 'center',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <span
      ref={triggerRef}
      className={`tooltip-trigger relative ${fullWidth ? 'block w-full' : 'inline-flex'}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
      aria-describedby={open ? tooltipId : undefined}
    >
      {children}
      {mounted &&
        open &&
        createPortal(
          <span
            ref={bubbleRef}
            id={tooltipId}
            role="tooltip"
            className={`tooltip-bubble pointer-events-none fixed z-tooltip w-max max-w-[220px] rounded-lg px-2.5 py-1.5 text-center text-xs font-medium transition-opacity duration-fast ${
              coords ? 'opacity-100' : 'opacity-0'
            }`}
            style={
              coords
                ? { top: coords.top, left: coords.left }
                : { top: 0, left: 0 }
            }
          >
            {content}
          </span>,
          document.body
        )}
    </span>
  );
}
