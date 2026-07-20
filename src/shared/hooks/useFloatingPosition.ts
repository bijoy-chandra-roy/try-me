'use client';

import { useCallback, useLayoutEffect, useState, type RefObject } from 'react';

export type FloatingSide = 'top' | 'bottom';
export type FloatingAlign = 'center' | 'start' | 'end';

interface UseFloatingPositionOptions {
  open: boolean;
  triggerRef: RefObject<HTMLElement | null>;
  floatingRef: RefObject<HTMLElement | null>;
  preferredSide?: FloatingSide;
  align?: FloatingAlign;
  gap?: number;
  padding?: number;
  /** Stretch floating panel to at least the trigger width (e.g. selects). */
  matchTriggerWidth?: boolean;
}

interface FloatingCoords {
  top: number;
  left: number;
  side: FloatingSide;
  width?: number;
}

/**
 * Positions a floating element relative to a trigger, flipping vertically
 * and shifting horizontally so it stays within the viewport.
 */
export function useFloatingPosition({
  open,
  triggerRef,
  floatingRef,
  preferredSide = 'top',
  align = 'center',
  gap = 8,
  padding = 8,
  matchTriggerWidth = false,
}: UseFloatingPositionOptions): FloatingCoords | null {
  const [coords, setCoords] = useState<FloatingCoords | null>(null);

  const update = useCallback(() => {
    const trigger = triggerRef.current;
    const floating = floatingRef.current;
    if (!trigger || !floating) return;

    const triggerRect = trigger.getBoundingClientRect();
    const width = matchTriggerWidth
      ? Math.max(triggerRect.width, floating.offsetWidth)
      : floating.offsetWidth;

    if (matchTriggerWidth) {
      floating.style.width = `${width}px`;
    }

    const floatingRect = floating.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const spaceAbove = triggerRect.top - padding;
    const spaceBelow = vh - triggerRect.bottom - padding;
    const needsFlip =
      preferredSide === 'top'
        ? spaceAbove < floatingRect.height + gap && spaceBelow > spaceAbove
        : spaceBelow < floatingRect.height + gap && spaceAbove > spaceBelow;

    const side: FloatingSide = needsFlip
      ? preferredSide === 'top'
        ? 'bottom'
        : 'top'
      : preferredSide;

    let top =
      side === 'top'
        ? triggerRect.top - floatingRect.height - gap
        : triggerRect.bottom + gap;

    let left: number;
    if (align === 'end') {
      left = triggerRect.right - floatingRect.width;
    } else if (align === 'start') {
      left = triggerRect.left;
    } else {
      left = triggerRect.left + triggerRect.width / 2 - floatingRect.width / 2;
    }

    left = Math.max(padding, Math.min(left, vw - floatingRect.width - padding));
    top = Math.max(padding, Math.min(top, vh - floatingRect.height - padding));

    setCoords({ top, left, side, width: matchTriggerWidth ? width : undefined });
  }, [triggerRef, floatingRef, preferredSide, align, gap, padding, matchTriggerWidth]);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }

    update();

    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, update]);

  return coords;
}
