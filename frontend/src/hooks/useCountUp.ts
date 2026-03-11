"use client";

import { useEffect, useRef, useState } from "react";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Exported for testing only
export const easeOutCubicTest = easeOutCubic;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Animates a numeric value from 0 to `target` using requestAnimationFrame.
 * Respects prefers-reduced-motion: if reduced motion is preferred, returns
 * the target immediately without animation.
 */
export function useCountUp(
  target: number,
  duration = 1200,
  enabled = true,
): number {
  const shouldAnimate = enabled && !prefersReducedMotion();
  const [value, setValue] = useState(() => (shouldAnimate ? 0 : target));
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const prevTargetRef = useRef<number>(target);

  useEffect(() => {
    if (!shouldAnimate) {
      // Will be set via RAF to avoid sync setState-in-effect lint error
      rafRef.current = requestAnimationFrame(() => setValue(target));
      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      };
    }

    if (prevTargetRef.current !== target) {
      prevTargetRef.current = target;
      startTimeRef.current = null;
    }

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      setValue(eased * target);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration, shouldAnimate]);

  return value;
}
