"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns a ref and a boolean `inView` that becomes true once the element
 * enters the viewport. Uses IntersectionObserver with a 50px root margin
 * so charts start loading slightly before they're visible.
 * Once inView is true it stays true (no unloading).
 */
export function useInView(rootMargin = "50px"): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return; // already visible, no need to observe

    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      // Fallback: no IntersectionObserver support — load immediately via RAF
      const raf = requestAnimationFrame(() => setInView(true));
      return () => cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return [ref, inView];
}
