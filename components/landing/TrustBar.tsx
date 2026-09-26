'use client';

import React from 'react';
import { useTrustBar } from '@/hooks/useTrustBar';

/**
 * SVG icons for Ethereum, Solana, Polygon, Arbitrum, Optimism.
 * Standard inline SVG renderings to ensure sharp vector presentation & crisp aspect ratios.
 */
const DEFAULT_LOGOS: Record<string, React.ReactNode> = {
  ethereum: (
    <svg viewBox="0 0 784 1277" fill="none" className="w-6 h-6 md:w-8 md:h-8" aria-label="Ethereum logo">
      <path fill="#627EEA" d="M392.07 0L383.5 29.1V873.74L392.07 882.29L784.13 650.54L392.07 0Z" />
      <path fill="#8A92B2" d="M392.07 0L0 650.54L392.07 882.29V472.03V0Z" />
      <path fill="#627EEA" d="M392.07 956.52L387.24 962.37V1266.32L392.07 1276.7L784.37 724.89L392.07 956.52Z" />
      <path fill="#8A92B2" d="M392.07 1276.7V956.52L0 724.89L392.07 1276.7Z" />
      <path fill="#454A75" d="M392.07 882.29L784.13 650.54L392.07 472.03V882.29Z" />
      <path fill="#8A92B2" d="M0 650.54L392.07 882.29V472.03L0 650.54Z" />
    </svg>
  ),
  solana: (
    <svg viewBox="0 0 512 355" fill="none" className="w-7 h-5 md:w-9 md:h-6" aria-label="Solana logo">
      <path
        d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h427.4c6.3 0 9.5 7.6 5.1 12L447.4 305c-2.4 2.4-5.7 3.8-9.2 3.8H10.8c-6.3 0-9.5-7.6-5.1-12l58.9-58.9zM64.6 3.9C67 1.5 70.3.1 73.8.1h427.4c6.3 0 9.5 7.6 5.1 12L447.4 71c-2.4 2.4-5.7 3.8-9.2 3.8H10.8c-6.3 0-9.5-7.6-5.1-12L64.6 3.9zM447.4 120.9c-2.4-2.4-5.7-3.8-9.2-3.8H10.8c-6.3 0-9.5 7.6-5.1 12l58.9 58.9c2.4 2.4 5.7 3.8 9.2 3.8h427.4c6.3 0 9.5-7.6 5.1-12l-58.9-58.9z"
        fill="url(#solana_grad)"
      />
      <defs>
        <linearGradient id="solana_grad" x1="0" y1="0" x2="512" y2="355" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00FFA3" />
          <stop offset="1" stopColor="#DC1FFF" />
        </linearGradient>
      </defs>
    </svg>
  ),
  polygon: (
    <svg viewBox="0 0 38 33" fill="none" className="w-6 h-6 md:w-8 md:h-8" aria-label="Polygon logo">
      <path
        d="M29 10.2L19 4.4L9 10.2V21.8L19 27.6L29 21.8V10.2Z"
        stroke="#8247E5"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M19 12.5L13.5 15.7V22.1L19 25.3L24.5 22.1V15.7L19 12.5Z"
        fill="#8247E5"
      />
    </svg>
  ),
  arbitrum: (
    <svg viewBox="0 0 500 500" fill="none" className="w-6 h-6 md:w-8 md:h-8" aria-label="Arbitrum logo">
      <path d="M249.9 29.8L38.2 396.4H144.3L249.9 229.4L355.5 396.4H461.6L249.9 29.8Z" fill="#28A0F0" />
      <path d="M249.9 148.5L163.5 298.5H202.9L249.9 217.1L296.9 298.5H336.3L249.9 148.5Z" fill="#96BEDC" />
      <path d="M102.3 396.4L188.7 246.4H139.4L80.1 349.1L102.3 396.4Z" fill="#28A0F0" />
    </svg>
  ),
  optimism: (
    <svg viewBox="0 0 100 100" fill="none" className="w-6 h-6 md:w-8 md:h-8" aria-label="Optimism logo">
      <circle cx="50" cy="50" r="45" fill="#FF0420" />
      <text x="50" y="62" fontSize="36" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="sans-serif">OP</text>
    </svg>
  ),
};

/**
 * TrustBar — responsive landing page trust bar and secondary stats layout.
 * Displays 'Securing transactions' header and Ethereum, Solana, Polygon, Arbitrum, Optimism logos
 * in a responsive flex row with hover opacity shifts, plus secondary statistics.
 */
export function TrustBar() {
  const { data, isLoading, error } = useTrustBar();

  if (error) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-2xl rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-400"
      >
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full py-12 px-6 bg-black/40 border-y border-white/10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
          <div className="h-6 w-48 bg-white/10 rounded mx-auto" />
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-24 bg-white/10 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const headerText = data?.header || 'Securing transactions';
  const networks = data?.networks || [];
  const stats = data?.stats || [];

  return (
    <section className="w-full py-14 px-6 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border-y border-white/10 text-white backdrop-blur-md">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Network Trust Row */}
        <div className="space-y-6 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
            {headerText}
          </p>

          <div
            aria-label="Supported Blockchain Networks"
            className="flex flex-wrap items-center justify-center gap-6 md:gap-12"
          >
            {networks.map((net) => {
              const iconKey = net.id.toLowerCase();
              const logo = DEFAULT_LOGOS[iconKey];

              return (
                <div
                  key={net.id}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-sm opacity-70 hover:opacity-100 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-blue-500/10"
                >
                  <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                    {logo || (
                      <span
                        className="w-6 h-6 flex items-center justify-center text-xs font-bold bg-blue-500/20 text-blue-400 rounded-full"
                        dangerouslySetInnerHTML={{ __html: net.logoSvg }}
                      />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                    {net.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Secondary Stats Layout */}
        {stats.length > 0 && (
          <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all text-center group"
              >
                <div className="text-3xl font-extrabold text-white group-hover:text-blue-400 transition-colors">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-gray-300 mt-1">
                  {stat.label}
                </div>
                {stat.subtext && (
                  <div className="text-xs text-gray-400 mt-1">
                    {stat.subtext}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
