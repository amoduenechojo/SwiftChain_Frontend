import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { IndustrySplitFeature } from '@/types/industry';

interface IndustrySplitSectionProps {
  feature: IndustrySplitFeature;
  /** The first section on the page renders its image eagerly (LCP candidate). */
  priority?: boolean;
}

/**
 * IndustrySplitSection — presentational split feature block (e.g. "Enterprise
 * Logistics") pairing copy with the command center screenshot.
 *
 * The image is rendered with next/image using the intrinsic width/height from
 * the API so the browser reserves the box up front and the layout does not
 * shift while the asset loads.
 */
export function IndustrySplitSection({
  feature,
  priority = false,
}: IndustrySplitSectionProps) {
  const headingId = `industry-feature-${feature.id}`;
  const imageFirst = feature.imagePosition === 'left';

  return (
    <section
      aria-labelledby={headingId}
      className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16"
    >
      <div className={cn(imageFirst && 'lg:order-2')}>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
          {feature.eyebrow}
        </p>

        <h2
          id={headingId}
          className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
        >
          {feature.title}
        </h2>

        <p className="mt-4 text-base leading-8 text-slate-300">
          {feature.description}
        </p>

        {feature.highlights.length > 0 && (
          <ul className="mt-8 space-y-5">
            {feature.highlights.map((highlight) => (
              <li key={highlight.id} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-400"
                />
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {highlight.title}
                  </h3>
                  <p className="mt-1 text-sm leading-7 text-slate-400">
                    {highlight.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {feature.cta && (
          <Link
            href={feature.cta.href}
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            {feature.cta.label}
            <span aria-hidden="true">&rarr;</span>
          </Link>
        )}
      </div>

      <div className={cn(imageFirst && 'lg:order-1')}>
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-2 shadow-2xl shadow-cyan-500/10">
          <Image
            src={feature.image.src}
            alt={feature.image.alt}
            width={feature.image.width}
            height={feature.image.height}
            priority={priority}
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="h-auto w-full rounded-2xl"
          />
        </div>
      </div>
    </section>
  );
}
