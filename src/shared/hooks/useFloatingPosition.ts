'use client';

import { useCallback, useLayoutEffect, useState, type RefObject } from 'react';

export type FloatingSide = 'top' | 'bottom' | 'left' | 'right';
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

function isVertical(side: FloatingSide): boolean {
  return side === 'top' || side === 'bottom';
}

/**
 * Positions a floating element relative to a trigger, flipping along the
 * preferred axis and clamping so it stays within the viewport.
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

    let side = preferredSide;

    if (isVertical(preferredSide)) {
      const spaceAbove = triggerRect.top - padding;
      const spaceBelow = vh - triggerRect.bottom - padding;
      const needsFlip =
        preferredSide === 'top'
          ? spaceAbove < floatingRect.height + gap && spaceBelow > spaceAbove
          : spaceBelow < floatingRect.height + gap && spaceAbove > spaceBelow;
      if (needsFlip) side = preferredSide === 'top' ? 'bottom' : 'top';
    } else {
      const spaceLeft = triggerRect.left - padding;
      const spaceRight = vw - triggerRect.right - padding;
      const needsFlip =
        preferredSide === 'left'
          ? spaceLeft < floatingRect.width + gap && spaceRight > spaceLeft
          : spaceRight < floatingRect.width + gap && spaceLeft > spaceRight;
      if (needsFlip) side = preferredSide === 'left' ? 'right' : 'left';
    }

    let top: number;
    let left: number;

    if (side === 'top') {
      top = triggerRect.top - floatingRect.height - gap;
      left =
        align === 'end'
          ? triggerRect.right - floatingRect.width
          : align === 'start'
            ? triggerRect.left
            : triggerRect.left + triggerRect.width / 2 - floatingRect.width / 2;
    } else if (side === 'bottom') {
      top = triggerRect.bottom + gap;
      left =
        align === 'end'
          ? triggerRect.right - floatingRect.width
          : align === 'start'
            ? triggerRect.left
            : triggerRect.left + triggerRect.width / 2 - floatingRect.width / 2;
    } else if (side === 'left') {
      left = triggerRect.left - floatingRect.width - gap;
      top =
        align === 'end'
          ? triggerRect.bottom - floatingRect.height
          : align === 'start'
            ? triggerRect.top
            : triggerRect.top + triggerRect.height / 2 - floatingRect.height / 2;
    } else {
      left = triggerRect.right + gap;
      top =
        align === 'end'
          ? triggerRect.bottom - floatingRect.height
          : align === 'start'
            ? triggerRect.top
            : triggerRect.top + triggerRect.height / 2 - floatingRect.height / 2;
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
