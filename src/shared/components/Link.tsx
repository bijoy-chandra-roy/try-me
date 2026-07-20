'use client';

import {
  useEffect,
  useRef,
  type ComponentProps,
  type MouseEvent,
} from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

type LinkProps = ComponentProps<typeof NextLink>;

/**
 * Drop-in next/link replacement with viewport + hover prefetch and
 * mousedown navigation (NextFaster-style).
 */
export function Link({ children, prefetch, onMouseEnter, onMouseDown, ...props }: LinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const router = useRouter();
  const prefetchEnabled = prefetch !== false;

  useEffect(() => {
    if (!prefetchEnabled) return;

    const linkElement = linkRef.current;
    if (!linkElement) return;

    let prefetchTimeout: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          prefetchTimeout = setTimeout(() => {
            router.prefetch(String(props.href));
            observer.unobserve(entry.target);
          }, 300);
        } else if (prefetchTimeout) {
          clearTimeout(prefetchTimeout);
          prefetchTimeout = null;
        }
      },
      { rootMargin: '0px', threshold: 0.1 }
    );

    observer.observe(linkElement);

    return () => {
      observer.disconnect();
      if (prefetchTimeout) clearTimeout(prefetchTimeout);
    };
  }, [props.href, prefetchEnabled, router]);

  function handleMouseEnter(e: MouseEvent<HTMLAnchorElement>) {
    if (prefetchEnabled) {
      router.prefetch(String(props.href));
    }
    onMouseEnter?.(e);
  }

  function handleMouseDown(e: MouseEvent<HTMLAnchorElement>) {
    onMouseDown?.(e);
    if (e.defaultPrevented) return;

    try {
      const url = new URL(String(props.href), window.location.href);
      if (
        url.origin === window.location.origin &&
        e.button === 0 &&
        !e.altKey &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        e.preventDefault();
        router.push(String(props.href));
      }
    } catch {
      /* invalid href — let default handling proceed */
    }
  }

  return (
    <NextLink
      ref={linkRef}
      prefetch={false}
      onMouseEnter={handleMouseEnter}
      onMouseDown={handleMouseDown}
      {...props}
    >
      {children}
    </NextLink>
  );
}

export default Link;
