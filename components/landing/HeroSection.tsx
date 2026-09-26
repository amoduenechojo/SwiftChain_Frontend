'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useHeroStats } from '@/hooks/useHeroStats';
import type { HeroStat } from '@/services/landingService';

const NAV_LINKS = ['Product', 'Fleet', 'Pricing', 'Docs'] as const;

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
}

function AnimatedCounter({ value, suffix = '' }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 90,
  });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, motionValue, value]);

  useEffect(() => {
    return springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${Math.round(latest).toLocaleString()}${suffix}`;
      }
    });
  }, [springValue, suffix]);

  return (
    <span ref={ref} aria-live="polite">
      0{suffix}
    </span>
  );
}

interface StatCardProps {
  stat: HeroStat;
}

function StatCard({ stat }: StatCardProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-5 text-center backdrop-blur-sm sm:px-6">
      <span className="text-2xl font-bold text-white sm:text-3xl">
        <AnimatedCounter value={stat.value} suffix={stat.suffix} />
      </span>
      <span className="text-xs uppercase tracking-wide text-gray-400 sm:text-sm">
        {stat.label}
      </span>
    </div>
  );
}

function HeroNav() {
  return (
    <nav
      aria-label="Primary"
      className="flex items-center justify-between px-6 py-6 sm:px-10"
    >
      <span className="text-xl font-extrabold tracking-tight text-white">
        Swift<span className="text-blue-500">Chain</span>
      </span>

      <ul className="hidden items-center gap-8 md:flex">
        {NAV_LINKS.map((link) => (
          <li key={link}>
            <a
              href={`#${link.toLowerCase()}`}
              className="text-sm font-medium text-gray-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="hidden rounded-lg border border-gray-600 px-5 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:inline-flex"
        >
          Sign In
        </button>
        <button
          type="button"
          aria-label="Open menu"
          className="inline-flex items-center justify-center rounded-lg border border-gray-600 p-2 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
}

export function HeroSection() {
  const { stats, isLoading } = useHeroStats();

  return (
    <section className="relative bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <HeroNav />

      <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28 lg:py-32">
        <p className="text-xs font-medium uppercase tracking-widest text-blue-400 sm:text-sm">
          Logistics Reimagined
        </p>

        <h1 className="mt-6 text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
          Deliver Anything.
          <br />
          <span className="text-blue-500">Pay Only When It Arrives.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base opacity-80 sm:text-lg lg:text-xl">
          SwiftChain protects your deliveries using blockchain escrow. Funds
          stay locked until delivery is completed — eliminating fraud,
          disputes, and payment risks.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold shadow-lg transition hover:scale-[1.03] hover:bg-blue-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Secure Your Shipment
          </button>

          <button
            type="button"
            className="rounded-lg border border-gray-600 px-8 py-4 font-semibold transition hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            See How It Works
          </button>
        </div>

        <p className="pt-6 text-sm opacity-60">
          Secure escrow • Instant settlement • Transparent logistics
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-20 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {isLoading || stats.length === 0
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-xl border border-white/10 bg-white/5"
                />
              ))
            : stats.map((stat) => <StatCard key={stat.id} stat={stat} />)}
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
