'use client';

import { useCallback, useRef } from 'react';

export function useGlassElasticity<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    el.style.setProperty('--mouse-x', `${x}%`);
    el.style.setProperty('--mouse-y', `${y}%`);

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateX = ((e.clientY - centerY) / rect.height) * -4;
    const rotateY = ((e.clientX - centerX) / rect.width) * 4;

    el.style.setProperty('--rotate-x', `${rotateX}deg`);
    el.style.setProperty('--rotate-y', `${rotateY}deg`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    el.style.setProperty('--mouse-x', '50%');
    el.style.setProperty('--mouse-y', '50%');
    el.style.setProperty('--rotate-x', '0deg');
    el.style.setProperty('--rotate-y', '0deg');
  }, []);

  return { ref, handleMouseMove, handleMouseLeave };
}
