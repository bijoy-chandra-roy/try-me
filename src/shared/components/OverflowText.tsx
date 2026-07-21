'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';

type OverflowTextProps<T extends ElementType = 'span'> = {
  as?: T;
  children: ReactNode;
  className?: string;
  title?: string;
};

const GAP_PX = 32;

/**
 * Renders inline text that marquees when it would overflow its container
 * (padding and border are reflected via clientWidth on the outer box).
 */
export function OverflowText<T extends ElementType = 'span'>({
  as,
  children,
  className = '',
  title,
}: OverflowTextProps<T>) {
  const Component = (as ?? 'span') as ElementType;
  const containerRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    function check() {
      const available = container!.clientWidth;
      const width = measure!.scrollWidth;
      setContentWidth(width);
      setOverflowing(width - available > 1);
    }

    check();

    const observer = new ResizeObserver(check);
    observer.observe(container);
    observer.observe(measure);

    return () => observer.disconnect();
  }, [children]);

  const motionStyle: CSSProperties | undefined = overflowing
    ? {
        ['--overflow-distance' as string]: `${contentWidth + GAP_PX}px`,
        ['--overflow-duration' as string]: `${Math.max(6, (contentWidth + GAP_PX) / 32)}s`,
      }
    : undefined;

  return (
    <Component
      ref={containerRef}
      className={`block min-w-0 max-w-full overflow-hidden ${
        overflowing ? 'relative' : ''
      } ${className}`}
      title={title}
    >
      {/* Hidden measure node — always one copy so overflow detection stays accurate */}
      <span
        ref={measureRef}
        aria-hidden={overflowing || undefined}
        className={
          overflowing
            ? 'pointer-events-none invisible absolute left-0 top-0 whitespace-nowrap'
            : 'block truncate'
        }
      >
        {children}
      </span>

      {overflowing && (
        <span
          className="inline-flex whitespace-nowrap overflow-text-marquee"
          style={motionStyle}
        >
          <span className="shrink-0" style={{ paddingRight: GAP_PX }}>
            {children}
          </span>
          <span className="shrink-0" aria-hidden style={{ paddingRight: GAP_PX }}>
            {children}
          </span>
        </span>
      )}
    </Component>
  );
}
