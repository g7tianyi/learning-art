'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface UseKeyboardShortcutsOptions {
  onPrevious?: () => void;
  onNext?: () => void;
  enabled?: boolean;
}

/**
 * Global keyboard shortcuts for navigation
 *
 * Global shortcuts:
 * - g+h: Go to Home
 * - g+b: Go to Browse
 * - g+r: Go to Review
 * - Esc: Go back
 *
 * Context-specific shortcuts:
 * - ← / →: Previous/Next (when callbacks provided)
 * - j / k: Scroll down/up (future: list navigation)
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { onPrevious, onNext, enabled = true } = options;
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled) return;

    let gPressed = false;
    let gPressTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Handle 'g' prefix for navigation shortcuts
      if (e.key === 'g' && !gPressed && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        gPressed = true;
        gPressTimeout = setTimeout(() => {
          gPressed = false;
        }, 1000); // Reset after 1 second
        return;
      }

      // Handle 'g+h' (home)
      if (gPressed && e.key === 'h') {
        e.preventDefault();
        gPressed = false;
        clearTimeout(gPressTimeout);
        router.push('/');
        return;
      }

      // Handle 'g+b' (browse)
      if (gPressed && e.key === 'b') {
        e.preventDefault();
        gPressed = false;
        clearTimeout(gPressTimeout);
        router.push('/browse');
        return;
      }

      // Handle 'g+r' (review)
      if (gPressed && e.key === 'r') {
        e.preventDefault();
        gPressed = false;
        clearTimeout(gPressTimeout);
        router.push('/review');
        return;
      }

      // Handle Escape (go back)
      if (e.key === 'Escape' && pathname !== '/') {
        e.preventDefault();
        router.back();
        return;
      }

      // Handle arrow keys for previous/next
      if (e.key === 'ArrowLeft' && onPrevious && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        onPrevious();
        return;
      }

      if (e.key === 'ArrowRight' && onNext && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        onNext();
        return;
      }

      // Handle j/k for scrolling (vim-style)
      if (e.key === 'j' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        window.scrollBy({ top: 100, behavior: 'smooth' });
        return;
      }

      if (e.key === 'k' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        window.scrollBy({ top: -100, behavior: 'smooth' });
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(gPressTimeout);
    };
  }, [enabled, onPrevious, onNext, router, pathname]);
}
