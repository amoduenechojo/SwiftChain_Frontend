'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useSettlementDiagram } from '@/hooks/useSettlementDiagram';
import type { OrbitalElement, SettlementFeature } from '@/types/settlement';

const ORBIT_RADIUS = 140; // px — distance of each orbital element from the center
const ORBIT_DURATION = 18; // seconds per full revolution

function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(getPrefersReducedMotion);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (event: MediaQueryListEvent) => setPrefersReduced(event.matches);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);

  return prefersReduced;
}

function LoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading settlement diagram" className="grid gap-12 lg:grid-cols-2 lg:items-center">
      <div className="mx-auto h-80 w-80 animate-pulse rounded-full bg-gray-100" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 p-12 text-center">
      <p className="text-sm text-red-600">{message}</p>
      <button
        onClick={onRetry}
        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
      >
        Try again
      </button>
    </div>
  );
}

interface OrbitProps {
  centralLabel: string;
  orbitalElements: OrbitalElement[];
  reduceMotion: boolean;
}

function Orbit({ centralLabel, orbitalElements, reduceMotion }: OrbitProps) {
  const angleStep = 360 / orbitalElements.length;

  return (
    <div className="relative mx-auto h-80 w-80" aria-hidden="true">
      {/* Orbit path */}
      <svg viewBox="0 0 320 320" className="absolute inset-0 h-full w-full">
        <circle
          cx="160"
          cy="160"
          r={ORBIT_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeDasharray="4 8"
          strokeWidth="1"
          className="text-gray-200"
        />
      </svg>

      {/* Central node with pulsing rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {!reduceMotion && (
          <>
            <motion.span
              className="absolute inset-0 rounded-full bg-primary/30"
              animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.span
              className="absolute inset-0 rounded-full bg-primary/20"
              animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
            />
          </>
        )}
        <div className="relative flex h-28 w-28 flex-col items-center justify-center rounded-full bg-primary text-center shadow-lg">
          <span className="px-2 text-xs font-semibold leading-tight text-white">{centralLabel}</span>
        </div>
      </div>

      {/* Orbital elements */}
      <motion.div
        className="absolute inset-0"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: ORBIT_DURATION, repeat: Infinity, ease: 'linear' }}
      >
        {orbitalElements.map((element, index) => {
          const angle = angleStep * index;
          return (
            <div
              key={element.id}
              className="absolute left-1/2 top-1/2 h-0 w-0"
              style={{ transform: `rotate(${angle}deg) translate(${ORBIT_RADIUS}px)` }}
            >
              <motion.div
                animate={reduceMotion ? undefined : { rotate: -360 }}
                transition={{ duration: ORBIT_DURATION, repeat: Infinity, ease: 'linear' }}
              >
                <div
                  style={{ transform: `rotate(${-angle}deg)` }}
                  className="-translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm"
                >
                  {element.label}
                </div>
              </motion.div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

function FeatureList({ features }: { features: SettlementFeature[] }) {
  return (
    <ul className="space-y-5">
      {features.map((feature) => (
        <li key={feature.id} className="flex gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
          <div>
            <p className="font-semibold text-gray-900">{feature.title}</p>
            <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * SettlementDiagram
 *
 * Animated automated settlement flow diagram: a central "Instant Payouts" node
 * with continuously orbiting elements, alongside the supporting feature list.
 *
 * Architecture: Component → Hook (useSettlementDiagram) → Service (settlementService)
 * Data source: backend API via settlementService.getSettlementDiagram()
 */
export function SettlementDiagram() {
  const { data, isLoading, error, refetch } = useSettlementDiagram();
  const reduceMotion = usePrefersReducedMotion();

  return (
    <section aria-label="Automated settlement flow" className="px-6 py-20 sm:py-28">
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : data ? (
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:items-center">
          <Orbit
            centralLabel={data.centralLabel}
            orbitalElements={data.orbitalElements}
            reduceMotion={reduceMotion}
          />
          <FeatureList features={data.features} />
        </div>
      ) : null}
    </section>
  );
}

export default SettlementDiagram;
