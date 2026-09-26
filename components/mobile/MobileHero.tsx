'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useMobileHeroContent } from '@/hooks/useMobileHeroContent';
import { useMobileNavOverlay } from '@/hooks/useMobileNavOverlay';

const NAV_LINKS = ['Product', 'Fleet', 'Pricing', 'Docs'] as const;

function MobileNavOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  useMobileNavOverlay(overlayRef, isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') onClose();
          }}
        >
          <div className="flex items-center justify-between px-6 py-6">
            <span className="text-xl font-extrabold tracking-tight text-white">
              Swift<span className="text-blue-500">Chain</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-600 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav aria-label="Primary" className="flex flex-1 flex-col justify-center gap-2 px-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                onClick={onClose}
                className="flex min-h-[44px] items-center rounded-lg px-3 text-lg font-medium text-gray-200 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {link}
              </a>
            ))}
          </nav>

          <div className="px-6 pb-10">
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-blue-600 px-6 text-base font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              Sign In
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * MobileHero — touch-optimized mobile top navigation and hero section.
 * The hamburger menu opens a full-screen overlay that traps focus and
 * disables body scroll while active (see useMobileNavOverlay). All CTAs
 * and the nav toggle meet the 44px minimum touch target.
 */
export function MobileHero() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { content, isLoading, error } = useMobileHeroContent();

  return (
    <section className="relative bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <nav aria-label="Primary" className="flex items-center justify-between px-4 py-4">
        <span className="text-lg font-extrabold tracking-tight text-white">
          Swift<span className="text-blue-500">Chain</span>
        </span>

        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-600 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Menu className="h-5 w-5" />
        </button>
      </nav>

      <MobileNavOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div className="px-4 py-14 text-center">
        {error ? (
          <p role="alert" className="mx-auto max-w-sm text-sm text-red-400">
            {error}
          </p>
        ) : isLoading || !content ? (
          <div className="mx-auto max-w-sm animate-pulse space-y-4" aria-label="Loading hero content">
            <div className="mx-auto h-6 w-40 rounded-full bg-white/10" />
            <div className="mx-auto h-16 w-full rounded bg-white/10" />
            <div className="mx-auto h-11 w-full max-w-xs rounded-lg bg-white/10" />
          </div>
        ) : (
          <>
            <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-semibold tracking-wide text-emerald-400">
              {content.networkBadge}
            </span>

            <h1 className="mt-5 text-balance text-3xl font-extrabold leading-tight">
              {content.headline}
            </h1>

            <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-gray-300">
              {content.subheadline}
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <a
                href={content.primaryCta.href}
                className="flex min-h-[44px] items-center justify-center rounded-lg bg-blue-600 px-6 text-base font-semibold shadow-lg transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                {content.primaryCta.label}
              </a>
              <a
                href={content.secondaryCta.href}
                className="flex min-h-[44px] items-center justify-center rounded-lg border border-gray-600 px-6 text-base font-semibold transition hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                {content.secondaryCta.label}
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default MobileHero;
