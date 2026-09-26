'use client';

import { useNetworkPathways } from '@/hooks/useNetworkPathways';
import type { NetworkPathwayIcon } from '@/types/networkPathways';

/**
 * Custom thin-stroke line icons for the pathway cards. Kept as small,
 * hand-drawn glyphs (not an icon library import) since each represents a
 * distinct concept — a multi-bay warehouse for enterprises, a route line
 * with a truck for independent carriers.
 */
function EnterpriseIcon() {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8"
      aria-hidden="true"
    >
      <path d="M6 34V14l8-6 8 6v20" />
      <path d="M22 34V20l8-4 4 2v16" />
      <path d="M11 34v-6h6v6" />
      <path d="M18 22h0M18 27h0M11 22h0M11 27h0" strokeWidth="2.5" />
    </svg>
  );
}

function CarrierIcon() {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8"
      aria-hidden="true"
    >
      <path d="M4 26h16V15H4v11z" />
      <path d="M20 19h6l6 5v2h-2" />
      <circle cx="11" cy="30" r="3" />
      <circle cx="27" cy="30" r="3" />
      <path d="M14 30h10" />
    </svg>
  );
}

const ICONS: Record<NetworkPathwayIcon, () => React.JSX.Element> = {
  enterprise: EnterpriseIcon,
  carrier: CarrierIcon,
};

/**
 * NetworkPathways — "Architected for Scale" split card layout showing the
 * two ways an organization joins the network (Logistics Enterprises,
 * Independent Carriers). Cards sit side by side from the md breakpoint
 * (768px) up and stack vertically below it.
 */
export function NetworkPathways() {
  const { cards, isLoading, error } = useNetworkPathways();

  if (error) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-2xl rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-400"
      >
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6" aria-label="Network pathways">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-blue-400 sm:text-sm">
          Architected for Scale
        </p>
        <h2 className="mt-3 text-balance text-3xl font-extrabold text-white sm:text-4xl">
          Built for every kind of operator
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {isLoading &&
          Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-2xl border border-white/10 bg-white/5"
            />
          ))}

        {!isLoading &&
          cards.map((card) => {
            const Icon = ICONS[card.icon];
            return (
              <div
                key={card.id}
                className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition hover:-translate-y-1 hover:border-blue-500/40 hover:bg-white/[0.08]"
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-blue-400 transition group-hover:border-blue-500/40 group-hover:text-blue-300">
                  <Icon />
                </div>

                <h3 className="mt-5 text-xl font-semibold text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">
                  {card.description}
                </p>

                <a
                  href={card.cta.href}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-400 transition group-hover:gap-2.5 group-hover:text-blue-300"
                >
                  {card.cta.label}
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default NetworkPathways;
