'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type UIEvent,
} from 'react';

const MIN_THUMB_PX = 28;

interface ScrollMetrics {
  visible: boolean;
  thumbTop: number;
  thumbHeight: number;
}

function measure(el: HTMLElement, edgeInset: number): ScrollMetrics {
  const { scrollHeight, clientHeight, scrollTop } = el;
  const overflow = scrollHeight - clientHeight;

  if (overflow <= 1) {
    return { visible: false, thumbTop: 0, thumbHeight: 0 };
  }

  const track = Math.max(0, clientHeight - edgeInset * 2);
  const thumbHeight = Math.max(MIN_THUMB_PX, (clientHeight / scrollHeight) * track);
  const maxThumbTravel = Math.max(0, track - thumbHeight);
  const thumbTop = edgeInset + (scrollTop / overflow) * maxThumbTravel;

  return { visible: true, thumbTop, thumbHeight };
}

interface ScrollAreaProps {
  children: ReactNode;
  /** Outer positioning wrapper (relative). Use flex-1 / min-h-0 here in flex layouts. */
  className?: string;
  /** Applied to the scrollable viewport — put max-h / overflow sizing here. */
  viewportClassName?: string;
  /** Distance from container edges; match the panel border-radius. */
  edgeInset?: number;
}

/**
 * Scroll container with a custom overlay thumb only — no native scrollbar,
 * arrows, or track gutter. The thumb is a position indicator and drag handle.
 */
export function ScrollArea({
  children,
  className = '',
  viewportClassName = '',
  edgeInset = 16,
}: ScrollAreaProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; startY: number; startScrollTop: number } | null>(
    null
  );
  const [metrics, setMetrics] = useState<ScrollMetrics>({
    visible: false,
    thumbTop: 0,
    thumbHeight: 0,
  });

  const sync = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    setMetrics(measure(el, edgeInset));
  }, [edgeInset]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    sync();

    const ro = new ResizeObserver(sync);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);

    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, [sync, children]);

  function onScroll(e: UIEvent<HTMLDivElement>) {
    setMetrics(measure(e.currentTarget, edgeInset));
  }

  function onThumbPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;
    if (!viewport) return;

    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startScrollTop: viewport.scrollTop,
    };
  }

  function onThumbPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const viewport = viewportRef.current;
    if (!drag || drag.pointerId !== e.pointerId || !viewport) return;

    const overflow = viewport.scrollHeight - viewport.clientHeight;
    if (overflow <= 0) return;

    const track = Math.max(0, viewport.clientHeight - edgeInset * 2);
    const thumbHeight = Math.max(
      MIN_THUMB_PX,
      (viewport.clientHeight / viewport.scrollHeight) * track
    );
    const maxThumbTravel = Math.max(1, track - thumbHeight);
    const deltaY = e.clientY - drag.startY;
    const next = drag.startScrollTop + (deltaY / maxThumbTravel) * overflow;
    viewport.scrollTop = Math.max(0, Math.min(overflow, next));
  }

  function onThumbPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    }
  }

  const thumbStyle: CSSProperties = {
    top: metrics.thumbTop,
    height: metrics.thumbHeight,
    right: Math.max(4, edgeInset * 0.35),
  };

  return (
    <div className={`relative min-h-0 ${className}`}>
      <div
        ref={viewportRef}
        onScroll={onScroll}
        className={`scrollbar-none overflow-x-hidden overflow-y-auto ${viewportClassName}`}
      >
        {children}
      </div>

      {metrics.visible ? (
        <div
          role="presentation"
          aria-hidden
          onPointerDown={onThumbPointerDown}
          onPointerMove={onThumbPointerMove}
          onPointerUp={onThumbPointerUp}
          onPointerCancel={onThumbPointerUp}
          className="scroll-thumb absolute z-[5] w-1.5 cursor-grab touch-none rounded-full active:cursor-grabbing"
          style={thumbStyle}
        />
      ) : null}
    </div>
  );
}
