import { useEffect, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * useMobileNavOverlay — focus trap + body scroll lock for the mobile
 * hamburger menu overlay. While `isOpen`, Tab/Shift+Tab cycle only through
 * focusable elements inside `overlayRef`, and the page behind the overlay
 * cannot scroll. Both are undone automatically when the overlay closes or
 * the component unmounts.
 */
export function useMobileNavOverlay(
  overlayRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
): void {
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    const overlay = overlayRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    let firstFocusable: HTMLElement | null = null;
    let lastFocusable: HTMLElement | null = null;

    if (overlay) {
      const focusable = overlay.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      firstFocusable = focusable[0] ?? null;
      lastFocusable = focusable[focusable.length - 1] ?? null;
      firstFocusable?.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !firstFocusable || !lastFocusable) return;

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [overlayRef, isOpen]);
}
