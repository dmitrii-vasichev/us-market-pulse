"use client";

import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Wraps page content with a fade + subtle translateY transition on route changes.
 * Uses CSS animation with a key on pathname — React re-mounts on route change,
 * triggering the enter animation automatically.
 * Respects prefers-reduced-motion via CSS media query.
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-transition-enter">
      {children}
    </div>
  );
}
